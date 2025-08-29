import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
  },
  
  recipe_name: {
    type: String,
    required: true,
    trim: true
  },
  
  feedback: {
    type: String,
    required: true,
    trim: true
  },

  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  date: {
    type: String
  }
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;