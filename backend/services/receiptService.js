import { clovaService } from './clovaService.js';
import { ocrService } from './ocrService.js';
import { objectStorageService } from './objectStorageService.js';
import {aiClassificationService} from './aiClassificationService.js';

class ReceiptService {
  constructor() {
    // 식품 카테고리 매핑
    this.foodCategories = {
      '유제품': ['우유', '치즈', '버터', '요구르트', '크림'],
      '축산품': ['달걀', '계란', '닭고기', '돼지고기', '소고기', '생선'],
      '채소': ['당근', '양파', '마늘', '토마토', '오이', '배추', '상추', '시금치'],
      '과일': ['사과', '바나나', '오렌지', '배', '포도', '딸기', '수박'],
      '곡류': ['쌀', '밀가루', '빵', '라면', '파스타'],
      '조미료': ['소금', '설탕', '간장', '된장', '고추장', '식용유']
    };
    
    // 식품이 아닌 것들 (제외할 항목들)
    this.nonFoodItems = [
      '세제', '샴푸', '치약', '휴지', '비누', '화장지', '물티슈',
      '가방', '옷', '신발', '약', '비타민', '화장품',
      '배터리', '전구', '문구용품', '청소용품'
    ];
  }

  async parseReceipt(imageBuffer, filename) {
    try {
      console.log('영수증 OCR 처리 시작 (Object Storage + OCR)...');
      
      let ocrText = '';
      let storageInfo = null;

      // 1단계: Object Storage에 이미지 업로드
      try {
        console.log('1단계: Object Storage 업로드...');
        storageInfo = await objectStorageService.uploadReceipt(imageBuffer, filename);
        
        if (storageInfo.success && storageInfo.url) {
          console.log('Object Storage 업로드 성공:', storageInfo.url);
          
          // 2단계: Object Storage URL을 사용하여 OCR 처리
          console.log('2단계: Object Storage URL로 OCR 처리...');
          ocrText = await ocrService.extractTextFromImageUrl(storageInfo.url, filename);
          
        } else {
          // Object Storage 실패 시 직접 Buffer로 OCR 처리
          console.log('Object Storage 실패, 직접 OCR 처리...');
          ocrText = await ocrService.extractTextFromImage(imageBuffer, filename);
        }
      } catch (storageError) {
        console.log('Object Storage 에러, 직접 OCR 처리로 fallback:', storageError.message);
        ocrText = await ocrService.extractTextFromImage(imageBuffer, filename);
      }
      
      console.log('OCR 추출 텍스트:', ocrText);
      
      // 3단계: OCR 텍스트를 구조화된 아이템으로 파싱
      const allItems = ocrService.parseReceiptText(ocrText);
      console.log('파싱된 아이템들:', allItems);
      
      // 4단계: AI를 사용한 식품 분류
      console.log('4단계: AI를 사용한 식품 분류...');
      const classifiedItems = await aiClassificationService.classifyFoodItems(allItems);
      
      // 5단계: 유통기한 설정
      const foodItems = classifiedItems.map(item => ({
        ...item,
        expiry_date: this.getDefaultExpiryDate(item.category),
        addedAt: new Date().toISOString()
      }));
      
      console.log('최종 식품 목록:', foodItems);
      
      // 5단계: OCR 처리 완료 후 Object Storage 파일 정리 (선택적)
      // 개발 단계에서는 유지하고, 운영에서는 일정 시간 후 삭제하도록 설정 가능
      
      return {
        success: true,
        foodItems,
        originalText: ocrText,
        allItems, // 디버깅용
        storageInfo // Object Storage 정보
      };
      
    } catch (error) {
      console.error('영수증 파싱 에러:', error);
      
      // 에러 발생 시 샘플 데이터 반환
      return {
        success: false,
        foodItems: this.getSampleFoodItems(),
        error: error.message
      };
    }
  }

  async filterFoodItems(allItems) {
    try {
      const foodItems = [];
      
      for (const item of allItems) {
        const foodCheck = this.isFoodItem(item.name);
        
        if (foodCheck.isFood) {
          const foodItem = {
            name: item.name,
            category: foodCheck.category,
            quantity: item.quantity,
            unit: item.unit,
            expiry_date: this.getDefaultExpiryDate(foodCheck.category)
          };
          
          foodItems.push(foodItem);
        } else {
          console.log(`비식품 제외: ${item.name}`);
        }
      }
      
      return foodItems;
      
    } catch (error) {
      console.error('식품 필터링 에러:', error);
      return this.getSampleFoodItems();
    }
  }

  getSampleFoodItems() {
    return [
      {
        name: '우유',
        category: '유제품',
        quantity: 1,
        unit: 'L',
        expiry_date: this.getDefaultExpiryDate('유제품')
      },
      {
        name: '달걀',
        category: '축산품',
        quantity: 10,
        unit: '개',
        expiry_date: this.getDefaultExpiryDate('축산품')
      },
      {
        name: '토마토',
        category: '채소',
        quantity: 500,
        unit: 'g',
        expiry_date: this.getDefaultExpiryDate('채소')
      },
      {
        name: '양파',
        category: '채소',
        quantity: 1,
        unit: 'kg',
        expiry_date: this.getDefaultExpiryDate('채소')
      },
      {
        name: '식빵',
        category: '곡류',
        quantity: 1,
        unit: '봉',
        expiry_date: this.getDefaultExpiryDate('곡류')
      }
    ];
  }

  getDefaultExpiryDate(category) {
    const today = new Date();
    const expiryDays = {
      '유제품': 7,
      '축산품': 5,
      '채소': 10,
      '과일': 7,
      '곡류': 14,
      '조미료': 365
    };
    
    const days = expiryDays[category] || 7;
    const expiryDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return expiryDate.toISOString().split('T')[0];
  }

  // 식품인지 판별하는 헬퍼 함수
  isFoodItem(itemName) {
    const lowerName = itemName.toLowerCase();
    
    // 비식품 아이템 확인
    for (const nonFood of this.nonFoodItems) {
      if (lowerName.includes(nonFood.toLowerCase())) {
        return { isFood: false, category: null };
      }
    }
    
    // 식품 카테고리 확인
    for (const [category, foods] of Object.entries(this.foodCategories)) {
      for (const food of foods) {
        if (lowerName.includes(food.toLowerCase())) {
          return { isFood: true, category };
        }
      }
    }
    
    // 명시적으로 분류되지 않은 경우 기본적으로 식품으로 간주 (보수적 접근)
    // 실제로는 더 정교한 분류 로직이 필요
    return { isFood: true, category: '기타' };
  }
}

export const receiptService = new ReceiptService();