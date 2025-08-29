import axios from 'axios';
import FormData from 'form-data';

class OCRService {
  constructor() {
    this.apiUrl = process.env.NAVER_OCR_API_URL;
    this.secretKey = process.env.NAVER_OCR_SECRET_KEY;
  }

  // Object Storage URL을 사용한 OCR 처리
  async extractTextFromImageUrl(imageUrl, filename = 'receipt.jpg') {
    try {
      if (!this.apiUrl || !this.secretKey) {
        console.log('OCR API 설정이 없어서 샘플 텍스트를 반환합니다.');
        return this.getSampleReceiptText();
      }

      console.log('OCR API 호출 시작 (이미지 URL 사용)...');

      // 네이버 클로바 OCR API 요청 데이터 구성 (이미지 URL 방식)
      const message = {
        version: "V2",
        requestId: "receipt-" + Date.now(),
        timestamp: Date.now(),
        images: [
          {
            format: this.getImageFormat(filename),
            name: "receipt_image",
            url: imageUrl // Object Storage URL 사용
          }
        ]
      };

      const response = await axios.post(this.apiUrl, {
        message: JSON.stringify(message)
      }, {
        headers: {
          'X-OCR-SECRET': this.secretKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('OCR API 응답 상태 (URL방식):', response.status);

      if (response.data && response.data.images && response.data.images[0]) {
        const fields = response.data.images[0].fields;
        let extractedText = '';
        
        // OCR 결과를 텍스트로 변환
        fields.forEach(field => {
          if (field.inferText) {
            extractedText += field.inferText + '\n';
          }
        });

        console.log('추출된 텍스트 길이:', extractedText.length + '자');
        return extractedText || this.getSampleReceiptText();
      }

      console.log('OCR 응답에서 텍스트를 찾을 수 없어 샘플 데이터 반환');
      return this.getSampleReceiptText();

    } catch (error) {
      console.error('OCR API 에러:', error.message, '상태:', error.response?.status);
      
      // API 실패 시 샘플 데이터 반환
      return this.getSampleReceiptText();
    }
  }

  // 기존 Buffer 방식 (fallback용)
  async extractTextFromImage(imageBuffer, filename = 'receipt.jpg') {
    try {
      if (!this.apiUrl || !this.secretKey) {
        console.log('OCR API 설정이 없어서 샘플 텍스트를 반환합니다.');
        return this.getSampleReceiptText();
      }

      console.log('OCR API 호출 시작 (Buffer 방식)...');

      // 네이버 공식 OCR API 요청 데이터 구성
      const message = {
        version: "V2",
        requestId: "receipt-" + Date.now(),
        timestamp: Date.now(),
        images: [
          {
            format: this.getImageFormat(filename),
            name: "receipt_image"
          }
        ]
      };

      const formData = new FormData();
      formData.append('message', JSON.stringify(message));
      formData.append('file', imageBuffer, {
        filename: filename,
        contentType: `image/${this.getImageFormat(filename)}`
      });

      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          'X-OCR-SECRET': this.secretKey,
          'Content-Type': 'multipart/form-data',
          ...formData.getHeaders()
        },
        timeout: 30000
      });

      console.log('OCR API 응답 상태:', response.status);

      if (response.data && response.data.images && response.data.images[0]) {
        const fields = response.data.images[0].fields;
        let extractedText = '';
        
        // OCR 결과를 텍스트로 변환
        fields.forEach(field => {
          if (field.inferText) {
            extractedText += field.inferText + '\n';
          }
        });

        console.log('추출된 텍스트 길이:', extractedText.length + '자');
        return extractedText || this.getSampleReceiptText();
      }

      console.log('OCR 응답에서 텍스트를 찾을 수 없어 샘플 데이터 반환');
      return this.getSampleReceiptText();

    } catch (error) {
      console.error('OCR API 에러:', error.message, '상태:', error.response?.status);
      
      // API 실패 시 샘플 데이터 반환
      return this.getSampleReceiptText();
    }
  }

