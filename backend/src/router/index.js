import userRouter from "./router.user.js";
import foodRouter from "./router.food.js";
import reviewRouter from "./router.review.js";
import express from "express";
import cartRouter from "./router.cart.js";
import tRouter from "./router.recipt.js";
import eRouter from "./router.recipe.js";
import Pre from "../model/model.pre.js";

const router = express.Router();

router.use("/foods", foodRouter);
router.use("/users", userRouter);
router.use("/reviews", reviewRouter);
router.use("/carts", cartRouter);

router.post("/generate-recipe", async (req, res) => {
  const { userIndex = 1 } = req.body;
  
  userPreferences = await Pre.find({user_id: 1});
  // JSON 객체를 문자열로 변환하여 명령줄 인수로 전달
  const jsonString = JSON.stringify(userPreferences).replace(/"/g, '\\"');
  const command = `python3 backend/RAG/promt.py "${jsonString}" ${userIndex}`;
  
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Python 실행 오류:", err.message);
      return res.status(500).json({ error: err.message });
    }
    
    if (stderr) {
      console.error("Python stderr:", stderr);
    }
    
    try {
      // Python에서 반환된 JSON 파싱
      const recipe = JSON.parse(stdout);
      res.json({ success: true, recipe });
    } catch (parseErr) {
      console.error("JSON 파싱 오류:", parseErr);
      res.status(500).json({ error: "레시피 파싱 실패" });
    }
  });
});

export default router;
