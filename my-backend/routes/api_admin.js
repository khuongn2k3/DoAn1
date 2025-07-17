const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');

router.post('/login', async (req, res) => {
  const { email, matKhau } = req.body;
  const admin = await Admin.findOne({ email, matKhau });

  if (!admin) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });

  res.json({ _id: admin._id, hoTen: admin.hoTen });
});
