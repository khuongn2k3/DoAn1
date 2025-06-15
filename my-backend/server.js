const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const MONGO_URI = process.env.MONGO_URI || require('./secret').MONGO_URI;
const Destination = require('./models/Destination'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Đã kết nối MongoDB');
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
  });

// API tìm kiếm theo title
app.get('/search', async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const results = await Destination.find({
      title: { $regex: keyword, $options: 'i' }
    });

    res.json(results);
  } catch (error) {
    console.error('Lỗi khi tìm kiếm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
