document.addEventListener('DOMContentLoaded', () => {
  const khachHangId = localStorage.getItem('khachHangId');
  if (!khachHangId) {
    alert('Vui lòng đăng nhập để lên kế hoạch du lịch!');
    window.location.href = `${AUTH_BASE_URL}/Auth/login_account.html`;
    return;
  }

  loadAllTours();
  
  document.querySelector('#bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    bookTour(khachHangId);
  });
  const btnQuayLai = document.querySelector('.btn-quay-lai');
  if (btnQuayLai) {
    btnQuayLai.addEventListener('click', () => {
      document.getElementById('bookingForm').classList.add('hidden');
      document.getElementById('tourDetails').classList.remove('hidden');
      document.getElementById('tourDetails').scrollIntoView({ behavior: 'smooth' });
    });
  }
  document.querySelector('button[onclick="timKiemTour()"]').addEventListener('click', timKiemTour);
  const prevBtn = document.getElementById('prevImageBtn');
  const nextBtn = document.getElementById('nextImageBtn');

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      if (!currentImageList.length) return;
      currentImageIndex = (currentImageIndex - 1 + currentImageList.length) % currentImageList.length;
      document.getElementById('tourImage').src = API_BASE_URL + currentImageList[currentImageIndex];
    });

    nextBtn.addEventListener('click', () => {
      if (!currentImageList.length) return;
      currentImageIndex = (currentImageIndex + 1) % currentImageList.length;
      document.getElementById('tourImage').src = API_BASE_URL + currentImageList[currentImageIndex];
    });
  }
});

function toggleDropdown(id) {
  document.getElementById(id).classList.toggle('open');
}

function loadAllTours() {
  fetch(`${API_BASE_URL}/api_tour`)
    .then(res => res.json())
    .then(displayTours)
    .catch(err => console.error('Lỗi khi tải tour:', err));
}

let allTours = [];
const TOURS_PER_PAGE = 12;
let currentPage = 1;

async function displayTours(tours) {
  allTours = tours.filter(tour => tour.trangThai === 'Hiển thị');
  currentPage = 1;
  await loadFavorites();
  renderToursByPage(currentPage);
  renderPagination();
}

function renderToursByPage(page) {
  const grid = document.getElementById('tourGrid');
  grid.innerHTML = '';

  const start = (page - 1) * TOURS_PER_PAGE;
  const end = start + TOURS_PER_PAGE;
  const pageTours = allTours.slice(start, end);

  pageTours.forEach(tour => {
    const card = document.createElement('div');
    card.className = 'tour-item';
    const isFavoriteTour = favoriteTourIds.includes(tour._id);
    card.innerHTML = `
      <div class="tour-image-wrapper">
        <i class="fas fa-heart ${isFavoriteTour ? 'active' : ''}"></i>
        <img src="${API_BASE_URL}/${Array.isArray(tour.hinhAnh) ? tour.hinhAnh[0] : tour.hinhAnh}" alt="${tour.tenTour}">
        <div class="tour-item-content">
          <h4>${tour.tenTour}</h4>
          <p><strong>Điểm đến:</strong> ${tour.diemDen || '---'}</p>
          <p><strong>Loại tour:</strong> ${tour.loaiTour || '---'}</p>
          <p><strong>Khởi hành:</strong> ${tour.diemKhoiHanh || '---'}</p>
        </div>
      </div>
      `;
      
    card.addEventListener('click', () => showTourDetail(tour));
    grid.appendChild(card);
  });
}

function renderPagination() {
  const totalPages = Math.ceil(allTours.length / TOURS_PER_PAGE);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '«';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderToursByPage(currentPage);
      renderPagination();
    }
  };
  pagination.appendChild(prevBtn);

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.classList.toggle('active', i === currentPage);
    btn.onclick = () => {
      currentPage = i;
      renderToursByPage(currentPage);
      renderPagination();
    };
    pagination.appendChild(btn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '»';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderToursByPage(currentPage);
      renderPagination();
    }
  };
  pagination.appendChild(nextBtn);
}

