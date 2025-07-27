const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Admin = require('../models/admin');

// API tạm thời để tạo tài khoản admin
router.post('/create-admin', async (req, res) => {
  try {
    const { hoTen, email, matKhau } = req.body;

    // Kiểm tra email đã tồn tại 
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Tài khoản đã tồn tại' });
    }

    // Mã hoá mật khẩu
    const hashedPassword = await bcrypt.hash(matKhau, 10);

    const newAdmin = new Admin({
      hoTen,
      email,
      matKhau: hashedPassword,
      avatar: 'admin1.jpg'
    });

    await newAdmin.save();

    res.json({ message: 'Tạo admin thành công', adminId: newAdmin._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { email, matKhau } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }
    const isMatch = await bcrypt.compare(matKhau, admin.matKhau);
    if (!isMatch) {
      return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    }
    res.status(200).json({ message: 'Đăng nhập thành công', admin });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
// Lấy thông tin admin theo ID
router.get('/:id', async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Không tìm thấy admin' });

    res.json({
      _id: admin._id,
      hoTen: admin.hoTen,
      email: admin.email,
      avatar: admin.avatar || 'default.jpg'
    });
  } catch (err) {
    console.error('Lỗi khi lấy thông tin admin:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


module.exports = router;
