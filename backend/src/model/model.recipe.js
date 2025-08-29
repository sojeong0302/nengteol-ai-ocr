import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  // 레시피 이름
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  // 레시피 설명 (추천 이유, 소요 시간, 인분 수 포함)
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // 재료 목록 (JSON 구조에 맞게 수정)
  ingredients: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    count: {
      type: Number,
      required: true,
      min: 1,
      max: 9
    }
  }],
  
  // 조리 과정 (하나의 문자열로 관리)
  cooking_steps: {
    type: String,
    required: true,
    trim: true
  },
  
  // 영양 정보
  nutrition: {
    // 개별 재료 영양 정보
    ingredients: [{
      type: String, // "재료명 (칼로리kcal, 탄수화물g, 단백질g, 지방g, 당류g)" 형태
      required: true
    }],
    // 전체 영양 정보
    total: {
      type: String, // "전체 (칼로리kcal, 탄수화물g, 단백질g, 지방g, 당류g)" 형태
      required: true
    }
  },
  
  // 평점 평균
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  // 리뷰 수 (평점 계산용)
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // 카테고리
  category: {
    type: String,
    enum: ['한식', '중식', '일식', '양식', '베이킹', '디저트', '음료', '기타'],
    default: '기타'
  },
  
  // 난이도
  difficulty: {
    type: String,
    enum: ['쉬움', '보통', '어려움'],
    default: '보통'
  },
  
  // 예상 소요 시간 (분 단위)
  totalTime: {
    type: Number,
    default: 0
  },
  
  // 인분 수
  servings: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // 이미지 URL
  imageUrl: {
    type: String,
    default: ''
  },
  
  // 작성자
  author: {
    type: String,
    required: true,
    trim: true
  },
  
  // 태그
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true // createdAt, updatedAt 자동 생성
});

// 가상 필드: 재료 수
recipeSchema.virtual('ingredientCount').get(function() {
  return this.ingredients.length;
});

// 가상 필드: 조리 단계 수 (문자열에서 단계 번호 개수 추출)
recipeSchema.virtual('stepCount').get(function() {
  if (!this.cooking_steps) return 0;
  const matches = this.cooking_steps.match(/^\d+\./gm);
  return matches ? matches.length : 0;
});

// JSON 출력시 가상 필드 포함
recipeSchema.set('toJSON', { virtuals: true });
recipeSchema.set('toObject', { virtuals: true });

// 인덱스 설정
recipeSchema.index({ name: 'text', description: 'text' }); // 텍스트 검색용
recipeSchema.index({ category: 1 });
recipeSchema.index({ averageRating: -1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ 'ingredients.name': 1 }); // 재료명 검색용

// 인스턴스 메서드: 평점 업데이트
recipeSchema.methods.updateRating = function(newRating) {
  if (newRating < 0 || newRating > 5) {
    throw new Error('평점은 0-5 사이의 값이어야 합니다.');
  }
  
  const totalRating = (this.averageRating * this.reviewCount) + newRating;
  this.reviewCount += 1;
  this.averageRating = Math.round((totalRating / this.reviewCount) * 10) / 10; // 소수점 첫째자리까지
  return this.save();
};

// 정적 메서드: 카테고리별 조회
recipeSchema.statics.findByCategory = function(category) {
  return this.find({ category }).sort({ averageRating: -1, reviewCount: -1 });
};

// 정적 메서드: 인기 레시피 조회
recipeSchema.statics.findPopular = function(limit = 10) {
  return this.find()
    .sort({ averageRating: -1, reviewCount: -1 })
    .limit(limit);
};

// 정적 메서드: 재료명으로 레시피 검색
recipeSchema.statics.findByIngredient = function(ingredientName) {
  return this.find({
    'ingredients.name': { $regex: ingredientName, $options: 'i' }
  }).sort({ averageRating: -1 });
};

// 정적 메서드: 소요 시간별 레시피 검색
recipeSchema.statics.findByTimeRange = function(minTime = 0, maxTime = 999) {
  return this.find({
    totalTime: { $gte: minTime, $lte: maxTime }
  }).sort({ totalTime: 1 });
};

// 유효성 검사: cooking_steps 형식 확인
recipeSchema.pre('save', function(next) {
  if (this.cooking_steps) {
    // 최소한 하나의 단계가 있는지 확인
    const hasSteps = /^\d+\./m.test(this.cooking_steps);
    if (!hasSteps) {
      return next(new Error('조리 과정은 "1. " 형태의 단계를 포함해야 합니다.'));
    }
  }
  next();
});

// 모델 생성 및 export
const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;