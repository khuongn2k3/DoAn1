const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const searchRoute = require('./routes/api_search');
const khachHangRoutes = require('./routes/api_khachhang');
const adminRoutes = require('./routes/api_admin');
const tourRoutes = require('./routes/api_tour');
const dattourRoutes = require('./routes/api_dattour');
const danhGiaRoutes = require('./routes/api_danhgia');
const favoriteRoutes = require('./routes/api_favorite');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/avatar', express.static(path.join(__dirname, 'avatar')));
// Kết nối MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Đã kết nối MongoDB'))
  .catch((err) => console.error('Lỗi kết nối MongoDB:', err.message));

// Sử dụng route từ routes/api.js
app.use('/api_search', searchRoute);
app.use('/api_khachhang', khachHangRoutes);
app.use('/api_admin', adminRoutes);
app.use('/api_tour', tourRoutes);
app.use('/api_dattour', dattourRoutes);
app.use('/image', express.static(path.join(__dirname, 'public/image')));
app.use('/api_danhgia', danhGiaRoutes);
app.use('/api_favorite', favoriteRoutes);
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
  console.log(` Server đang chạy tại http://localhost:${PORT}`);
});

