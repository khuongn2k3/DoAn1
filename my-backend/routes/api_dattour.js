const express = require('express');
const router = express.Router();
const DatTour = require('../models/dattour');
const Tour = require('../models/tour');
const KhachHang = require('../models/khachhang'); 

router.post('/', async (req, res) => {
  try {
    const {
      tourId,
      khachHangId,
      ngayKhoiHanh,
      gioKhoiHanh,
      soNguoiLon,
      soTreEm,
      soTreNho,
      dichVuThem 
    } = req.body;

    const tour = await Tour.findById(tourId);
    if (!tour) return res.status(404).json({ message: 'Không tìm thấy tour' });

    let dichVuThemObjects = [];
    let tongTien =
      (tour.giaNguoiLon || 0) * soNguoiLon +
      (tour.giaTreEm || 0) * soTreEm +
      (tour.giaTreNho || 0) * soTreNho;

    if (Array.isArray(dichVuThem)) {
      dichVuThem.forEach(index => {
        const dv = tour.dichVuThem[index];
        if (dv) {
          tongTien += dv.gia || 0;
          dichVuThemObjects.push({
            ten: dv.ten,
            gia: dv.gia
          });
        }
      });
    }
    // Lưu bản ghi
    const newDatTour = new DatTour({
      tourId,
      khachHangId,
      ngayKhoiHanh,
      gioKhoiHanh,
      soNguoiLon,
      soTreEm,
      soTreNho,
      dichVuThem: dichVuThemObjects,
      tongTien
    });

    await newDatTour.save();
    res.json({ message: 'Đặt tour thành công', datTour: newDatTour });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server khi đặt tour' });
  }
});
router.get('/', async (req, res) => {
  try {
    const { trangThai, khachHangId, tourId } = req.query;

    const query = {};
    if (trangThai) query.trangThai = trangThai;
    if (khachHangId) query.khachHangId = khachHangId;
    if (tourId) query.tourId = tourId;

    const datTours = await DatTour.find(query)
      .populate('tourId')
      .populate('khachHangId');

    res.json(datTours);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách đặt tour:", err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const updated = await DatTour.findByIdAndUpdate(
      req.params.id,
      { trangThai: req.body.trangThai },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy đơn đặt tour' });
    res.json({ message: 'Cập nhật thành công', datTour: updated });
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

async function getTourHienTai(req, res) {
  try {
    const { khachHangId } = req.params;
    const tours = await DatTour.find({
      khachHangId,
      trangThai: { $in: ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_DIEN_RA'] }
    }).populate('tourId');
    res.json(tours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy tour hiện tại' });
  }
}
async function getLichSuTour(req, res) {
  try {
    const { khachHangId } = req.params;
    const tours = await DatTour.find({
      khachHangId,
      trangThai: { $in: ['DA_HOAN_THANH', 'DA_HUY'] }
    }).populate('tourId');
    res.json(tours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy lịch sử tour' });
  }
}
router.get('/hientai/:khachHangId', getTourHienTai);
router.get('/lichsu/:khachHangId', getLichSuTour);
router.get('/:id', async (req, res) => {
  try {
    const datTour = await DatTour.findById(req.params.id).populate('tourId');
    if (!datTour) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(datTour);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    const result = await DatTour.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt tour để hủy' });
    }
    res.json({ message: 'Hủy thành công', deleted: result });
  } catch (error) {
    console.error('Lỗi khi hủy đặt tour:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
module.exports = router;
