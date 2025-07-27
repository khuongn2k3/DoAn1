const mongoose = require('mongoose');

const datTourSchema = new mongoose.Schema({
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'tour', required: true },
  khachHangId: { type: mongoose.Schema.Types.ObjectId, ref: 'khachhang', required: true },

  ngayKhoiHanh: { type: Date, required: true },
  gioKhoiHanh: { type: String },                 

  soNguoiLon: { type: Number, default: 1 },
  soTreEm: { type: Number, default: 0 },
  soTreNho: { type: Number, default: 0 },

  dichVuThem: [String],                             

  tongTien: { type: Number },                      
  trangThai: {
    type: String,
    enum: ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DA_THANH_TOAN', 'DANG_DIEN_RA', 'DA_HOAN_THANH', 'DA_HUY'],
    default: 'CHO_XAC_NHAN'
  },
  ngayDat: { type: Date, default: Date.now },
  ngayXacNhan: { type: Date },
  ngayThanhToan: { type: Date },
  ngayHuy: { type: Date }
});

module.exports = mongoose.model('dattour', datTourSchema, 'dattour');
