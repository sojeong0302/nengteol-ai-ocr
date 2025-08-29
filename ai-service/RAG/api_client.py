# 식약처 API 클라이언트

import requests
import json
import os
from datetime import datetime, timedelta
from config import FOOD_API_CONFIG, CACHE_CONFIG

class FoodAPIClient:
    def __init__(self):
        self.base_url = FOOD_API_CONFIG["base_url"]
        self.endpoint = FOOD_API_CONFIG["endpoint"]
        self.api_key = FOOD_API_CONFIG["api_key_decoding"]  # 디코딩된 키 사용
        self.cache_dir = CACHE_CONFIG["cache_dir"]
        self.cache_duration = CACHE_CONFIG["cache_duration"]
        
        # 캐시 디렉토리 생성
        os.makedirs(self.cache_dir, exist_ok=True)
    
    def _get_cache_path(self, food_name):
        """캐시 파일 경로 생성"""
        safe_name = "".join(c for c in food_name if c.isalnum() or c in (' ', '_')).strip()
        return os.path.join(self.cache_dir, f"{safe_name}.json")
    
    def _is_cache_valid(self, cache_path):
        """캐시가 유효한지 확인"""
        if not os.path.exists(cache_path):
            return False
        
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
            
            cache_time = datetime.fromisoformat(cache_data.get('timestamp', ''))
            return datetime.now() - cache_time < timedelta(seconds=self.cache_duration)
        except:
            return False
    
    def _save_cache(self, cache_path, data):
        """캐시 저장"""
        cache_data = {
            'timestamp': datetime.now().isoformat(),
            'data': data
        }
        
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)
    
    def _load_cache(self, cache_path):
        """캐시 로드"""
        with open(cache_path, 'r', encoding='utf-8') as f:
            cache_data = json.load(f)
        return cache_data['data']
    
    def search_food_nutrition(self, food_name, use_cache=True):
        """
        식품 영양성분 검색
        
        Args:
            food_name (str): 검색할 식품명
            use_cache (bool): 캐시 사용 여부
        
        Returns:
            dict: API 응답 데이터
        """
        cache_path = self._get_cache_path(food_name)
        
        # 캐시 확인
        if use_cache and self._is_cache_valid(cache_path):
            print(f"캐시에서 데이터 로드: {food_name}")
            return self._load_cache(cache_path)
        
        # API 호출
        url = f"{self.base_url}{self.endpoint}"
        params = {
            'serviceKey': self.api_key,
            'type': 'json',
            'FOOD_NM': food_name,  # 식품명으로 검색
            'numOfRows': 10,       # 최대 10개 결과
            'pageNo': 1
        }
        
        try:
            print(f"API 호출: {food_name}")
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # 캐시 저장
            if use_cache:
                self._save_cache(cache_path, data)
            
            return data
            
        except requests.RequestException as e:
            print(f"API 호출 오류: {e}")
            return {"error": str(e)}
    
    def get_nutrition_info(self, food_name):
        """
        식품 영양성분 정보 추출 (간소화된 형태)
        
        Args:
            food_name (str): 식품명
            
        Returns:
            list: 영양성분 정보 리스트
        """
        api_data = self.search_food_nutrition(food_name)
        
        if "error" in api_data:
            return []
        
        try:
            items = api_data.get("body", {}).get("items", [])
            nutrition_list = []
            
            for item in items:
                nutrition_info = {
                    "식품명": item.get("FOOD_NM", ""),
                    "식품분류": item.get("FOOD_CL_NM", ""),
                    "에너지": f"{item.get('AMT_NUM1', 0)}kcal",
                    "탄수화물": f"{item.get('AMT_NUM3', 0)}g",
                    "단백질": f"{item.get('AMT_NUM4', 0)}g", 
                    "지방": f"{item.get('AMT_NUM5', 0)}g",
                    "당류": f"{item.get('AMT_NUM6', 0)}g",
                    "나트륨": f"{item.get('AMT_NUM7', 0)}mg",
                    "콜레스테롤": f"{item.get('AMT_NUM8', 0)}mg",
                    "기준량": f"{item.get('AMT_NUM2', 100)}g"
                }
                nutrition_list.append(nutrition_info)
            
            return nutrition_list
            
        except Exception as e:
            print(f"데이터 파싱 오류: {e}")
            return []

# 테스트용 함수
if __name__ == "__main__":
    client = FoodAPIClient()
    result = client.get_nutrition_info("돈까스")
    print(json.dumps(result, ensure_ascii=False, indent=2))