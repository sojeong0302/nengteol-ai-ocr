import os
import json
from dotenv import load_dotenv, find_dotenv
from langchain_naver import ChatClovaX
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser

# --- 1. 특정 유저의 선호/비선호 정보를 불러오는 함수 ---
def get_user_preferences(file_path='users.json', user_index=0):
    """
    JSON 파일에서 특정 인덱스의 사용자 선호/비선호 정보를 읽어옵니다.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        user_data = data['users'][user_index]
        return {
            "good": user_data.get('good', '정보 없음'),
            "bad": user_data.get('bad', '정보 없음')
        }
    except FileNotFoundError:
        print(f"🚨 오류: '{file_path}' 파일을 찾을 수 없습니다.")
        return None
    except IndexError:
        print(f"🚨 오류: 인덱스 {user_index}에 해당하는 사용자가 없습니다.")
        return None
    except Exception as e:
        print(f"🚨 오류: 파일을 읽는 중 문제가 발생했습니다: {e}")
        return None

# --- 2. 환경 설정 및 LLM 생성 ---
_ = load_dotenv(find_dotenv())
api_key = os.getenv("CLOVA_STUDIO_API_KEY")
llm = ChatClovaX(model="HCX-007", api_key=api_key)


# --- 3. LangChain 프롬프트 템플릿 및 체인 생성 ---
system_prompt_template = """
# Persona
너는 세계 최고의 요리사이자, 개인의 특성을 세심하게 고려하는 요리 컨설턴트야. 너의 임무는 사용자가 제공하는 재료, 개인적인 요구사항을 종합적으로 분석하여 완벽한 맞춤형 요리 레시피를 제안하는 것이야.
그리고 사용자의 복잡한 요청을 분석하여, 오직 JSON 데이터만을 생성하는 **레시피 데이터 포맷팅 전문 AI**다. 너의 유일한 임무는 주어진 모든 규칙을 완벽하게 준수하는 단 하나의 유효한 JSON 객체를 출력하는 것이다.

# Main Task
사용자가 제공한 재료 정보와 **사용자 선호도**를 바탕으로, 최적의 요리 레시피 1개를 생성한다.

# User Preference Analysis (중요)
{user_preferences}

# Processing Instructions
1.  **재료 분석 및 메뉴 선정**: 재료를 **최소 2가지 이상 반드시 포함**하는 메뉴를 선정한다.
2.  **사용자 맞춤화:**
    * **선호(good) 음식 스타일을 적극적으로 반영**하여 메뉴를 추천한다.
    * **비선호(bad) 음식이나 재료는 레시피에 절대 포함하지 않는다.**
3.  **레시피 생성 규칙:**
    * **난이도:** 요리 초보자도 쉽게 따라 할 수 있도록 '초급' 수준으로 자세히 작성한다.
    * **팁 제공:** 요리 과정에 "꿀팁🍯"이나 "주의사항🚨"을 넣어 요리의 완성도를 높이고 실수를 줄일 수 있도록 도와주세요.
    * 영양성분: 반드시 레시피에 적인 모든 재료 계산하세요.

# Output Rules (가장 중요한 규칙)
1.  응답은 **시작부터 끝까지 오직 하나의 JSON 객체**여야 한다.
2.  JSON 외부에는 어떠한 텍스트도 추가하지 않는다.
3.  `ingredients.count`는 **1~9까지의 정수(JSON Number 타입)**만 사용한다.

---
이제 아래 JSON 스키마 예시를 보고, 사용자 요청에 대한 결과물을 생성하라.
---

