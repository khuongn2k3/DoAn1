const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI

const apiRoutes = require('./routes/api'); 
const khachHangRoutes = require('./routes/api_khachhang');
const adminRoutes = require('./routes/admin_admin');

app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Đã kết nối MongoDB'))
  .catch((err) => console.error('Lỗi kết nối MongoDB:', err.message));

// Sử dụng route từ routes/api.js
app.use('/', apiRoutes);
app.use('/api_khachhang', khachHangRoutes);
app.use('/api_admin', adminRoutes);

app.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, 'User', 'user.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'Auth' ,'register_account.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'Auth','login_account.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

