import sys
import json
from dotenv import load_dotenv, find_dotenv
from langchain_naver import ChatClovaX
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser

# --- 1. JSON 객체에서 특정 유저의 선호/비선호 정보를 추출하는 함수 ---
def get_user_preferences_from_json(pre, user_index=0):
    """
    JSON 객체에서 특정 인덱스의 사용자 선호/비선호 정보를 추출합니다.
    """
    try:
        if not isinstance(pre, dict):
            return None
            
        if 'users' not in pre:
            return None
            
        users = pre['users']
        if not isinstance(users, list) or len(users) <= user_index:
            return None
            
        user_data = users[user_index]
        return {
            "good": user_data.get('good', '정보 없음'),
            "bad": user_data.get('bad', '정보 없음')
        }
    except Exception as e:
        return None

# --- 2. 환경 설정 및 LLM 생성 ---
_ = load_dotenv(find_dotenv())
api_key = "nv-9e4ca85b66394f10a8baeb377175272cNXTs"
llm = ChatClovaX(model="HCX-007", api_key=api_key)

# --- 3. LangChain 프롬프트 템플릿 및 체인 생성 ---
system_prompt_template = """
# Persona
너는 사용자의 요청을 분석하여, 오직 JSON 데이터만을 생성하는 **레시피 데이터 포맷팅 전문 AI**다. 너의 유일한 임무는 주어진 모든 규칙과 스키마를 완벽하게 준수하는 단 하나의 유효한 JSON 객체를 출력하는 것이다.

# Main Task
사용자가 제공한 재료 정보와 사용자 선호도를 바탕으로, 아래에 명시된 JSON 스키마에 따라 최적의 요리 레시피 1개를 생성한다.

# Core Instructions
1.  **사용자 선호도 분석**: `{user_preferences}` 내용을 분석하여, 'good' 스타일은 적극 반영하고 'bad' 재료나 스타일은 절대 포함하지 않는다.
2.  **재료 활용**: `{user_request}`에 있는 재료를 **최소 2가지 이상 반드시 포함**한다.
3.  **레시피 규칙**:
    * 난이도는 '초급' 수준으로 작성한다.
    * `cooking_steps`의 `instruction` 항목에는 요리 과정과 함께 "꿀팁🍯"이나 "주의사항🚨"을 포함할 수 있다.
    * 모든 재료의 영양성분을 계산하여 `nutrition_info`에 빠짐없이 기입한다.
    * 모든 텍스트는 한국어로 작성한다.

# Output Rules (절대 규칙)
1.  너의 응답은 **시작부터 끝까지 오직 하나의 완벽한 JSON 객체**여야 한다.
2.  JSON 객체 외부에는 어떠한 설명, 인사, 노트, 요약, 코드블록(```)도 절대 추가해서는 안 된다.
3.  아래의 **JSON Schema**를 반드시, 정확하게 준수해야 한다.

---
# JSON Schema (반드시 이 구조를 따를 것)
{{
    "recipe": {{
        "name": "String - 요리 제목",
        "description": "String - 메뉴 추천 이유를 포함한 1~2 문장의 요리 설명 \n "String - 예상 소요 시간 (예: 약 20분) \n String - 인분 수 (예: 1인분)"
        "ingredients": [
            {{
                "name": "String - 재료명",
                "count": "Integer - 1~9 사이의 정수"
            }}
        ],
        "cooking_steps": //줄바꿈을 포함한 하나의 문자열
                "1. 해당 단계의 구체적인 조리 과정 설명
                2. 해당 단계의 구체적인 조리 과정 설명
                3. 해당 단계의 구체적인 조리 과정 설명
                ...
                팁! 완성된 요리와 어울리는 음식, 보관 방법 등 추가 정보"
        ,
        
        "nutrition": {{
            "ingredients": [
                "재료1 (칼로리, 탄수화물, 단백질, 지방, 당류)",
                "재료2 (칼로리, 탄수화물, 단백질, 지방, 당류)",
                "재료3 (칼로리, 탄수화물, 단백질, 지방, 당류)"
            ],
            "total": "전체 (칼로리, 탄수화물, 단백질, 지방, 당류)"
        }}
    }}
}}
---

이제 사용자 요청에 대한 JSON 응답을 생성하라.
사용자 요청(보유 재료 목록): {user_request}
"""

# ChatPromptTemplate을 사용하여 프롬프트 구조를 정의합니다.
prompt = ChatPromptTemplate.from_template(system_prompt_template)
chain = prompt | llm | StrOutputParser()

