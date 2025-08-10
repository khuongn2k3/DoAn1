const express = require('express');
const router = express.Router();
const Tour = require('../models/tour');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/image');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

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
  
router.put('/:id', async (req, res) => {
  try {
    const tourId = req.params.id;
    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ success: false, message: 'Tour không tồn tại' });

    const updatedData = {
      ...req.body,
      hinhAnh: req.body.hinhAnh || tour.hinhAnh, 
    };

    const updatedTour = await Tour.findByIdAndUpdate(tourId, updatedData, { new: true });
    res.json({ success: true, tour: updatedTour });
  } catch (error) {
    console.error("Lỗi cập nhật tour:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Tour.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Không tìm thấy tour để xóa' });
    res.json({ message: 'Đã xóa tour thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa tour' });
  }
});
router.post('/upload-images', upload.fields([
  { name: 'hinhAnh', maxCount: 10 },
  { name: 'hinhAnhCu[]', maxCount: 20 }  
]), (req, res) => {
  try {
    const imagePaths = (req.files['hinhAnh'] || []).map(file => `/image/${file.filename}`);

    let hinhAnhCu = req.body['hinhAnhCu'] || req.body['hinhAnhCu[]'];
    const cuArray = Array.isArray(hinhAnhCu) ? hinhAnhCu : (hinhAnhCu ? [hinhAnhCu] : []);

    cuArray.forEach(oldImgPath => {
      const filename = path.basename(oldImgPath).trim();;
      const filePath = path.join(__dirname, '../public/image', filename);
      console.log('Đang xử lý xóa ảnh:', filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Đã xóa:', filename);
      } else {
        console.warn('Không tìm thấy ảnh:', filePath);
      }
    });

    res.json({ success: true, hinhAnh: imagePaths });
  } catch (error) {
    console.error('Lỗi upload ảnh:', error);
    res.status(500).json({ success: false, message: 'Lỗi upload ảnh', error });
  }
});
module.exports = router;
