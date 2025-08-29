import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data"; // multipart 전송용
import { configDotenv } from "dotenv";

configDotenv();

const AI_URI = process.env.AI_URI;

const uploadRouter = express.Router();
const upload = multer({ dest: "uploads/" });

uploadRouter.post("/", upload.single("receipt"), async (req, res) => {
  try {
    const filePath = req.file.path; // 업로드된 파일 경로

    // multipart/form-data 형태로 AI 서버에 전달
    const formData = new FormData();
    formData.append("receipt", fs.createReadStream(filePath));

    const aiRes = await fetch(AI_URI, {
      method: "POST",
      body: formData, // JSON 대신 formData
      headers: formData.getHeaders(), // multipart 헤더 설정
    });

    const aiResult = await aiRes.json();
    
    

    res.json({
      message: "AI 서버 응답 수신 완료",
      foods: aiResult.foods,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI 서버 요청 실패" });
  }
});

export default uploadRouter;