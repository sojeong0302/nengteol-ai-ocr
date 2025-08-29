import express from 'express'
import { getReview, summaryReivew, setReview, getUserReview } from '../controller/controller.review.js';

const reviewRouter = express.Router();

/**
 * @swagger
 * /api/reviews/summary:
 *   post:
 *     summary: 리뷰 요약
 *     description: 사용자가 입력한 리뷰를 요약합니다.
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - score
 *               - feedback
 *             properties:
 *               date:
 *                 type: string
 *                 example: "2025-08-29"
 *                 description: 리뷰 작성 날짜
 *               score:
 *                 type: number
 *                 example: 5
 *                 description: 리뷰 점수 (1~5)
 *               feedback:
 *                 type: string
 *                 example: "맛있고 따라하기 쉬웠어요!"
 *                 description: 리뷰 텍스트
 *     responses:
 *       200:
 *         description: 요약 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: string
 *                   example: "요약되엇어요"
 *                 message:
 *                   type: string
 *                   example: "요약성공"
 *       400:
 *         description: 요청 값 누락
 *       500:
 *         description: 서버 오류
 */
reviewRouter.post('/summary', summaryReivew);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     summary: 특정 리뷰 조회
 *     description: 리뷰 ID(ObjectId)를 이용해 특정 리뷰를 조회합니다.
 *     tags: [Reviews]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: 리뷰의 ObjectId
 *         example: "64f5e7c2b1a4cd8f21e0d123"
 *     responses:
 *       200:
 *         description: 리뷰 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64f5e7c2b1a4cd8f21e0d123"
 *                     user_id:
 *                       type: number
 *                       example: 1
 *                     recipe_name:
 *                       type: string
 *                       example: "김치찌개"
 *                     feedback:
 *                       type: string
 *                       example: "국물이 진하고 맛있었어요!"
 *                     score:
 *                       type: number
 *                       example: 5
 *                     date:
 *                       type: string
 *                       example: "2025-08-29"
 *                 message:
 *                   type: string
 *                   example: "리뷰조회성공"
 *       404:
 *         description: 리뷰를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "리뷰아이디없음"
 *       500:
 *         description: 서버 오류
 */
reviewRouter.get('/:id', getReview);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: 리뷰 생성
 *     description: 사용자가 새로운 리뷰를 작성합니다.
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - recipe_name
 *               - feedback
 *               - score
 *               - date
 *             properties:
 *               user_id:
 *                 type: number
 *                 example: 1
 *                 description: 리뷰 작성한 사용자 ID
 *               recipe_name:
 *                 type: string
 *                 example: "김치찌개"
 *                 description: 리뷰 대상 레시피 이름
 *               feedback:
 *                 type: string
 *                 example: "맛있고 따라하기 쉬웠어요!"
 *                 description: 리뷰 텍스트
 *               score:
 *                 type: number
 *                 example: 5
 *                 description: 리뷰 점수 (1~5)
 *               date:
 *                 type: string
 *                 example: "2025-08-29"
 *                 description: 리뷰 작성 날짜
 *     responses:
 *       201:
 *         description: 리뷰 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 object_id:
 *                   type: string
 *                   example: "64f5e7c2b1a4cd8f21e0d123"
 *                 message:
 *                   type: string
 *                   example: "리뷰가 성공적으로 저장되었습니다."
 *       400:
 *         description: 요청 값 누락
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "필수 항목이 누락되었습니다."
 *       500:
 *         description: 서버 오류
 */
reviewRouter.post('/', setReview);

/**
 * @swagger
 * /api/reviews/user/{id}:
 *   get:
 *     summary: 특정 유저의 모든 리뷰 조회
 *     description: user_id를 기준으로 해당 유저가 작성한 모든 리뷰를 조회합니다.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 조회할 유저의 ID
 *         example: 1
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
 *                     $ref: '#/components/schemas/Review'
 *                 message:
 *                   type: string
 *                   example: "본 유저의 모든 리뷰"
 *       400:
 *         description: 요청 값 누락
 *       500:
 *         description: 서버 오류
 */
reviewRouter.get('/user/:id', getUserReview);

export default reviewRouter;