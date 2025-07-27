const mongoose = require('mongoose');

const diaDiemSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  url: String
});

module.exports = mongoose.model('diadiem', diaDiemSchema, 'diadiem');
