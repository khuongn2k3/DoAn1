const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: String,
  location: String,
  description: String,
  imageUrl: String
});

module.exports = mongoose.model('Destination', destinationSchema);
