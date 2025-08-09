const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  tenTour: { type: String, required: true },          
  moTa: { type: String },
  loaiDiaDiem: { type: String },
  phuongTien: [String],
  diemKhoiHanh: { type: String },                     
  diemDen: { type: String },                          

  loaiTour: { type: String },         
  soNgay: { type: Number },
  soDem: { type: Number }, 
  
  giaNguoiLon: { type: Number, required: true },      
  giaTreEm: { type: Number, default: 0 },             
  giaTreNho: { type: Number, default: 0 },            
  dichVuThem: [
    {
      ten: { type: String, required: true },
      gia: { type: Number, required: true }
    }
  ],
  hinhAnh: [String],
  lichTrinh: { type: String },

  trangThai: { type: String, default: "Hiển thị" },   
  ngayTao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('tour', tourSchema, 'tour');

