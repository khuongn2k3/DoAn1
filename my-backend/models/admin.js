const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  hoTen: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  matKhau: { type: String, required: true },
  avatar: { type: String, default: 'admin1.jpg' },
});

module.exports = mongoose.model('Admin', adminSchema);
