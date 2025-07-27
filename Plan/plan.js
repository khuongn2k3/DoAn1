document.addEventListener('DOMContentLoaded', () => {
  const khachHangId = localStorage.getItem('khachHangId');
  if (!khachHangId) {
    alert('Vui lòng đăng nhập để lên kế hoạch du lịch!');
    window.location.href = `${REDIRECT_URL}/Auth/login_account.html`;
    return;
  }

  loadAllTours();

  document.querySelector('#bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    bookTour(khachHangId);
  });

  document.querySelector('button[onclick="timKiemTour()"]').addEventListener('click', timKiemTour);
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

function displayTours(tours) {
  allTours = tours.filter(tour => tour.trangThai === 'Hiển thị');
  currentPage = 1;
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
    card.innerHTML = `
      <img src="${API_BASE_URL}/${tour.hinhAnh}" alt="${tour.tenTour}">
      <div class="tour-item-content">
        <h4>${tour.tenTour}</h4>
        <p><strong>Điểm đến:</strong> ${tour.diemDen || '---'}</p>
        <p><strong>Loại tour:</strong> ${tour.loaiTour || '---'}</p>
        <p><strong>Khởi hành:</strong> ${tour.diemKhoiHanh || '---'}</p>
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


let currentTourId = null;
function showTourDetail(tour) {
  const detailSection = document.getElementById('tourDetails');
  const bookingForm = document.getElementById('bookingForm');
  const rightPanel = document.querySelector('.right-panel');

  
  if (currentTourId === tour._id) {
    detailSection.classList.add('hidden');
    bookingForm.classList.add('hidden');
    rightPanel.classList.add('hidden');
    currentTourId = null;
    return;
  }
  currentTourId = tour._id;
  currentTour = tour;
  detailSection.classList.remove('hidden');
  document.getElementById('tourImage').src = `${API_BASE_URL}/${tour.hinhAnh}`;
  document.getElementById('tourTitle').textContent = tour.tenTour;
  document.getElementById('tourDescription').textContent = tour.moTa || 'Chưa có mô tả.';
  document.getElementById('tourPriceAdult').textContent = tour.giaNguoiLon.toLocaleString() + 'đ';
  document.getElementById('tourPriceChild').textContent = tour.giaTreEm.toLocaleString() + 'đ';
  document.getElementById('tourPriceInfant').textContent = tour.giaTreNho.toLocaleString() + 'đ';
  document.getElementById('tourDuration').textContent = `${tour.soNgay} ngày ${tour.soDem} đêm`;

  const phuongTienIconMap = {
    'máy bay': '✈️',
    'xe khách': '🚌',
    'tàu hỏa': '🚆',
    'ô tô': '🚗',
  };

  const extraDiv = document.getElementById('extraTourInfo');
  extraDiv.innerHTML = ''; 
  extraDiv.classList.remove('hidden');

  if (tour.phuongTien && tour.phuongTien.length) {
    const ptLabel = document.createElement('p');
    ptLabel.innerHTML = '<strong>Phương tiện:</strong> ';
    tour.phuongTien.forEach(pt => {
      const icon = phuongTienIconMap[pt.trim().toLowerCase()] || '🚗';
      ptLabel.innerHTML += `<span class="transport-icon">${icon} ${pt}</span>`;
    });
    extraDiv.appendChild(ptLabel);
  }

  const oldBtn = document.getElementById('btnDatNgay');
  if (oldBtn) oldBtn.remove();

  const datBtn = document.createElement('button');
  datBtn.id = 'btnDatNgay';
  datBtn.textContent = 'ĐẶT NGAY';
  datBtn.className = 'btn-dat-ngay';
  extraDiv.appendChild(datBtn);

  document.getElementById('tourId').value = tour._id;
  bookingForm.classList.add('hidden');

  renderDichVuThem(tour.dichVuThem || []);
  setupTinhTienRealtime();
  tinhTongTien();
  datBtn.addEventListener('click', () => {
    const rightPanel = document.querySelector('.right-panel');
    rightPanel.classList.remove('hidden');
    bookingForm.classList.remove('hidden');
    bookingForm.scrollIntoView({ behavior: 'smooth' });
  });
}

// Tìm kiếm tour
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
  console.log('🔍 Query:', query.toString());

  fetch(`${API_BASE_URL}/api_tour/search?${query.toString()}`)
    .then(res => res.json())
    .then(data => displayTours(data))
    .catch(err => console.error('Lỗi khi tìm tour:', err));
}

// Đặt tour
let currentTour = null; 

// Hàm hiển thị dịch vụ thêm (dựa trên tour đang chọn)
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
    dichVuThem: Array.from(formData.getAll('dichVuThem')).map(i => currentTour.dichVuThem[i]),
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
