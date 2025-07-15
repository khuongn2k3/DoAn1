const express = require('express');
const router = express.Router();
const KhachHang = require('../models/khachhang');

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { hoTen, email, soDienThoai, matKhau, diaChi } = req.body;

    // Kiểm tra email đã tồn tại
    const existing = await KhachHang.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email đã được đăng ký' });

    const khach = new KhachHang({ hoTen, email, soDienThoai, matKhau, diaChi });
    await khach.save();

    res.status(201).json({ message: 'Đăng ký thành công', khach });
  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, matKhau } = req.body;

    const khach = await KhachHang.findOne({ email, matKhau });
    if (!khach) return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });

    res.status(200).json({ message: 'Đăng nhập thành công', khach });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
// GET thông tin khách hàng theo ID
router.get('/:id', async (req, res) => {
  try {
    const khachHang = await KhachHang.findById(req.params.id).select('-matKhau');
    if (!khachHang) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(khachHang);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;

