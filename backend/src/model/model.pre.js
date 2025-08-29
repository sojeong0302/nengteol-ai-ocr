import mongoose, { Schema, model } from "mongoose";

const preSchema = new Schema({
  // 사용자 ID (숫자형, 고유값)
  user_id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  
  // 사용자 선호 사항
  good: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
    default: ''
  },
  
  // 사용자 비선호 사항
  bad: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
    default: ''
  },
});

const Pre = mongoose.model('Pre', preSchema);
export default Pre;