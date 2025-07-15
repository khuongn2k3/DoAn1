const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const DiaDiem = require('./models/diadiem');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || require('./secret').MONGO_URI;

app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err.message));

// API tìm kiếm
app.get('/search', async (req, res) => {
  const keyword = req.query.q || '';
  try {
    const results = await diadiem.find({
      title: { $regex: keyword, $options: 'i' }
    });
    res.json(results);
  } catch (error) {
    console.error('Lỗi tìm kiếm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.listen(PORT, () => {
  console.log(` Server đang chạy tại http://localhost:${PORT}`);
});
