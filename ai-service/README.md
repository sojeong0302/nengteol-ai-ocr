# AI Recipe Service

클로바 API를 사용하여 냉장고 재료와 장바구니 아이템을 기반으로 레시피를 추천하는 서비스입니다.

## 설정

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
```bash
cp .env.example .env
```

`.env` 파일을 열어 클로바 API 키를 설정하세요:
```
CLOVA_API_KEY=your_clova_api_key_here
CLOVA_APIGW_API_KEY=your_clova_apigw_api_key_here  
CLOVA_REQUEST_ID=your_request_id_here
PORT=3001
```

## 실행

```bash
# 프로덕션 모드
npm start

# 개발 모드 (nodemon)
npm run dev
```

## API 엔드포인트

### GET /api/recipe/test
서비스 상태 확인

### POST /api/recipe/recommend
냉장고 재료 기반 레시피 추천

**요청 예시:**
```json
{
  "ingredients": [
    { "name": "우유", "quantity": 1, "unit": "개" },
    { "name": "계란", "quantity": 2, "unit": "개" },
    { "name": "당근", "quantity": 1, "unit": "개" }
  ]
}
```

### POST /api/recipe/recommend-cart  
장바구니 아이템 기반 레시피 추천

**요청 예시:**
```json
{
  "cartItems": [
    { "name": "토마토", "quantity": 2, "category": "채소" },
    { "name": "달걀", "quantity": 1, "category": "축산품" }
  ]
}
```

**응답 예시:**
```json
{
  "success": true,
  "recipes": [
    {
      "id": 1,
      "name": "토마토 달걀볶음",
      "ingredients": "토마토 2개, 달걀 1개, 소금, 기름",
      "instructions": "1. 팬에 기름을 두르고...",
      "cookingTime": "15분",
      "difficulty": "쉬움"
    }
  ],
  "message": "2개 재료로 3개 레시피를 추천했습니다."
}
```

## 프론트엔드 연동

```javascript
// 냉장고 재료 기반 레시피 요청
const getRecipeRecommendations = async (foodItems) => {
  const response = await fetch('http://localhost:3001/api/recipe/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients: foodItems })
  });
  return response.json();
};

// 장바구니 기반 레시피 요청
const getCartRecipeRecommendations = async (cartItems) => {
  const response = await fetch('http://localhost:3001/api/recipe/recommend-cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartItems })
  });
  return response.json();
};
```