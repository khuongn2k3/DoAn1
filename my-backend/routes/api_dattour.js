const express = require('express');
const router = express.Router();
const DatTour = require('../models/dattour');
const Tour = require('../models/tour');
const KhachHang = require('../models/khachhang'); // nếu muốn kiểm tra tồn tại khách

// POST: Đặt tour
router.post('/', async (req, res) => {
  try {
    const {
      tourId,
      khachHangId,
      ngayKhoiHanh,
      gioKhoiHanh,
      soNguoiLon,
      soTreEm,
      soTreNho,
      dichVuThem
    } = req.body;

    // Lấy giá tour từ bảng tour
    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour' });

    // Tính tổng tiền (giá người lớn, trẻ em, trẻ nhỏ)
    const tongTien =
      (tour.giaNguoiLon || 0) * soNguoiLon +
      (tour.giaTreEm || 0) * soTreEm +
      (tour.giaTreNho || 0) * soTreNho;

    const newDatTour = new DatTour({
      tourId,
      khachHangId,
      ngayKhoiHanh,
      gioKhoiHanh,
      soNguoiLon,
      soTreEm,
      soTreNho,
      dichVuThem,
      tongTien
    });

    await newDatTour.save();
    res.json({ message: 'Đặt tour thành công', datTour: newDatTour });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi đặt tour' });
  }
});

module.exports = router;
