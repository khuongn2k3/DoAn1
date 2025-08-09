const express = require('express');
const router = express.Router();
const DiaDiem = require('../models/diadiem');

router.get('/', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Thiếu từ khóa' });

  try {
    const regex = new RegExp(q, 'i');
    const results = await DiaDiem.find({
      $or: [
        { tenDiaDiem: regex },
        { moTa: regex },
        { mien: regex }
      ]
    }).limit(20);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});
router.post('/', async (req, res) => {
  try {
    const { mien, tenDiaDiem, moTa, image, url } = req.body;

    if (!mien || !tenDiaDiem || !moTa || !image || !url) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
    }
    const newDiaDiem = new DiaDiem({
      mien,
      tenDiaDiem,
      moTa,
      image,
      url
    });

    await newDiaDiem.save();
    res.status(201).json({ message: 'Địa điểm đã được tạo thành công', data: newDiaDiem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi server khi tạo địa điểm' });
  }
});

module.exports = router;