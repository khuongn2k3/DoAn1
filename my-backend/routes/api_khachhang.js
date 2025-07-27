const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const KhachHang = require('../models/khachhang');

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    
    const { hoTen, email, soDienThoai, matKhau, diaChi } = req.body;

    const existing = await KhachHang.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email đã được đăng ký' });

    const hashedPassword = await bcrypt.hash(matKhau, 10);

    const khach = new KhachHang({
      hoTen,
      email,
      soDienThoai,
      matKhau: hashedPassword,
      diaChi
    });

    await khach.save();
    res.status(201).json({ message: 'Đăng ký thành công', khach });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  const { email, matKhau } = req.body;
  try {
    const khach = await KhachHang.findOne({ email });
    if (!khach) return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });

    const isMatch = await bcrypt.compare(matKhau, khach.matKhau);
    if (!isMatch) return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });

    res.status(200).json({ message: 'Đăng nhập thành công', khach });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
// PUT ảnh đại diện
router.put('/:id', async (req, res) => {
  try {
    const { anhDaiDien } = req.body;
    const result = await KhachHang.findByIdAndUpdate(req.params.id, { anhDaiDien }, { new: true });
    if (!result) return res.status(404).send("Không tìm thấy người dùng");
    res.json(result);
  } catch (err) {
    res.status(500).send("Lỗi server");
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
router.get('/', async (req, res) => {
  try {
    const khachHangList = await KhachHang.find().select('-matKhau');
    res.json(khachHangList);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});
router.post('/change-password', async (req, res) => {
  const { khachHangId, oldPassword, newPassword } = req.body;

  try {
    const khachHang = await KhachHang.findById(khachHangId);
    if (!khachHang) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng.' });
    }

    // So sánh oldPassword với mật khẩu đã hash trong DB
    const isMatch = await bcrypt.compare(oldPassword, khachHang.matKhau);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu cũ không đúng.' });
    }

    // Hash mật khẩu mới trước khi lưu
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    khachHang.matKhau = hashedNewPassword;
    await khachHang.save();

    res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (err) {
    console.error('Lỗi đổi mật khẩu:', err);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const khach = await KhachHang.findByIdAndDelete(req.params.id);
    if (!khach) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
    res.json({ message: 'Xoá khách hàng thành công' });
  } catch (err) {
    console.error('Lỗi khi xoá khách hàng:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
module.exports = router;