# --- 4. 메인 실행 함수 ---
def generate_recipe_from_json(pre, user_index=1):
    """
    JSON 객체를 입력받아 레시피를 생성하고 결과를 반환하는 함수
    """
    
    # 1. 사용자 선호도 정보 추출
    user_prefs = get_user_preferences_from_json(pre, user_index)
    
    if not user_prefs:
        return None
    
    preferences_text = f"""
    * 선호(good): {user_prefs['good']}
    * 비선호(bad): {user_prefs['bad']}
    """
    
    # 2. 사용자 보유 재료 목록
    user_request_ingredients = [
        {"name": "당근", "count": 2}, {"name": "삼겹살", "count": 1},
        {"name": "대파", "count": 1}, {"name": "양배추", "count": 4},
        {"name": "달걀", "count": 1}, {"name": "양파", "count": 1},
        {"name": "가지", "count": 1}, {"name": "토마토 소스", "count": 1},
        {"name": "모짜렐라 치즈", "count": 6}, {"name": "양송이버섯", "count": 1},
        {"name": "마늘", "count": 1}, {"name": "펜네 파스타면", "count": 1},
        {"name": "올리브유", "count": 1}, {"name": "우유", "count": 1},
        {"name": "식빵", "count": 1}, {"name": "슬라이스 햄", "count": 1},
        {"name": "김치", "count": 1}, {"name": "두부", "count": 1},
        {"name": "콩나물", "count": 1}, {"name": "어묵", "count": 1},
        {"name": "깻잎", "count": 1}, {"name": "청양고추", "count": 1},
        {"name": "사과", "count": 1}, {"name": "바나나", "count": 1},
        {"name": "플레인 요거트", "count": 1}, {"name": "쌈장", "count": 1},
        {"name": "버터", "count": 1}, {"name": "냉동 만두", "count": 2},
        {"name": "생수", "count": 1}, {"name": "콜라", "count": 1},
        {"name": "맥주", "count": 1}
    ]
    user_request_text = json.dumps(user_request_ingredients, ensure_ascii=False)

    # 3. LLM 호출 및 재시도 로직
    final_recipe_data = None
    max_retries = 3  # Node.js에서는 응답 시간을 고려하여 3번으로 줄임

    for attempt in range(max_retries):
        # 3-1. LLM 호출
        response_content = chain.invoke({
            "user_preferences": preferences_text,
            "user_request": user_request_text
        })

        # 3-2. 코드 블록 마크다운 제거
        cleaned_content = response_content.strip()
        if cleaned_content.startswith("```json"):
            cleaned_content = cleaned_content[7:]
        if cleaned_content.endswith("```"):
            cleaned_content = cleaned_content[:-3]
        cleaned_content = cleaned_content.strip()

        # 3-3. JSON 파싱 시도
        try:
            recipe_data = json.loads(cleaned_content)
        except json.JSONDecodeError:
            continue  # 다음 시도로 넘어감

        # 3-4. 'count' 값 유효성 검사
        is_valid = True
        ingredients = recipe_data.get('recipe', {}).get('ingredients', [])
        if not ingredients:
            is_valid = False
        else:
            for item in ingredients:
                count = item.get('count')
                if count is None or not isinstance(count, int):
                    is_valid = False
                    break
        
        # 3-5. 모든 검증 통과 시 루프 종료
        if is_valid:
            final_recipe_data = recipe_data
            break
        
    return final_recipe_data

# --- 5. 명령줄 인수 처리 또는 표준 입력 처리 ---
def main():
    try:
        if len(sys.argv) >= 3:
            # 방법 1: 명령줄 인수로 받은 경우
            json_string = sys.argv[1]
            user_index = int(sys.argv[2])
            pre = json.loads(json_string)
        elif len(sys.argv) == 2:
            # 방법 2: 파일 경로로 받은 경우
            file_path = sys.argv[1]
            with open(file_path, 'r', encoding='utf-8') as f:
                pre = json.load(f)
            user_index = 1
        else:
            # 방법 3: 표준 입력으로 받은 경우 (spawn 방법용)
            input_data = sys.stdin.read()
            data = json.loads(input_data)
            pre = data['userPreferences']
            user_index = data['userIndex']
        
        # 레시피 생성
        result = generate_recipe_from_json(pre, user_index)
        
        if result:
            # 성공 시 JSON 출력 (Node.js에서 파싱 가능)
            print(json.dumps(result, ensure_ascii=False))
        else:
            # 실패 시 에러 JSON 출력
            print(json.dumps({"error": "레시피 생성 실패"}, ensure_ascii=False))
            sys.exit(1)
            
    except Exception as e:
        # 예외 발생 시 에러 JSON 출력
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    main()