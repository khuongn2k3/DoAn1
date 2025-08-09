const express = require('express');
const router = express.Router();
const DanhGia = require('../models/danhgia');

router.get('/', async (req, res) => {
  const { tourId } = req.query;
  if (!tourId) return res.status(400).json({ message: 'Thiếu tourId' });
    
  const danhGiaList = await DanhGia.find({ tourId }).sort({ thoiGian: -1 });
  res.json(danhGiaList);
  
});

router.post('/', async (req, res) => {
  try {
    const { tourId, khachHangId, hoTen, soSao, noiDung } = req.body;
    if (!tourId || !khachHangId || !hoTen || !soSao || !noiDung)
      return res.status(400).json({ message: 'Thiếu thông tin' });

    const daDanhGia = await DanhGia.findOne({ tourId, khachHangId });
    if (daDanhGia)
      return res.status(400).json({ message: 'Bạn đã đánh giá tour này' });

    const newReview = new DanhGia({ tourId, khachHangId, hoTen, soSao, noiDung });
    await newReview.save();
    res.json({ message: 'Đánh giá thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
