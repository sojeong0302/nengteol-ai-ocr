import mongoose, { Schema, model } from "mongoose";

const cartSchema = new Schema(
  {
    user_id: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      enum: ["고기", "해산물", "유제품", "음료", "채소", "과일"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      min: 0,
      default: 1,
    },
    ice: {
      type: Boolean,
      default: false,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const Cart = model("Cart", cartSchema);
export default Cart;