let currentImageList = [];
let currentImageIndex = 0;
let currentTourId = null;
function showTourDetail(tour) {
  const detailSection = document.getElementById('tourDetails');
  const bookingForm = document.getElementById('bookingForm');
  const rightPanel = document.querySelector('.right-panel');

  rightPanel.classList.remove('hidden'); 
  if (currentTourId === tour._id) {
    detailSection.classList.add('hidden');
    bookingForm.classList.add('hidden');
    rightPanel.classList.add('hidden');
    currentTourId = null;
    return;
  }
  document.getElementById('ReviewTourId').value = tour._id;
  currentTourId = tour._id;
  checkFavorite(currentTourId);
  currentTour = tour;
  detailSection.classList.remove('hidden');
  currentImageList = tour.hinhAnh || [];
  currentImageIndex = 0;

  if (currentImageList.length > 0) {
    document.getElementById('tourImage').src = API_BASE_URL + currentImageList[0];
  } else {
    document.getElementById('tourImage').src = "../image/default-tour.jpg";
  }
  document.getElementById('tourTitle').textContent = tour.tenTour;
  document.getElementById('tourDescription').textContent = tour.moTa || 'Chưa có mô tả.';
  document.getElementById('tourPriceAdult').textContent = tour.giaNguoiLon.toLocaleString() + 'đ';
  document.getElementById('tourPriceChild').textContent = tour.giaTreEm.toLocaleString() + 'đ';
  document.getElementById('tourPriceInfant').textContent = tour.giaTreNho.toLocaleString() + 'đ';
  document.getElementById('tourDuration').textContent = `${tour.soNgay} ngày ${tour.soDem} đêm`;
  const scheduleElement = document.getElementById('tourSchedule');
    if (tour.lichTrinh) {
      const formattedSchedule = tour.lichTrinh.replace(/\.\s*/g, '.<br>');
      scheduleElement.innerHTML = formattedSchedule;
    } else {
      scheduleElement.innerHTML = 'Chưa có lịch trình cụ thể.';
    }

  const phuongTienIconMap = {
    'máy bay': '✈️',
    'xe khách': '🚌',
    'tàu hỏa': '🚆',
    'ô tô': '🚗',
    'tàu' : '🚢'
  };

  const extraDiv = document.getElementById('extraTourInfo');
  extraDiv.innerHTML = ''; 
  extraDiv.classList.remove('hidden');

  if (tour.phuongTien && tour.phuongTien.length) {
    const ptLabel = document.createElement('p');
    ptLabel.innerHTML = '<strong>Phương tiện: <br></strong> ';
    tour.phuongTien.forEach(pt => {
      const icon = phuongTienIconMap[pt.trim().toLowerCase()] || '🚗';
      ptLabel.innerHTML += `<span class="transport-icon">${icon} ${pt}<br></span>`;
    });
    extraDiv.appendChild(ptLabel);
  }
  const datBtn = document.querySelector('.btn-dat-ngay');
  if (datBtn) {
    datBtn.onclick = () => {

      const rightPanel = document.querySelector('.right-panel');
      const bookingForm = document.getElementById('bookingForm');
      const detailSection = document.getElementById('tourDetails');
  
      detailSection.classList.add('hidden');
      bookingForm.classList.remove('hidden');
      rightPanel.classList.remove('hidden');
      
      bookingForm.scrollIntoView({ behavior: 'smooth' });
    };
  }

  document.getElementById('BookingTourId').value = tour._id;
  bookingForm.classList.add('hidden');
  renderDichVuThem(tour.dichVuThem || []);
  setupTinhTienRealtime();
  tinhTongTien();
  loadDanhGia(tour._id); 
}

function timKiemTour() {
  const tenTour = document.getElementById('inputTenTour').value.trim();
  const loaiDiaDiem = document.getElementById('selectDiaDiem').value;
  const selectedPhuongTien = [...document.querySelectorAll('#dropdownPhuongTien input[type="checkbox"]:checked')]
  .map(cb => cb.value);
  const loaiTour = document.getElementById('selectLoaiTour').value;
  const query = new URLSearchParams();

  if (tenTour) query.append('tenTour', tenTour);
  if (loaiDiaDiem) query.append('loaiDiaDiem', loaiDiaDiem);
  if (selectedPhuongTien.length > 0) query.append('phuongTien', selectedPhuongTien.join(','));
  if (loaiTour) query.append('loaiTour', loaiTour);


  fetch(`${API_BASE_URL}/api_tour/search?${query.toString()}`)
    .then(res => res.json())
    .then(data => displayTours(data))
    .catch(err => console.error('Lỗi khi tìm tour:', err));
}

