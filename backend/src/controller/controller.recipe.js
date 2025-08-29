import Recipe from '../models/Recipe.js';

// 📌 레시피 전체 조회 (검색/필터링 포함)
export const getRecipes = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      sort, 
      ingredient, 
      minTime, 
      maxTime, 
      difficulty, 
      minRating,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let filter = {};
    let sortOption = { createdAt: -1 }; // 기본 최신순

    // 텍스트 검색 (name, description 기반)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // 카테고리 필터
    if (category && category !== '전체') {
      filter.category = category;
    }

    // 재료명 검색
    if (ingredient) {
      filter['ingredients.name'] = { $regex: ingredient, $options: 'i' };
    }

    // 소요 시간 필터
    if (minTime || maxTime) {
      filter.totalTime = {};
      if (minTime) filter.totalTime.$gte = parseInt(minTime);
      if (maxTime) filter.totalTime.$lte = parseInt(maxTime);
    }

    // 난이도 필터
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // 최소 평점 필터
    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating) };
    }

    // 정렬 옵션
    switch (sort) {
      case 'rating':
        sortOption = { averageRating: -1, reviewCount: -1 };
        break;
      case 'time_asc':
        sortOption = { totalTime: 1 };
        break;
      case 'time_desc':
        sortOption = { totalTime: -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Recipe.countDocuments(filter);
    const recipes = await Recipe.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      recipes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + recipes.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('레시피 조회 오류:', error);
    res.status(500).json({ message: '레시피를 불러오는 중 오류 발생', error: error.message });
  }
};

// 📌 특정 레시피 조회
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: '레시피를 찾을 수 없습니다.' });
    }
    res.status(200).json(recipe);
  } catch (error) {
    console.error('레시피 상세 조회 오류:', error);
    res.status(500).json({ message: '레시피 조회 중 오류 발생', error: error.message });
  }
};

// 📌 레시피 등록
export const createRecipe = async (req, res) => {
  try {
    // 필수 필드 검증
    const requiredFields = ['name', 'description', 'ingredients', 'cooking_steps', 'nutrition'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} 필드는 필수입니다.` });
      }
    }

    // 재료 개수 검증
    if (req.body.ingredients) {
      for (const ingredient of req.body.ingredients) {
        if (ingredient.count < 1 || ingredient.count > 9) {
          return res.status(400).json({ 
            message: '재료 개수는 1-9 사이의 값이어야 합니다.' 
          });
        }
      }
    }

    const newRecipe = new Recipe({
      ...req.body,
      author: req.body.author || '익명'
    });
    
    const savedRecipe = await newRecipe.save();
    res.status(201).json({
      message: '레시피가 성공적으로 등록되었습니다.',
      recipe: savedRecipe
    });
  } catch (error) {
    console.error('레시피 등록 오류:', error);
    
    // MongoDB 유효성 검사 오류 처리
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: '입력 데이터 오류', errors });
    }
    
    res.status(400).json({ message: '레시피 등록 실패', error: error.message });
  }
};

// 📌 레시피 수정
export const updateRecipe = async (req, res) => {
  try {
    // 재료 개수 검증 (수정 시에도)
    if (req.body.ingredients) {
      for (const ingredient of req.body.ingredients) {
        if (ingredient.count < 1 || ingredient.count > 9) {
          return res.status(400).json({ 
            message: '재료 개수는 1-9 사이의 값이어야 합니다.' 
          });
        }
      }
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!updatedRecipe) {
      return res.status(404).json({ message: '레시피를 찾을 수 없습니다.' });
    }
    
    res.status(200).json({
      message: '레시피가 성공적으로 수정되었습니다.',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error('레시피 수정 오류:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: '입력 데이터 오류', errors });
    }
    
    res.status(400).json({ message: '레시피 수정 실패', error: error.message });
  }
};

// 📌 레시피 삭제
export const deleteRecipe = async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) {
      return res.status(404).json({ message: '레시피를 찾을 수 없습니다.' });
    }
    res.status(200).json({ 
      message: '레시피가 성공적으로 삭제되었습니다.',
      deletedRecipe: { id: deletedRecipe._id, name: deletedRecipe.name }
    });
  } catch (error) {
    console.error('레시피 삭제 오류:', error);
    res.status(500).json({ message: '레시피 삭제 실패', error: error.message });
  }
};

// 📌 평점 업데이트
export const addRating = async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({ message: '평점은 0-5 사이의 값이어야 합니다.' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: '레시피를 찾을 수 없습니다.' });
    }

    await recipe.updateRating(rating);
    res.status(200).json({
      message: '평점이 성공적으로 등록되었습니다.',
      recipe: {
        id: recipe._id,
        name: recipe.name,
        averageRating: recipe.averageRating,
        reviewCount: recipe.reviewCount
      }
    });
  } catch (error) {
    console.error('평점 등록 오류:', error);
    res.status(400).json({ message: '평점 등록 실패', error: error.message });
  }
};

// 📌 카테고리별 레시피 조회
export const getRecipesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, sort = 'rating' } = req.query;
    
    let recipes;
    if (sort === 'rating') {
      recipes = await Recipe.findByCategory(category).limit(parseInt(limit));
    } else {
      recipes = await Recipe.find({ category })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
    }
    
    res.status(200).json({
      category,
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('카테고리별 조회 오류:', error);
    res.status(500).json({ message: '카테고리별 조회 실패', error: error.message });
  }
};

// 📌 인기 레시피 조회
export const getPopularRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recipes = await Recipe.findPopular(limit);
    res.status(200).json({
      message: '인기 레시피 목록',
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('인기 레시피 조회 오류:', error);
    res.status(500).json({ message: '인기 레시피 조회 실패', error: error.message });
  }
};

// 📌 재료명으로 레시피 검색
export const getRecipesByIngredient = async (req, res) => {
  try {
    const { ingredient } = req.params;
    const { limit = 20 } = req.query;
    
    const recipes = await Recipe.findByIngredient(ingredient).limit(parseInt(limit));
    res.status(200).json({
      ingredient,
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('재료별 검색 오류:', error);
    res.status(500).json({ message: '재료별 검색 실패', error: error.message });
  }
};

// 📌 소요 시간별 레시피 검색
export const getRecipesByTimeRange = async (req, res) => {
  try {
    const { minTime = 0, maxTime = 999 } = req.query;
    const { limit = 20 } = req.query;
    
    const recipes = await Recipe.findByTimeRange(
      parseInt(minTime), 
      parseInt(maxTime)
    ).limit(parseInt(limit));
    
    res.status(200).json({
      timeRange: { min: parseInt(minTime), max: parseInt(maxTime) },
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('시간별 검색 오류:', error);
    res.status(500).json({ message: '시간별 검색 실패', error: error.message });
  }
};

// 📌 레시피 통계 정보
export const getRecipeStats = async (req, res) => {
  try {
    const totalRecipes = await Recipe.countDocuments();
    const categoryStats = await Recipe.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$averageRating' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const difficultyStats = await Recipe.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      totalRecipes,
      categoryStats,
      difficultyStats
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({ message: '통계 조회 실패', error: error.message });
  }
};