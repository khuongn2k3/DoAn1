const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const apiRoutes = require('./routes/api'); 
const khachHangRoutes = require('./routes/api_khachhang');
const adminRoutes = require('./routes/api_admin');
const tourRoutes = require('./routes/api_tour');
const dattourRoutes = require('./routes/api_dattour');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/avatar', express.static(path.join(__dirname, 'avatar')));
// Kết nối MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Đã kết nối MongoDB'))
  .catch((err) => console.error('Lỗi kết nối MongoDB:', err.message));

// Sử dụng route từ routes/api.js
app.use('/', apiRoutes);
app.use('/api_khachhang', khachHangRoutes);
app.use('/api_admin', adminRoutes);
app.use('/api_tour', tourRoutes);
app.use('/api_dattour', dattourRoutes);
app.use('/image', express.static(path.join(__dirname, 'public/image')));
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

