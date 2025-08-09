const mongoose = require('mongoose');

const danhGiaSchema = new mongoose.Schema({
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'tour', required: true },
  khachHangId: { type: mongoose.Schema.Types.ObjectId, ref: 'khachhang', required: true },
  hoTen: { type: String, required: true },
  soSao: { type: Number, required: true, min: 1, max: 5 },
  noiDung: { type: String, required: true },
  thoiGian: { type: Date, default: Date.now }
});

module.exports = mongoose.model('danhgia', danhGiaSchema, 'danhgia');