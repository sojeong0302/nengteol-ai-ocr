import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";
import bcrypt from 'bcrypt';

const AutoIncrement = AutoIncrementFactory(mongoose);

const userSchema = new Schema(
  {
    user_id: {
      type: Number,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.plugin(AutoIncrement, { inc_field: "user_id", start_seq: 1 });

// 저장 전 비밀번호 해시
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 비밀번호 비교
userSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

const User = model("User", userSchema);

export default User;
