const express = require('express');
const multer = require('multer');
const router = express.Router();
const receiptService = require('../services/receiptService');

// 파일 업로드 설정
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 5MB 제한
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
    }
  }
});

// 영수증 업로드 및 식품 추출
router.post('/upload', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: '영수증 이미지가 필요합니다' 
      });
    }

    console.log('영수증 업로드:', req.file.originalname);

    // 영수증에서 식품만 추출
    const result = await receiptService.parseReceipt(req.file.buffer, req.file.originalname);
    
    if (!result.success) {
      return res.status(500).json({
        error: '영수증 분석 중 오류가 발생했습니다',
        message: result.error,
        foodItems: result.foodItems // 샘플 데이터라도 반환
      });
    }

    res.json({
      success: true,
      message: `${result.foodItems.length}개의 식품을 발견했습니다`,
      foodItems: result.foodItems,
      originalText: result.originalText
    });

  } catch (error) {
    console.error('영수증 업로드 에러:', error);
    res.status(500).json({
      error: '영수증 처리 중 오류가 발생했습니다',
      message: error.message
    });
  }
});

// 추출된 식품을 냉장고에 추가
router.post('/add-to-fridge', async (req, res) => {
  try {
    const { foodItems } = req.body;
    
    if (!foodItems || !Array.isArray(foodItems)) {
      return res.status(400).json({ 
        error: 'foodItems 배열이 필요합니다' 
      });
    }

    console.log('냉장고에 추가할 식품들:', foodItems);

    // 실제로는 데이터베이스에 저장
    // 여기서는 성공 응답만 반환
    const addedItems = foodItems.map((item, index) => ({
      id: Date.now() + index,
      ...item,
      status: 'active',
      addedAt: new Date().toISOString()
    }));

    res.json({
      success: true,
      message: `${addedItems.length}개 식품이 냉장고에 추가되었습니다`,
      addedItems
    });

  } catch (error) {
    console.error('냉장고 추가 에러:', error);
    res.status(500).json({
      error: '냉장고 추가 중 오류가 발생했습니다',
      message: error.message
    });
  }
});

// 영수증에서 식품만 테스트 추출
router.get('/test-extract', async (req, res) => {
  try {
    // 샘플 영수증으로 테스트
    const result = await receiptService.parseReceipt(null);
    
    res.json({
      message: '테스트 영수증 분석 결과',
      ...result
    });
    
  } catch (error) {
    console.error('테스트 추출 에러:', error);
    res.status(500).json({
      error: '테스트 중 오류가 발생했습니다',
      message: error.message
    });
  }
});

module.exports = router;