  getImageFormat(filename) {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'jpg';
      case 'png':
        return 'png';
      default:
        return 'jpg';
    }
  }

  getSampleReceiptText() {
    // 샘플 영수증 텍스트 (OCR API 실패 시 사용)
    return `
롯데마트 서울역점
2025-08-29 15:30

우유 1L
달걀 10개  
토마토 500g
양파 1kg
식빵 1봉
바나나 1송이
치킨너겟 1팩
세제 1개
휴지 1팩  
샴푸 1개

합계
카드결제
`;
  }

  // 영수증 텍스트를 구조화된 데이터로 파싱
  parseReceiptText(receiptText) {
    const lines = receiptText.split('\n').filter(line => line.trim());
    const items = [];
    
    console.log('파싱할 라인 수:', lines.length);
    
    // 음식 관련 키워드 (한글 식품명 패턴)
    const foodKeywords = ['돈가스', '돈까스', '볶음밥', '라면', '국수', '치킨', '피자', '햄버거', '샐러드', '김밥', '우동', '짜장면', '탕수육'];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 한글 식품명 패턴 찾기 (기존 P로 시작하는 로직 대신)
      const hasFood = foodKeywords.some(keyword => line.includes(keyword));
      const isKoreanProduct = /[가-힣]/.test(line) && line.length >= 2 && line.length <= 20;
      
      if (hasFood || (isKoreanProduct && !line.includes('emart') && !line.includes('이마트'))) {
        console.log('상품 라인 발견:', line);
        
        let productName = line;
        let quantity = 1;
        
        // 수량 정보 찾기 (다음 라인들에서)
        for (let j = i + 1; j <= Math.min(i + 7, lines.length - 1); j++) {
          const nextLine = lines[j].trim();
          
          // "단가 수량 금액" 패턴에서 수량만 추출 (예: "12,500 1 12,500")  
          const detailedMatch = nextLine.match(/^([0-9,]+)\s+(\d+)\s+([0-9,]+)$/);
          if (detailedMatch) {
            const [, , qty] = detailedMatch;
            quantity = parseInt(qty);
            console.log(`수량 정보 찾음: ${productName} - ${quantity}개`);
            break;
          }
        }
        
        // 유효한 상품 정보가 있으면 추가
        if (productName) {
          // 상품명 정리 (숫자 코드, 특수문자 제거)
          let cleanName = productName
            .replace(/\d{10,}/g, '') // 10자리 이상 숫자 제거 (바코드)
            .replace(/[0-9]{3}-[0-9]{2}-[0-9]+/g, '') // 사업자번호 패턴 제거
            .replace(/\(\d+\)/g, '') // 괄호 안 숫자 제거
            .replace(/\s+/g, ' ') // 연속 공백을 하나로
            .trim();

          // OCR 잘린 단어 복원 (제거됨)
          
          if (cleanName.length >= 2 && /[가-힣]/.test(cleanName)) {
            items.push({
              name: cleanName,
              quantity: quantity || 1
            });
            console.log('상품 추가됨:', { name: cleanName, quantity: quantity || 1 });
          }
        }
      }
    }
    
    console.log('파싱 완료. 총', items.length, '개 아이템 발견');
    return items;
  }

  // OCR로 잘린 단어들을 복원하는 헬퍼 함수
  _fixTruncatedWords(text) {
    const fixes = {
      '돈까': '돈까스',
      '돈가': '돈가스',
      '치킨너': '치킨너겟',
      '볶음': '볶음밥',
      '김치볶': '김치볶음밥',
      '떡볶': '떡볶이',
      '샌드위': '샌드위치'
    };
    
    let fixed = text;
    for (const [truncated, full] of Object.entries(fixes)) {
      if (fixed.includes(truncated)) {
        fixed = fixed.replace(truncated, full);
        console.log(`OCR 단어 복원: ${truncated} → ${full}`);
      }
    }
    
    return fixed;
  }
}

export const ocrService = new OCRService();