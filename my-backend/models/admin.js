const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: String,
  matKhau: String,
  hoTen: String,
  role: { type: String, default: 'admin' } 
});

module.exports = mongoose.model('Admin', adminSchema, 'Admin');
