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

module.exports = router;
