const express = require('express');
const router = express.Router();
const DiaDiem = require('../models/diadiem'); 

// API tìm kiếm địa danh
router.get('/search', async (req, res) => {
  const keyword = req.query.q || '';
  try {
    const results = await DiaDiem.find({
      title: { $regex: keyword, $options: 'i' }
    });
    res.json(results);
  } catch (error) {
    console.error('Lỗi tìm kiếm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


module.exports = router;

