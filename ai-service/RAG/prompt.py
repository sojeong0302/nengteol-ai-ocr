# RAG 기반 클로바 AI 영양 컨설팅 시스템

import json
import requests
import numpy as np
from datetime import datetime
from sentence_transformers import SentenceTransformer
import pickle
import os
from api_client import FoodAPIClient
from config import CLOVA_CONFIG, RAG_CONFIG

class NutritionRAGSystem:
    def __init__(self):
        self.food_client = FoodAPIClient()
        self.embedding_model = None
        self.food_embeddings = {}
        self.food_database = {}
        
        # 임베딩 모델 로드
        self._load_embedding_model()
        
        # 임베딩 데이터 로드
        self._load_embeddings()
    
    def _load_embedding_model(self):
        """임베딩 모델 로드"""
        try:
            print("임베딩 모델 로딩 중...")
            self.embedding_model = SentenceTransformer(RAG_CONFIG["embedding_model"])
            print("임베딩 모델 로드 완료")
        except Exception as e:
            print(f"임베딩 모델 로드 실패: {e}")
            self.embedding_model = None
    
    def _load_embeddings(self):
        """저장된 임베딩 데이터 로드"""
        embeddings_path = os.path.join(RAG_CONFIG["embeddings_dir"], "food_embeddings.pkl")
        database_path = os.path.join(RAG_CONFIG["embeddings_dir"], "food_database.pkl")
        
        try:
            if os.path.exists(embeddings_path) and os.path.exists(database_path):
                with open(embeddings_path, 'rb') as f:
                    self.food_embeddings = pickle.load(f)
                with open(database_path, 'rb') as f:
                    self.food_database = pickle.load(f)
                print(f"임베딩 데이터 로드 완료: {len(self.food_database)}개 식품")
        except Exception as e:
            print(f"임베딩 데이터 로드 실패: {e}")
    
    def _save_embeddings(self):
        """임베딩 데이터 저장"""
        os.makedirs(RAG_CONFIG["embeddings_dir"], exist_ok=True)
        
        embeddings_path = os.path.join(RAG_CONFIG["embeddings_dir"], "food_embeddings.pkl")
        database_path = os.path.join(RAG_CONFIG["embeddings_dir"], "food_database.pkl")
        
        try:
            with open(embeddings_path, 'wb') as f:
                pickle.dump(self.food_embeddings, f)
            with open(database_path, 'wb') as f:
                pickle.dump(self.food_database, f)
            print("임베딩 데이터 저장 완료")
        except Exception as e:
            print(f"임베딩 데이터 저장 실패: {e}")
    
    def add_food_to_database(self, food_name):
        """새로운 식품을 데이터베이스에 추가"""
        if food_name in self.food_database:
            return
        
        # API에서 영양성분 정보 가져오기
        nutrition_info = self.food_client.get_nutrition_info(food_name)
        
        if not nutrition_info:
            return
        
        # 임베딩 생성
        if self.embedding_model:
            embedding = self.embedding_model.encode([food_name])[0]
            self.food_embeddings[food_name] = embedding
        
        # 데이터베이스에 저장
        self.food_database[food_name] = nutrition_info
        
        # 저장
        self._save_embeddings()
        
        print(f"식품 추가 완료: {food_name}")
    
    def find_similar_foods(self, query, top_k=5):
        """유사한 식품 찾기"""
        if not self.embedding_model or not self.food_embeddings:
            return []
        
        # 쿼리 임베딩
        query_embedding = self.embedding_model.encode([query])[0]
        
        # 유사도 계산
        similarities = []
        for food_name, embedding in self.food_embeddings.items():
            similarity = np.dot(query_embedding, embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(embedding)
            )
            similarities.append((food_name, similarity))
        
        # 정렬 및 상위 k개 반환
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # 임계값 이상인 것만 반환
        threshold = RAG_CONFIG["similarity_threshold"]
        return [(name, score) for name, score in similarities[:top_k] if score >= threshold]
    
    def call_clova_ai(self, prompt):
        """클로바 AI API 호출"""
        url = "https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions/HCX-005"
        
        headers = {
            "X-NCP-CLOVASTUDIO-API-KEY": CLOVA_CONFIG["api_key"],
            "X-NCP-APIGW-API-KEY": CLOVA_CONFIG["api_key_primary"], 
            "X-NCP-CLOVASTUDIO-REQUEST-ID": CLOVA_CONFIG["request_id"],
            "Content-Type": "application/json"
        }
        
        data = {
            "messages": [
                {
                    "role": "system",
                    "content": "당신은 영양 전문가입니다. 식품 영양성분 데이터를 바탕으로 건강한 식생활을 위한 조언을 제공합니다."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            "topP": 0.8,
            "topK": 0,
            "maxTokens": CLOVA_CONFIG["max_tokens"],
            "temperature": CLOVA_CONFIG["temperature"],
            "repeatPenalty": 5.0,
            "stopBefore": [],
            "includeAiFilters": True
        }
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            return result["result"]["message"]["content"]
            
        except Exception as e:
            print(f"클로바 AI 호출 오류: {e}")
            return f"AI 응답 생성 중 오류가 발생했습니다: {str(e)}"
    
    def generate_nutrition_advice(self, food_query):
        """영양 조언 생성 (RAG + 클로바 AI)"""
        
        # 1. 직접 검색
        nutrition_info = self.food_client.get_nutrition_info(food_query)
        
        # 2. 유사 식품 검색
        similar_foods = self.find_similar_foods(food_query)
        
        # 3. 컨텍스트 구성
        context = f"요청한 식품: {food_query}\\n\\n"
        
        if nutrition_info:
            context += "영양성분 정보:\\n"
            for info in nutrition_info[:3]:  # 상위 3개만
                context += f"- {info['식품명']}: {info['에너지']}, 탄수화물 {info['탄수화물']}, 단백질 {info['단백질']}, 지방 {info['지방']}\\n"
        
        if similar_foods:
            context += "\\n유사한 식품들:\\n"
            for food_name, similarity in similar_foods[:3]:
                context += f"- {food_name} (유사도: {similarity:.2f})\\n"
        
        # 4. 클로바 AI 프롬프트 생성
        prompt = f"""
        다음 식품에 대한 영양 분석과 건강 조언을 제공해주세요:

        {context}

        다음 내용을 포함해서 답변해주세요:
        1. 주요 영양성분 분석
        2. 건강상 장점과 주의점
        3. 권장 섭취량과 빈도
        4. 함께 먹으면 좋은 음식 추천
        5. 다이어트나 건강관리 관점에서의 조언

        친근하고 이해하기 쉽게 설명해주세요.
        """
        
        # 5. 클로바 AI 호출
        ai_response = self.call_clova_ai(prompt)
        
        # 6. 결과 구성
        result = {
            "query": food_query,
            "timestamp": datetime.now().isoformat(),
            "nutrition_data": nutrition_info,
            "similar_foods": similar_foods,
            "ai_advice": ai_response
        }
        
        return result
    
    def chat_nutrition(self, user_message):
        """영양 상담 채팅"""
        return self.generate_nutrition_advice(user_message)

# 테스트용 함수
def test_rag_system():
    rag = NutritionRAGSystem()
    
    # 테스트 쿼리
    test_query = "돈까스"
    print(f"테스트 쿼리: {test_query}")
    
    result = rag.generate_nutrition_advice(test_query)
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    test_rag_system()