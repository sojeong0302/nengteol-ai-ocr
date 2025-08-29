import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  // 레시피 이름
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  // 들어가는 재료
  ingredients: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      default: ''
    }
  }],
  // 레시피 방법을 배열로 순서
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    instruction: {
      type: String,
      required: true,
      trim: true
    },
    cookingTime: {
      type: Number, // 분 단위
      default: 0
    }
  }],
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
  
  // 추가 유용한 필드들
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  category: {
    type: String,
    enum: ['한식', '중식', '일식', '양식', '베이킹', '디저트', '음료', '기타'],
    default: '기타'
  },
  
  difficulty: {
    type: String,
    enum: ['쉬움', '보통', '어려움'],
    default: '보통'
  },
  
  totalTime: {
    type: Number, // 전체 조리 시간 (분)
    default: 0
  },
  
  servings: {
    type: Number, // 몇 인분
    default: 1
  },
  
  imageUrl: {
    type: String,
    default: ''
  },
  
  author: {
    type: String,
    required: true,
    trim: true
  },
  
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true // createdAt, updatedAt 자동 생성
});

// 가상 필드: 레시피 과정 수
recipeSchema.virtual('stepCount').get(function() {
  return this.steps.length;
});

// 가상 필드: 재료 수
recipeSchema.virtual('ingredientCount').get(function() {
  return this.ingredients.length;
});

// JSON 출력시 가상 필드 포함
recipeSchema.set('toJSON', { virtuals: true });
recipeSchema.set('toObject', { virtuals: true });

// 인덱스 설정
recipeSchema.index({ name: 'text', description: 'text' }); // 텍스트 검색용
recipeSchema.index({ category: 1 });
recipeSchema.index({ averageRating: -1 });
recipeSchema.index({ createdAt: -1 });

// 스키마 메서드
recipeSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.averageRating * this.reviewCount) + newRating;
  this.reviewCount += 1;
  this.averageRating = totalRating / this.reviewCount;
  return this.save();
};

// 정적 메서드
recipeSchema.statics.findByCategory = function(category) {
  return this.find({ category }).sort({ averageRating: -1 });
};

recipeSchema.statics.findPopular = function(limit = 10) {
  return this.find()
    .sort({ averageRating: -1, reviewCount: -1 })
    .limit(limit);
};

// 모델 생성 및 export
const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;