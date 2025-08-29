// 환경변수 디버깅 스크립트
require('dotenv').config();

console.log('=== 환경변수 디버깅 ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CLOVA_API_KEY:', process.env.CLOVA_API_KEY ? '설정됨' : '설정되지 않음');
console.log('CLOVA_APIGW_API_KEY:', process.env.CLOVA_APIGW_API_KEY ? '설정됨' : '설정되지 않음');
console.log('NAVER_OCR_API_URL:', process.env.NAVER_OCR_API_URL);
console.log('NAVER_OCR_SECRET_KEY:', process.env.NAVER_OCR_SECRET_KEY ? '설정됨' : '설정되지 않음');
console.log('PORT:', process.env.PORT);

// 실제 값들도 일부 표시 (보안상 앞부분만)
if (process.env.NAVER_OCR_SECRET_KEY) {
  console.log('SECRET_KEY 앞 10자:', process.env.NAVER_OCR_SECRET_KEY.substring(0, 10) + '...');
}

if (process.env.CLOVA_API_KEY) {
  console.log('CLOVA_API_KEY 앞 10자:', process.env.CLOVA_API_KEY.substring(0, 10) + '...');
}