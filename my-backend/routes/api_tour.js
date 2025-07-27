const express = require('express');
const router = express.Router();
const Tour = require('../models/tour');
const multer = require('multer');
const path = require('path');
// Cấu hình Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/image'); // Lưu trong public/image
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Lấy danh sách tất cả tour
router.get('/', async (req, res) => {
  try {
    const tours = await Tour.find().sort({ ngayTao: -1 });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách tour' });
  }
});
router.get('/search', async (req, res) => {
  const { tenTour, loaiDiaDiem, phuongTien, loaiTour, trangThai } = req.query;

const filter = {};

if (tenTour) {
  filter.tenTour = { $regex: tenTour, $options: 'i' };
}
if (loaiDiaDiem) {
  filter.loaiDiaDiem = { $regex: new RegExp(loaiDiaDiem, 'i') }; 
}
if (phuongTien) {
  const ptArray = phuongTien.split(',').map(item => item.trim());
  filter.phuongTien = { $in: ptArray };
}
if (loaiTour) {
  filter.loaiTour = { $regex: loaiTour, $options: 'i' };
}
if (trangThai) {
  filter.trangThai = { $regex: trangThai, $options: 'i' };
}
const tours = await Tour.find(filter);
res.json(tours);
});

// Lấy chi tiết một tour theo ID
router.get('/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ error: 'Không tìm thấy tour' });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy tour' });
  }
});

// Tạo tour mới
router.post('/', async (req, res) => {
    try {
      const newTour = new Tour(req.body);
      await newTour.save();
      res.status(201).json(newTour);
    } catch (err) {
      console.error('Lỗi tạo tour:', err);
      res.status(500).json({ message: 'Tạo tour thất bại', error: err.message });
    }
  });
  
// Cập nhật tour
router.put('/:id', async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTour) return res.status(404).json({ error: 'Không tìm thấy tour để cập nhật' });
    res.json(updatedTour);
  } catch (err) {
    res.status(400).json({ error: 'Lỗi khi cập nhật tour' });
  }
});

// Xóa tour
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Tour.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Không tìm thấy tour để xóa' });
    res.json({ message: 'Đã xóa tour thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa tour' });
  }
});
router.post('/upload-image', upload.single('hinhAnh'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không có file nào được tải lên' });
  }

  const imagePath = `/image/${req.file.filename}`;
  return res.status(200).json({ success: true, path: imagePath });
});

module.exports = router;
