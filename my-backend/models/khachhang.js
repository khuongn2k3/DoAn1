const mongoose = require('mongoose');

const khachHangSchema = new mongoose.Schema({
  hoTen: String,
  email: { type: String, required: true, unique: true },
  soDienThoai: String,
  matKhau: { type: String, required: true },
  diaChi: String,
  anhDaiDien: { type: String, default: 'usernew.png' } 
  },{
    versionKey: false 
});

module.exports = mongoose.model('khachhang', khachHangSchema, 'khachhang');
