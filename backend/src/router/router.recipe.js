import express from 'express';
import { clovaService } from '../../services/clovaService.js'

const eRouter = express.Router();

// 냉장고 재료 기반 레시피 추천
eRouter.post('/recommend', async (req, res) => {
  try {
    const { ingredients } = req.body;
    
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ 
        error: 'ingredients가 필요합니다',
        example: {
          ingredients: [
            { name: '우유', quantity: 1, unit: '개' },
            { name: '계란', quantity: 2, unit: '개' }
          ]
        }
      });
    }

    console.log('레시피 추천 요청:', ingredients);

    const recipes = await clovaService.generateRecipe(ingredients);
    
    res.json({
      success: true,
      recipes,
      message: `${ingredients.length}개 재료로 ${recipes.length}개 레시피를 추천했습니다.`
    });

  } catch (error) {
    console.error('레시피 추천 에러:', error);
    res.status(500).json({
      error: '레시피 추천 중 오류가 발생했습니다',
      message: error.message
    });
  }
});

// 장바구니 아이템 기반 레시피 추천  
eRouter.post('/recommend-cart', async (req, res) => {
  try {
    const { cartItems } = req.body;
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ 
        error: 'cartItems가 필요합니다',
        example: {
          cartItems: [
            { name: '토마토', quantity: 2, category: '채소' },
            { name: '달걀', quantity: 1, category: '축산품' }
          ]
        }
      });
    }

    // 장바구니 아이템을 ingredients 형식으로 변환
    const ingredients = cartItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit: '개' // 기본 단위
    }));

    console.log('장바구니 기반 레시피 추천 요청:', ingredients);

    const recipes = await clovaService.generateRecipe(ingredients);
    
    res.json({
      success: true,
      recipes,
      cartItems,
      message: `장바구니의 ${cartItems.length}개 상품으로 ${recipes.length}개 레시피를 추천했습니다.`
    });

  } catch (error) {
    console.error('장바구니 레시피 추천 에러:', error);
    res.status(500).json({
      error: '레시피 추천 중 오류가 발생했습니다',
      message: error.message
    });
  }
});

// 테스트용 엔드포인트
eRouter.get('/test', (req, res) => {
  res.json({
    message: 'Recipe API is working!',
    endpoints: [
      'POST /api/recipe/recommend - 냉장고 재료 기반 추천',
      'POST /api/recipe/recommend-cart - 장바구니 아이템 기반 추천'
    ]
  });
});

export default eRouter;