// Đặt tour
let currentTour = null; 

function renderDichVuThem(dichVuThem) {
  const container = document.getElementById('dichVuThemContainer');
  container.innerHTML = '<label><strong>Dịch vụ thêm:</strong></label><div class="dich-vu-them-list"></div>';

  const list = container.querySelector('.dich-vu-them-list');
  
  dichVuThem.forEach((dv, index) => {
    const item = document.createElement('div');
    item.className = 'dich-vu-item';
    item.innerHTML = `
      <label>
        <input type="checkbox" name="dichVuThem" value="${index}">
        <span class="dv-ten">${dv.ten}</span>
        <span class="dv-gia">(+${dv.gia.toLocaleString()}đ)</span>
      </label>
    `;
    list.appendChild(item);
  });

  const checkboxes = list.querySelectorAll('input[name="dichVuThem"]');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const label = cb.closest('label')?.innerText.toLowerCase() || '';
      const isKhachSan = ['khách sạn', '2 sao', '3 sao', '4 sao', '5 sao'].some(keyword =>
        label.includes(keyword)
      );

      if (cb.checked && isKhachSan) {
        checkboxes.forEach(other => {
          if (other !== cb) {
            const otherLabel = other.closest('label')?.innerText.toLowerCase() || '';
            const isOtherKhachSan = ['khách sạn', '2 sao', '3 sao', '4 sao', '5 sao'].some(keyword =>
              otherLabel.includes(keyword)
            );
            if (isOtherKhachSan) other.checked = false;
          }
        });
      }
    });
  });
}
function tinhTongTien() {
  if (!currentTour) return;

  const soNguoiLon = parseInt(document.querySelector('input[name="soNguoiLon"]').value || '0');
  const soTreEm = parseInt(document.querySelector('input[name="soTreEm"]').value || '0');
  const soTreNho = parseInt(document.querySelector('input[name="soTreNho"]').value || '0');

  const giaNguoiLon = currentTour.giaNguoiLon || 0;
  const giaTreEm = currentTour.giaTreEm || 0;
  const giaTreNho = currentTour.giaTreNho || 0;

  let tongTien = (soNguoiLon * giaNguoiLon) + (soTreEm * giaTreEm) + (soTreNho * giaTreNho);

  const dichVuInputs = document.querySelectorAll('input[name="dichVuThem"]:checked');
  dichVuInputs.forEach(input => {
    const index = parseInt(input.value);
    const dv = currentTour.dichVuThem[index];
    if (dv) tongTien += dv.gia;
  });

  document.getElementById('tongTien').textContent = tongTien.toLocaleString();
  return tongTien;
}

function setupTinhTienRealtime() {
  const fields = ['soNguoiLon', 'soTreEm', 'soTreNho', 'dichVuThem'];
  fields.forEach(name => {
    document.querySelectorAll(`[name="${name}"]`).forEach(el => {
      el.addEventListener('input', tinhTongTien);
      el.addEventListener('change', tinhTongTien);
    });
  });
}

