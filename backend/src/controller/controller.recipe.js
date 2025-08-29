import Recipe from '../models/Recipe.js';

// 레시피 전체 조회 (검색/필터링 포함)
export const getRecipes = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let filter = {};
    let sortOption = { createdAt: -1 }; // 기본 최신순

    if (search) {
      filter.$text = { $search: search }; // name, description 인덱스 기반 검색
    }
    if (category) {
      filter.category = category;
    }
    if (sort === 'rating') {
      sortOption = { averageRating: -1, reviewCount: -1 };
    }

    const recipes = await Recipe.find(filter).sort(sortOption);
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: '레시피를 불러오는 중 오류 발생', error });
  }
};

// 📌 특정 레시피 조회
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: '레시피를 찾을 수 없음' });
    }
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ message: '레시피 조회 중 오류 발생', error });
  }
};

// 📌 레시피 등록
export const createRecipe = async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(400).json({ message: '레시피 등록 실패', error });
  }
};

// 📌 레시피 수정
export const updateRecipe = async (req, res) => {
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRecipe) {
      return res.status(404).json({ message: '레시피를 찾을 수 없음' });
    }
    res.status(200).json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ message: '레시피 수정 실패', error });
  }
};

// 📌 레시피 삭제
export const deleteRecipe = async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!deletedRecipe) {
      return res.status(404).json({ message: '레시피를 찾을 수 없음' });
    }
    res.status(200).json({ message: '레시피 삭제 성공' });
  } catch (error) {
    res.status(500).json({ message: '레시피 삭제 실패', error });
  }
};

// 📌 평점 업데이트
export const addRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: '레시피를 찾을 수 없음' });
    }

    await recipe.updateRating(rating);
    res.status(200).json(recipe);
  } catch (error) {
    res.status(400).json({ message: '평점 등록 실패', error });
  }
};

// 📌 카테고리별 레시피 조회
export const getRecipesByCategory = async (req, res) => {
  try {
    const recipes = await Recipe.findByCategory(req.params.category);
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: '카테고리별 조회 실패', error });
  }
};

// 📌 인기 레시피 조회
export const getPopularRecipes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recipes = await Recipe.findPopular(limit);
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: '인기 레시피 조회 실패', error });
  }
};