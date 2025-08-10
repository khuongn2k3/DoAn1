const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const KhachHang = require('../models/khachhang');
const DatTour = require('../models/dattour');
const Favorite = require('../models/favorite');
const DanhGia = require('../models/danhgia');

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
router.post('/', async (req, res) => {
  try {
    const { hoTen, email, soDienThoai, diaChi } = req.body;

    const existing = await KhachHang.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email đã được đăng ký' });
    const hashedPassword = await bcrypt.hash('123456', 10); 
    const khach = new KhachHang({
      hoTen,
      email,
      soDienThoai,
      diaChi,
      matKhau: hashedPassword, 
    });

    await khach.save();
    res.status(201).json({ message: 'Thêm khách hàng thành công', khach });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi thêm khách hàng' });
  }
});
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
router.put('/:id', async (req, res) => {
  try {
    const { hoTen, email, soDienThoai, diaChi, anhDaiDien } = req.body;

    const updateData = {};
    if (hoTen) updateData.hoTen = hoTen;
    if (email) updateData.email = email;
    if (soDienThoai) updateData.soDienThoai = soDienThoai;
    if (diaChi) updateData.diaChi = diaChi;
    if (anhDaiDien) updateData.anhDaiDien = anhDaiDien;

    const khach = await KhachHang.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!khach) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });

    res.json({ message: 'Cập nhật khách hàng thành công', khach });
  } catch (err) {
    console.error('Lỗi cập nhật:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật khách hàng' });
  }
});
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

    const isMatch = await bcrypt.compare(oldPassword, khachHang.matKhau);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu cũ không đúng.' });
    }

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
    const khId = req.params.id;
    const kh = await KhachHang.findByIdAndDelete(khId);

    if (!kh) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    await DatTour.deleteMany({ khachHangId: khId });
    await Favorite.deleteMany({ khachHangId: khId });
    await DanhGia.deleteMany({ khachHangId: khId });

    res.json({ message: 'Xóa khách hàng, các đặt tour, danh sách yêu thích và đánh giá thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa khách hàng:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
module.exports = router;

