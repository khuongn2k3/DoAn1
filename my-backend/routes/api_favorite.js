const express = require('express');
const router = express.Router();
const Tour = require('../models/tour');
const favorite = require('../models/favorite');
const KhachHang = require('../models/khachhang');

router.post('/them', async (req, res) => {
  const { khachHangId, tourId } = req.body;
  try {
    const exist = await favorite.findOne({ khachHangId, tourId });
    if (exist) return res.status(409).json({ message: 'Đã tồn tại trong yêu thích' });

    const newfavorite = new favorite({ khachHangId, tourId });
    await newfavorite.save();
    res.status(201).json({ message: 'Đã thêm vào yêu thích' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/xoa', async (req, res) => {
  const { khachHangId, tourId } = req.body;
  try {
    await favorite.findOneAndDelete({ khachHangId, tourId });
    res.json({ message: 'Đã xóa khỏi yêu thích' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/kiemtra', async (req, res) => {
  const { khachHangId, tourId } = req.body;
  try {
    const exist = await favorite.findOne({ khachHangId, tourId });
    res.json({ favorite: !!exist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/danhsach/:khachHangId', async (req, res) => {
    try {
      const { khachHangId } = req.params;
      console.log('Lấy danh sách yêu thích của:', khachHangId);
  
      const ds = await favorite.find({ khachHangId }).populate('tourId');
  
      res.json(ds);
    } catch (err) {
      console.error('Lỗi tại /danhsach:', err);
      res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
  });

module.exports = router;
