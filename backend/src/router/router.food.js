import express from "express";
import { getFoods, getFoodById, addFood, decreaseFood, getCategory } from "../controller/controller.food.js";

const foodRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Foods
 *   description: 사용자별 음식 관리
 */

/**
 * @swagger
 * /api/foods/category/{user_id}:
 *   get:
 *     summary: 유저별 특정 카테고리 음식 조회
 *     description: user_id를 기준으로 특정 카테고리의 음식 리뷰를 조회합니다.
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: number
 *         description: 조회할 유저 ID
 *         example: 1
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 카테고리
 *         example: "한식"
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FoodReview'
 *                 message:
 *                   type: string
 *                   example: "한식 카테고리 리뷰 조회 성공"
 *       400:
 *         description: 요청 값 누락
 *       500:
 *         description: 서버 오류
 */
foodRouter.get('/category/:user_id', getCategory);

/**
 * @swagger
 * /api/foods/{user_id}:
 *   get:
 *     summary: 사용자 음식 전체 조회
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: number
 *         required: true
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 음식 목록 조회 성공
 *       500:
 *         description: 서버 오류
 */
foodRouter.get("/:user_id", getFoods);

/**
 * @swagger
 * /api/foods/{user_id}/{name}:
 *   get:
 *     summary: 사용자 단일 음식 조회
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: number
 *         required: true
 *         description: 사용자 ID
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: 음식 이름
 *     responses:
 *       200:
 *         description: 단일 음식 조회 성공
 *       404:
 *         description: 음식 없음
 *       500:
 *         description: 서버 오류
 */
foodRouter.get("/:user_id/:name", getFoodById);

/**
 * @swagger
 * /api/foods:
 *   post:
 *     summary: 음식 추가 (없으면 새로 추가, 있으면 수량 +1)
 *     tags: [Foods]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: number
 *               category:
 *                 type: string
 *                 enum: [고기, 해산물, 유제품, 음료, 채소, 과일]
 *               name:
 *                 type: string
 *               ice:
 *                 type: boolean
 *               count:
 *                 type: number
 *     responses:
 *       201:
 *         description: 새 음식 추가 성공
 *       200:
 *         description: 기존 음식 수량 +1
 *       400:
 *         description: 음식 추가 실패
 */
foodRouter.post("/", addFood);

/**
 * @swagger
 * /api/foods:
 *   delete:
 *     summary: 음식 수량 감소 (0이면 삭제)
 *     tags: [Foods]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: number
 *               name:
 *                 type: string
 *               count:
 *                 type: number
 *     responses:
 *       200:
 *         description: 음식 수량 감소 또는 삭제 성공
 *       404:
 *         description: 음식 없음
 *       500:
 *         description: 서버 오류
 */
foodRouter.delete("/", decreaseFood);

export default foodRouter;