function bookTour(khachHangId) {
  const form = document.getElementById('bookingForm');
  const formData = new FormData(form);

  const data = {
    tourId: formData.get('tourId'),
    khachHangId: khachHangId,
    ngayKhoiHanh: formData.get('ngayKhoiHanh'),
    gioKhoiHanh: formData.get('gioKhoiHanh'),
    soNguoiLon: parseInt(formData.get('soNguoiLon') || '0'),
    soTreEm: parseInt(formData.get('soTreEm') || '0'),
    soTreNho: parseInt(formData.get('soTreNho') || '0'),
    dichVuThem: Array.from(formData.getAll('dichVuThem')).map(i => parseInt(i)),
    tongTien: tinhTongTien()
  };

  fetch(`${API_BASE_URL}/api_dattour`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(result => {
      if (result?.datTour) {
        alert('Đặt tour thành công!');
        form.reset();
        document.getElementById('tongTien').textContent = '0';
        location.reload();
      } else {
        alert(result.message || 'Đặt tour thất bại');
      }
    })
    .catch(err => {
      console.error('Lỗi khi đặt tour:', err);
      alert('Đã xảy ra lỗi khi đặt tour.');
    });
}

function resetBoLoc() {
  document.getElementById('inputTenTour').value = "";
  document.getElementById('selectDiaDiem').value = "";
  document.getElementById('selectLoaiTour').value = "";
  const checkboxes = document.querySelectorAll('#dropdownPhuongTien input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);
  document.getElementById('dropdownPhuongTien').classList.remove('open');
  loadAllTours();
}
async function loadDanhGia(tourId) {
  const khachHangId = localStorage.getItem('khachHangId');
  const hoTen = localStorage.getItem('hoTen');

  const res = await fetch(`${API_BASE_URL}/api_danhgia?tourId=${tourId}`);
  const data = await res.json();

  const myReview = data.find(dg => dg.khachHangId === khachHangId);
  const otherReviews = data.filter(dg => dg.khachHangId !== khachHangId);

  const mySection = document.getElementById('myReview');
  const myContent = document.getElementById('myReviewContent');
  if (myReview) {
    myContent.innerHTML = renderReview(myReview);
    mySection.classList.remove('hidden');
  } else {
    myContent.innerHTML = `<p>Bạn chưa đánh giá tour này.</p>`;
    mySection.classList.remove('hidden');
  }

  const otherList = document.getElementById('otherReviewsList');
  otherList.innerHTML = otherReviews.map(renderReview).join('');
}

function renderReview(dg) {
  return `
    <div class="review-item">
      <strong>${dg.hoTen}</strong> - ${dg.soSao} ★
      <p>${dg.noiDung}</p>
      <small>${new Date(dg.thoiGian).toLocaleDateString()}</small>
    </div>
  `;
}
document.getElementById('reviewForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const khachHangId = localStorage.getItem('khachHangId');
  const hoTen = localStorage.getItem('hoTen');
  const tourId = document.getElementById('ReviewTourId').value;

  const form = e.target;
  const soSao = form.soSao.value;
  const noiDung = form.noiDung.value;

  if (!khachHangId) {
    alert('Bạn cần đăng nhập để đánh giá');
    return;
  }

  const res = await fetch(`${API_BASE_URL}/api_danhgia`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tourId, khachHangId, hoTen, soSao, noiDung })
  });

  const result = await res.json();
  if (res.ok) {
    alert(result.message);
    form.reset();
    loadDanhGia(tourId); 
  } else {
    alert(result.message || 'Lỗi khi gửi đánh giá');
  }
});

const favoriteIcon = document.getElementById('favoriteIcon');
const favoriteText = document.getElementById('favoriteText');
let isFavorite = false;
let favoriteTourIds = [];
async function loadFavorites() {
  const khachHangId = localStorage.getItem('khachHangId');
  if (!khachHangId) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api_favorite/danhsach/${khachHangId}`);
    const data = await res.json();

    if (Array.isArray(data)) {
      favoriteTourIds = data.map(item => item.tourId._id);
    } else {
      favoriteTourIds = [];
      console.warn('Dữ liệu không hợp lệ từ server:', data);
    }
    renderToursByPage(currentPage);
    
  } catch (err) {
    console.error('Lỗi khi tải danh sách yêu thích:', err);
  }
}

async function checkFavorite(tourId) {
  const khachHangId = localStorage.getItem('khachHangId');
  if (!khachHangId) return;

  const res = await fetch(`${API_BASE_URL}/api_favorite/kiemtra`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ khachHangId, tourId })
  });
  const data = await res.json();
  isFavorite = data.favorite;
  updateFavoriteUI();
}

function updateFavoriteUI() {
  if (isFavorite) {
    favoriteIcon.classList.add('active');
    favoriteText.textContent = 'Đã yêu thích';
  } else {
    favoriteIcon.classList.remove('active');
    favoriteText.textContent = 'Thêm vào yêu thích';
  }
}

favoriteIcon.addEventListener('click', async () => {
  const khachHangId = localStorage.getItem('khachHangId');
  const tourId = currentTourId;
  if (!khachHangId || !tourId) return alert('Vui lòng đăng nhập');

  if (isFavorite) {
    await fetch(`${API_BASE_URL}/api_favorite/xoa`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ khachHangId, tourId })
    });
    isFavorite = false;
  } else {
    await fetch(`${API_BASE_URL}/api_favorite/them`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ khachHangId, tourId })
    });
    isFavorite = true;
  }
  updateFavoriteUI();
  await loadFavorites();  
});
