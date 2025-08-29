import userRouter from "./router.user.js";
import foodRouter from "./router.food.js";
import reviewRouter from './router.review.js';
import express from 'express';
import cartRouter from "./router.cart.js";

const router = express.Router();

router.use('/foods', foodRouter);
router.use('/users', userRouter);
router.use('/reviews', reviewRouter);
router.use('/carts', cartRouter);
router.use('/uproad', uproadRouter);

export default router;