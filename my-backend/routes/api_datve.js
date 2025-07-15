// routes/datve.js
const express = require('express');
const router = express.Router();

const DatVe = require('../models/datve');
const Tour = require('../models/tour');
const KhachHang = require('../models/khachhang');

// POST: /datve
router.post('/', async (req, res) => {
  try {
    const {
      khachHangId,
      tourId,
      soLuong,
      yeuCauDonTiep,
      diaChiDon,
      phiDon = 0
    } = req.body;

    // Lấy thông tin tour để tính giá
    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour' });

    const tongTien = (tour.gia * soLuong) + (yeuCauDonTiep ? phiDon : 0);

    const newDatVe = new DatVe({
      khachHang: khachHangId,
      tour: tourId,
      soLuong,
      tongTien,
      yeuCauDonTiep,
      diaChiDon: yeuCauDonTiep ? diaChiDon : '',
      phiDon: yeuCauDonTiep ? phiDon : 0
    });

    await newDatVe.save();
    res.status(201).json({ message: 'Đặt vé thành công', datVe: newDatVe });

  } catch (err) {
    console.error('Lỗi đặt vé:', err);
    res.status(500).json({ message: 'Lỗi server khi đặt vé' });
  }
});

module.exports = router;

