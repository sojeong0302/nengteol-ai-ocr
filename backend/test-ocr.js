import { configDotenv } from 'dotenv';
import ocrService from './services/ocrService.js';

configDotenv();

async function testOCR() {
  console.log('OCR 테스트 시작...');
  console.log('API URL:', process.env.NAVER_OCR_API_URL);
  console.log('SECRET KEY:', process.env.NAVER_OCR_SECRET_KEY ? '설정됨' : '설정되지 않음');
  
  try {
    // 샘플 텍스트로 테스트
    const sampleText = await ocrService.getSampleReceiptText();
    console.log('샘플 영수증 텍스트:');
    console.log(sampleText);
    
    // 파싱 테스트
    const parsedItems = ocrService.parseReceiptText(sampleText);
    console.log('\n파싱된 아이템들:');
    console.log(JSON.stringify(parsedItems, null, 2));
    
  } catch (error) {
    console.error('테스트 에러:', error);
  }
}

testOCR();