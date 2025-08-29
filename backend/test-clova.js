// 클로바 AI 분류 테스트 스크립트
import { configDotenv } from 'dotenv';
import aiClassificationService from './services/aiClassificationService.js';
configDotenv();

async function testClovaClassification() {
  console.log('=== 클로바 AI 분류 테스트 ===');
  
  // 테스트 데이터 (실제 영수증에서 나온 상품들)
  const testItems = [
    { name: '허니버터눈꽃치즈돈까', quantity: 1, unit: '개', price: 12500 },
    { name: '깍두기볶음밥', quantity: 1, unit: '개', price: 7500 },
    { name: '브라운돈가스', quantity: 1, unit: '개', price: 8000 },
    { name: '세제', quantity: 1, unit: '개', price: 5000 },
    { name: '휴지', quantity: 1, unit: '팩', price: 3000 }
  ];
  
  try {
    console.log('테스트 상품들:', testItems);
    
    const result = await aiClassificationService.classifyFoodItems(testItems);
    
    console.log('\n=== AI 분류 결과 ===');
    console.log('분류된 식품 개수:', result.length);
    console.log('분류 결과:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('테스트 에러:', error);
  }
}

testClovaClassification();