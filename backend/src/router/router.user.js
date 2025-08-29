import express from "express";
import { register, signin, signout, updateUser } from "../controller/controller.user.js";

const userRouter = express.Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: 회원가입
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 잘못된 요청
 */
userRouter.post("/register", register);

/**
 * @swagger
 * /api/users/signin:
 *   post:
 *     summary: 로그인
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       401:
 *         description: 로그인 실패
 */
userRouter.post("/signin", signin);

/**
 * @swagger
 * /api/users/signout:
 *   post:
 *     summary: 로그아웃
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 */
userRouter.post("/signout", signout);

/**
 * @swagger
 * /api/users/update:
 *   put:
 *     summary: 사용자 정보 업데이트
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: number
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 *       400:
 *         description: 잘못된 요청
 */
userRouter.put("/update", updateUser);

export default userRouter;