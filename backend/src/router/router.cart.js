import express from 'express';
import { addCart, decreaseCart, getCart } from '../controller/controller.cart.js';
const cartRouter = express.Router();

/**
 * @swagger
 * /api/carts/{id}:
 *   get:
 *     summary: 장바구니 전체 조회
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 장바구니 조회 성공
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
 *                     $ref: '#/components/schemas/CartItem'
 *                 message:
 *                   type: string
 *                   example: "장바구니 전체 조회 성공"
 *       400:
 *         description: 아이디 전송 안됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
cartRouter.get('/:id', getCart);

/**
 * @swagger
 * /api/carts:
 *   post:
 *     summary: 장바구니에 음식 추가
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - name
 *             properties:
 *               user_id:
 *                 type: number
 *                 description: 사용자 ID
 *                 example: 1
 *               name:
 *                 type: string
 *                 description: 음식 이름
 *                 example: "아메리카노"
 *               count:
 *                 type: number
 *                 example: 1
 *               category:
 *                 type: string
 *                 description: 음식 카테고리
 *                 example: "음료"
 *               ice:
 *                 type: string
 *                 description: 아이스 옵션
 *                 example: "hot"
 *     responses:
 *       201:
 *         description: 새 음식 장바구니에 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CartItem'
 *                 message:
 *                   type: string
 *                   example: "새 음식 장바구니에 추가 성공"
 *       200:
 *         description: 기존 음식 수량 증가
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CartItem'
 *                 message:
 *                   type: string
 *                   example: "기존 음식 수량 + 1"
 *       400:
 *         description: 장바구니 추가 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
cartRouter.post('/', addCart);

/**
 * @swagger
 * /api/carts:
 *   delete:
 *     summary: 장바구니 음식 수량 감소 또는 삭제
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - name
 *             properties:
 *               user_id:
 *                 type: number
 *                 description: 사용자 ID
 *                 example: 1
 *               name:
 *                 type: string
 *                 description: 음식 이름
 *                 example: "아메리카노"
 *               count:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: 음식 수량 감소 또는 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CartItem'
 *                 message:
 *                   type: string
 *                   example: "아메리카노-음식 수량 1 감소"
 *       404:
 *         description: 음식을 찾을 수 없음
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
 *                   example: "아메리카노-음식을 찾을 수 없습니다."
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
cartRouter.delete('/', decreaseCart);

export default cartRouter;