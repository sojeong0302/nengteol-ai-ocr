const express = require('express');
const cors = require('cors');
require('dotenv').config();

const recipeRoutes = require('./routes/recipe');
const receiptRoutes = require('./routes/receipt');

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우트
app.use('/api/recipe', recipeRoutes);
app.use('/api/receipt', receiptRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'AI Recipe Service is running!' });
});

app.listen(PORT, () => {
  console.log(`AI Service server is running on port ${PORT}`);
});