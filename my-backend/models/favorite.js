const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  khachHangId: { type: mongoose.Schema.Types.ObjectId, ref: 'khachhang', required: true },
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'tour', required: true },
}, {
  timestamps: true,
});

favoriteSchema.index({ khachHangId: 1, tourId: 1 }, { unique: true });

module.exports = mongoose.model('favorite', favoriteSchema, 'favorite');
