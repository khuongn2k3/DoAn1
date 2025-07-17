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
      return res.status(400).json({ message: 'Admin đã tồn tại' });
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

    // Tìm admin theo email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }

    // So sánh mật khẩu đã mã hóa
    const isMatch = await bcrypt.compare(matKhau, admin.matKhau);
    if (!isMatch) {
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }

    // Thành công: trả về thông tin cơ bản
    res.json({
      _id: admin._id,
      hoTen: admin.hoTen,
      email: admin.email,
      avatar: admin.avatar || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
module.exports = router;
