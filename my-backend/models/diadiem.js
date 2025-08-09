const mongoose = require('mongoose');

const diaDiemSchema = new mongoose.Schema({
  mien: String,
  tenDiaDiem: String,
  moTa: String,
  image: String,
  url: String
});

module.exports = mongoose.model('diadiem', diaDiemSchema, 'diadiem');