{{
    "recipe": {{
        "name": "요리제목",
        "description": "요리 설명",
        "total_time": "약 20분",
        "servings": "1인분",
        "ingredients": [
            {{
                "name": "재료1",
                "count": 5
            }},
            {{
                "name": "재료2",
                "count": 7
            }}
        ],
        "cooking_steps": [ 
                1. "마늘과 양파를 다지고, 가지는 한입 크기로 썹니다.
                팁, 🍯가지의 수분을 살짝 제거하면 식감이 더 좋아집니다.", "2. 두번째 순서",
        ],
        "additional_info": "보관 방법 및 다양한 추가 정보."
    }},
    "nutrition_info": {{
        "ingredients": [
            {{
                "name": "재료1",
                "energy_kcal": 24,
                "protein_g": 1.1,
                "fat_g": 0.2,
                "carbohydrate_g": 5.7,
                "sugars_g": 2.4
            }},
            {{
                "name": "재료2",
                "energy_kcal": 24,
                "protein_g": 1.1,
                "fat_g": 0.2,
                "carbohydrate_g": 5.7,
                "sugars_g": 2.4
            }},
            {{
                "name": "재료3",
                "energy_kcal": 24,
                "protein_g": 1.1,
                "fat_g": 0.2,
                "carbohydrate_g": 5.7,
                "sugars_g": 2.4
            }},
        ],
        "total": {{
            "energy_kcal": 550,
            "protein_g": 25,
            "fat_g": 15,
            "carbohydrate_g": 80,
            "sugars_g": 30
        }}
    }}
}}

---
사용자 요청(보유 재료 목록): {user_request}
"""

# ChatPromptTemplate을 사용하여 프롬프트 구조를 정의합니다.
# 템플릿의 {변수}들이 이 프롬프트의 입력값이 됩니다.
prompt = ChatPromptTemplate.from_template(system_prompt_template)

# 체인을 생성합니다: 프롬프트(prompt)와 언어 모델(llm)을 | (파이프)로 연결합니다.
# StrOutputParser()는 LLM의 응답 객체에서 순수한 텍스트만 추출하는 역할을 합니다.
chain = prompt | llm | StrOutputParser()


# --- 4. 메인 실행 로직 ---
target_user_index = 0
user_prefs = get_user_preferences('pre.json', target_user_index)

if user_prefs:
    # 4-1. 프롬프트에 전달할 변수들을 준비합니다.
    preferences_text = f"""
    * 선호(good): {user_prefs['good']}
    * 비선호(bad): {user_prefs['bad']}
    """
    
    user_request_ingredients = [
        {"name": "당근", "count": 1}, {"name": "삼겹살", "count": 1},
        {"name": "대파", "count": 1}, {"name": "양배추", "count": 1},
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
        {"name": "버터", "count": 1}, {"name": "냉동 만두", "count": 1},
        {"name": "생수", "count": 1}, {"name": "콜라", "count": 1},
        {"name": "맥주", "count": 1}
    ]
    user_request_text = json.dumps(user_request_ingredients, ensure_ascii=False)

    # 4-2. 체인 실행 (핵심 변경사항)
    # .invoke()에 프롬프트 템플릿에 정의된 변수들을 딕셔너리 형태로 전달합니다.
    print("\n--- LangChain 체인 실행 중... ---\n")
    response_content = chain.invoke({
        "user_preferences": preferences_text,
        "user_request": user_request_text
    })

    # 4-3. 결과 출력 및 파일 저장
    print("--- LLM 응답 내용 ---")
    print(response_content)

    output_filename = "recipe_output.json"
    try:
        recipe_data = json.loads(response_content)
        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(recipe_data, f, ensure_ascii=False, indent=4)
        print(f"\n✅ 성공: 레시피가 '{output_filename}' 파일에 성공적으로 저장되었습니다.")
    except json.JSONDecodeError:
        print(f"\n🚨 오류: LLM의 응답을 JSON으로 변환하는 데 실패했습니다.")
    except Exception as e:
        print(f"\n🚨 오류: 파일을 저장하는 중 예상치 못한 오류가 발생했습니다: {e}")
else:
    print("사용자 정보를 불러오지 못해 레시피 생성을 중단합니다.")