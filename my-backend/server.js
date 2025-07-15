const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api'); 
const khachHangRoutes = require('./routes/api_khachhang');
app.use('/api_khachhang', khachHangRoutes);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || require('./secret').MONGO_URI;

app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB'))
  .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err.message));

// Sử dụng route từ routes/api.js
app.use('/', apiRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

