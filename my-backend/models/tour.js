const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  tenTour: String,
  gia: Number,
  ngayKhoiHanh: Date,
  soNgay: Number,
  diemKhoiHanh: String,        
  moTa: String,
  hinhAnh: String,
});

module.exports = mongoose.model('tour', tourSchema);
