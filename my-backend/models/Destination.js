const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  url: String
});

module.exports = mongoose.model('diadiem', destinationSchema);
