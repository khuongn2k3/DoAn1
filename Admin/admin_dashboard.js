document.addEventListener('DOMContentLoaded', () => {
  const adminId = localStorage.getItem('adminId');
  if (!adminId) {
    alert("Lỗi");
    window.location.href = REDIRECT_URL;
    return;
  }

  const tabs = document.querySelectorAll('.sidebar li');
  const contents = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });
  if (tabs.length > 0) tabs[0].click();

  loadAdminInfo();
  loadData();

  const dropdown = document.getElementById('dropdownPhuongTien');
  const selected = dropdown.querySelector('.dropdown-selected');
  selected.addEventListener('click', () => {
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', function (e) {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
  // Đăng xuất
  document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminName');
      window.location.href = REDIRECT_URL;
    }
    else{
      window.location.href = ADMIN_REDIRECT_URL;
    }
  });
});
async function loadAdminInfo() {
  const adminId = localStorage.getItem('adminId');
  if (!adminId) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api_admin/${adminId}`);
    const admin = await res.json();

    document.getElementById('adminName').textContent = admin.hoTen;
    document.getElementById('adminAvatar').src = `avatar/${admin.avatar || 'admin.png'}`;
  } catch (err) {
    console.error('Không thể tải thông tin admin:', err);
  }
}
async function loadData() {
try {
    let users = [], tours = [], orders = [];

    try {
      const res = await fetch(`${API_BASE_URL}/api_khachhang`);
      if (res.ok) users = await res.json();
    } catch (err) {
      console.error('Lỗi khách hàng:', err);
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api_tour`);
      if (res.ok) tours = await res.json();
    } catch (err) {
      console.error('Lỗi tour:', err);
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api_dattour`);
      if (res.ok) orders = await res.json();
    } catch (err) {
      console.error('Lỗi đặt Tour:', err);
    }

    document.getElementById('userCount').textContent = users.length;
    document.getElementById('tourCount').textContent = tours.filter(t => t.trangThai !== 'Ẩn').length;
    document.getElementById('orderCount').textContent = orders.length;

    // --- Doanh thu (chỉ tính đơn đã hoàn thành) ---
    const revenue = orders
      .filter(o => o.trangThai === 'DA_HOAN_THANH')
      .reduce((sum, o) => sum + (o.tongTien || 0), 0);
    document.getElementById('revenueTotal').textContent = revenue.toLocaleString('vi-VN') + ' đ';

    // Doanh thu dự kiến (DA_XAC_NHAN + DANG_DIEN_RA)
    const revenueExpected = orders
      .filter(o => o.trangThai === 'DA_XAC_NHAN' || o.trangThai === 'DANG_DIEN_RA')
      .reduce((sum, o) => sum + (o.tongTien || 0), 0);
    document.getElementById('revenueExpected').textContent = revenueExpected.toLocaleString('vi-VN') + ' đ';

    // --- Trạng thái đơn ---


    // --- Thống kê tour ---

    // --- Top tour phổ biến ---
    const tourOrderCount = {};
    orders.forEach(o => {
      const tid = o.tourId?._id || o.tourId;
      const tname = o.tourId?.tenTour || 'Không rõ';
      if (!tid) return;
      if (!tourOrderCount[tid]) tourOrderCount[tid] = { name: tname, count: 0, revenueActual: 0, revenueExpected: 0 };
      tourOrderCount[tid].count++;
      if (o.trangThai === 'DA_HOAN_THANH') tourOrderCount[tid].revenueActual += o.tongTien || 0;
      if (o.trangThai === 'DA_XAC_NHAN' || o.trangThai === 'DANG_DIEN_RA') tourOrderCount[tid].revenueExpected += o.tongTien || 0;
    });
    const topTours = Object.values(tourOrderCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const topContainer = document.getElementById('topToursContainer');
    if (topContainer) {
      topContainer.innerHTML = '';
      if (topTours.length === 0) {
        topContainer.innerHTML = '<p style="color:#999">Chưa có đơn đặt nào.</p>';
      } else {
        topTours.forEach((t, i) => {
        const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
        const card = document.createElement('div');
        card.className = 'top-tour-card';
        card.innerHTML = `
          <div class="top-tour-rank">${medals[i]}</div>
          <div class="top-tour-name">${t.name}</div>
          <div class="top-tour-meta">
            <span>📋 ${t.count} đơn</span>
            <span>Thực tế: ${t.revenueActual.toLocaleString('vi-VN')} đ</span>
            <span>Dự kiến: ${t.revenueExpected.toLocaleString('vi-VN')} đ</span>
          </div>
        `;
        topContainer.appendChild(card);
        });
      }
    }

    // --- LƯU DATA TOÀN CỤC & VẼ BIỂU ĐỒ ---
    _allOrders = orders;
    _allTours  = tours;
    renderCharts({
      pending:   orders.filter(o => o.trangThai === 'CHO_XAC_NHAN').length,
      confirmed: orders.filter(o => o.trangThai === 'DA_XAC_NHAN').length,
      ongoing:   orders.filter(o => o.trangThai === 'DANG_DIEN_RA').length,
      done:      orders.filter(o => o.trangThai === 'DA_HOAN_THANH').length,
      cancelled: orders.filter(o => o.trangThai === 'DA_HUY').length,
    }, tours, topTours);
    updateRevenueChart();


  const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(u => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${u.hoTen}</td>
        <td>${u.email}</td>
        <td>${u.soDienThoai || ''}</td>
        <td>${u.diaChi || ''}</td>
        <td>
        <button onclick="suaKhachHang('${u._id}')">Sửa</button>
        <button style="background-color:red;" onclick="xoaKhachHang('${u._id}', this)">Xoá</button>
        </td>
    `;
    userList.appendChild(row);
    });
      const tourList = document.getElementById('tourList');
      tourList.innerHTML = '';
      tours.forEach(t => {
      const row = document.createElement('tr');
      const ptArray = Array.isArray(t.phuongTien)
      ? t.phuongTien
      : t.phuongTien?.split(',').map(pt => pt.trim()); 

      row.innerHTML = `
        <td>${t.tenTour}</td>
        <td>${t.loaiDiaDiem}</td>
        <td>
        ${
          ptArray && ptArray.length
            ? ptArray.map(pt => `
                <label style="margin-right: 8px; display: inline-flex; align-items: center;">
                  ${pt}
                </label>
              `).join('')
            : ''
        }
        </td>
        <td>${t.diemKhoiHanh || ''}</td>
        <td>${t.diemDen || ''}</td>
        <td>${t.loaiTour || ''}</td>
        <td>${t.thoiGian || `${t.soNgay || 0} ngày ${t.soDem || 0} đêm`}</td>
        <td>${t.giaNguoiLon?.toLocaleString() || '0'} đ</td>
        <td>${t.giaTreEm?.toLocaleString() || '0'} đ</td>
        <td>${t.giaTreNho?.toLocaleString() || '0'} đ</td>
        <td>
            ${
              t.dichVuThem?.length
                ? t.dichVuThem.map(dv => `<div>${dv.ten} (${dv.gia.toLocaleString()}đ)</div>`).join('')
                : 'Không có'
            }
        </td>
        <td>${t.trangThai || 'Hiển thị'}</td>
        <td>
          <button onclick="suaTour('${t._id}')">Sửa</button>
          <button style="background-color:red;" onclick="xoaTour('${t._id}', this)">Xoá</button>
        </td>
      `;
      tourList.appendChild(row);
    });

    const orderList = document.getElementById('orderList');
    orderList.innerHTML = '';
    orders.forEach(o => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${o.khachHangId?.hoTen || ''}</td>
        <td>${o.tourId?.tenTour || ''}</td>
        <td>${new Date(o.ngayDat).toLocaleDateString()}</td>
        <td>
          <select onchange="doiTrangThaiDatTour('${o._id}', this.value)">
            <option value="CHO_XAC_NHAN" ${o.trangThai === 'CHO_XAC_NHAN' ? 'selected' : ''}>Chờ xác nhận</option>
            <option value="DA_XAC_NHAN" ${o.trangThai === 'DA_XAC_NHAN' ? 'selected' : ''}>Đã xác nhận</option>
            <option value="DANG_DIEN_RA" ${o.trangThai === 'DANG_DIEN_RA' ? 'selected' : ''}>Đang diễn ra</option>
            <option value="DA_HOAN_THANH" ${o.trangThai === 'DA_HOAN_THANH' ? 'selected' : ''}>Đã hoàn thành</option>
          </select>
        </td>
        <td>
          <button onclick="xemChiTietTour('${o.tourId?._id || o.tourId}')">Chi tiết tour</button>
          <button onclick='xemChiTietDatTour(${JSON.stringify(o).replace(/'/g, "\\'")})'>Chi tiết đặt</button>
          <button style="background-color: red; color: white;" onclick="xoaDatTour('${o._id}', this)">Hủy đơn đặt</button>
        </td>
      `;
      orderList.appendChild(row);
    });
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu:", error);
  }
}
function moFormUser(user = null) {
  const modal = document.getElementById('userModal');
  const form = document.getElementById('userForm');
  const title = document.getElementById('modalUserTitle');
  form.reset();

  if (user) {
    title.textContent = 'Sửa Thông tin khách hàng';
    form.elements['_id'].value = user._id || '';
    form.elements['hoTen'].value = user.hoTen || '';
    form.elements['email'].value = user.email || '';
    form.elements['soDienThoai'].value = user.soDienThoai || '';
    form.elements['diaChi'].value = user.diaChi || '';
  } else {
    title.textContent = 'Thêm Khách hàng mới';
    form.elements['_id'].value = ''; 
  }

  modal.style.display = 'block';
}
document.getElementById('userForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const data = {
    hoTen: form.elements['hoTen'].value.trim(),
    email: form.elements['email'].value.trim(),
    soDienThoai: form.elements['soDienThoai'].value.trim(),
    diaChi: form.elements['diaChi'].value.trim(),
  };

  const id = form.elements['_id'].value;
  const method = id ? 'PUT' : 'POST';
  const url = id
    ? `${API_BASE_URL}/api_khachhang/${id}`
    : `${API_BASE_URL}/api_khachhang`;

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message || 'Lỗi khi lưu khách hàng');

    alert(id ? 'Cập nhật thành công!' : 'Thêm khách hàng thành công!');
    dongFormUser();
    loadData();
  } catch (err) {
    console.error(err);
    alert('Lỗi khi gửi dữ liệu khách hàng');
  }
});
function dongFormUser() {
  document.getElementById('userModal').style.display = 'none';
}
async function suaKhachHang(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api_khachhang/${id}`);
    if (!res.ok) throw new Error('Không tìm thấy khách hàng');
    const user = await res.json();
    moFormUser(user);
  } catch (err) {
    console.error('Lỗi khi tải khách hàng:', err);
    alert('Không thể tải thông tin khách hàng!');
  }
}
async function xoaKhachHang(id, btn) {
  if (!confirm('Bạn có chắc chắn muốn xoá khách hàng này?')) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api_khachhang/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      btn.closest('tr').remove();
    } else {
      alert('Xoá thất bại!');
    }
  } catch (err) {
    console.error('Lỗi xoá khách hàng:', err);
  }
}
function moFormTour(tour = null) {
  
  const modal = document.getElementById('tourModal');
  const form = document.getElementById('tourForm');
  document.getElementById('modalTitle').textContent = tour ? 'Sửa Tour' : 'Thêm Tour';
  form.reset();

  if (tour) {
    form.elements['_id'].value = tour._id || '';
    form.elements['tenTour'].value = tour.tenTour || '';
    form.elements['moTa'].value = tour.moTa || '';
    form.elements['loaiDiaDiem'].value = tour.loaiDiaDiem || '';
    form.elements['diemKhoiHanh'].value = tour.diemKhoiHanh || '';
    form.elements['diemDen'].value = tour.diemDen || '';
    form.elements['loaiTour'].value = tour.loaiTour || '';
    form.elements['soNgay'].value = tour.soNgay || 0;
    form.elements['soDem'].value = tour.soDem || 0;
    form.elements['giaNguoiLon'].value = tour.giaNguoiLon || 0;
    form.elements['giaTreEm'].value = tour.giaTreEm || 0;
    form.elements['giaTreNho'].value = tour.giaTreNho || 0;
    form.elements['lichTrinh'].value = tour.lichTrinh || '';
    form.elements['trangThai'].value = tour.trangThai || 'Hiển thị';

    const allPTCheckboxes = form.querySelectorAll('input[name="phuongTien"]');
    allPTCheckboxes.forEach(cb => cb.checked = false);
    const dvContainer = document.getElementById('dichVuThemContainer');
    dvContainer.innerHTML = ''; 
    if (Array.isArray(tour.phuongTien)) {
      tour.phuongTien.forEach(pt => {
        const checkbox = form.querySelector(`input[name="phuongTien"][value="${pt}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }
    if (Array.isArray(tour.dichVuThem)) {
      tour.dichVuThem.forEach(dv => {
        const row = document.createElement('div');
        row.className = 'dichvu-row';
        row.innerHTML = `
          <input type="text" name="dichVuThemTen[]" placeholder="Tên dịch vụ" value="${dv.ten || ''}" />
          <input type="number" name="dichVuThemGia[]" placeholder="Giá dịch vụ" value="${dv.gia || 0}" />
          <button type="button" onclick="xoaDichVu(this)">X</button>
        `;
        dvContainer.appendChild(row);
      });
    }

    if (Array.isArray(tour.hinhAnh)) {
      const previewContainer = document.getElementById('previewContainer');
      previewContainer.innerHTML = '';
      tour.hinhAnh.forEach(img => {
        const image = document.createElement('img');
        image.src = `${API_BASE_URL}${img}`;
        image.style.maxWidth = '150px';
        image.style.margin = '5px';
        previewContainer.appendChild(image);
      });
    
      form.elements['hinhAnhCu'].value = JSON.stringify(tour.hinhAnh);
    }
  } else {
    const previewContainer = document.getElementById('previewContainer');
    if (previewContainer) previewContainer.innerHTML = '';
  
    const dvContainer = document.getElementById('dichVuThemContainer');
    dvContainer.innerHTML = '';
    form.elements['hinhAnhCu'].value = '';
  }
      
  modal.style.display = 'block';
}
function dongFormTour() {
  document.getElementById('tourModal').style.display = 'none';
}

document.getElementById('tourForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  const hinhAnhFiles = form.querySelector('input[name="hinhAnh"]').files;
  let imagePaths = [];

  if (hinhAnhFiles.length > 0) {
    const imageForm = new FormData();
    for (let i = 0; i < hinhAnhFiles.length; i++) {
      imageForm.append('hinhAnh', hinhAnhFiles[i]); 
    }
    const hinhAnhCu = form.elements['hinhAnhCu'].value;
    if (hinhAnhCu) {
      try {
        const cuArray = JSON.parse(hinhAnhCu); 
        cuArray.forEach(oldImg => {
          imageForm.append('hinhAnhCu[]', oldImg);
        });
      } catch (e) {
        console.error('Lỗi ảnh cũ:', e);
      }
    }
    try {
      const uploadRes = await fetch(`${API_BASE_URL}/api_tour/upload-images`, {
        method: 'POST',
        body: imageForm,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Upload ảnh thất bại');
      }

      imagePaths = uploadData.hinhAnh;
      data.hinhAnh = imagePaths; 
    } catch (err) {
      console.error("Lỗi khi upload ảnh:", err);
      alert("Không thể tải ảnh lên!");
      return;
    }
  } else {
    let cu = form.elements['hinhAnhCu'].value;
    try {
      data.hinhAnh = cu ? JSON.parse(cu) : [];
    } catch (e) {
      data.hinhAnh = [];
    }
  }
  data.phuongTien = Array.from(form.querySelectorAll('input[name="phuongTien"]:checked'))
    .map(cb => cb.value);
  const soNgay = Number(form.querySelector('input[name="soNgay"]').value);
  const soDem = Number(form.querySelector('input[name="soDem"]').value);
  const tenDV = form.querySelectorAll('input[name="dichVuThemTen[]"]');
  const giaDV = form.querySelectorAll('input[name="dichVuThemGia[]"]');

  const dichVuThem = [];

  for (let i = 0; i < tenDV.length; i++) {
    const ten = tenDV[i].value.trim();
    const gia = parseFloat(giaDV[i].value);

    if (ten && !isNaN(gia)) {
      dichVuThem.push({ ten, gia });
    }
  }
  data.dichVuThem = dichVuThem;
  data.soNgay = soNgay;
  data.soDem = soDem;
  data.thoiGian = `${soNgay} ngày ${soDem} đêm`;
  data.giaNguoiLon = Number(data.giaNguoiLon);
  data.giaTreEm = Number(data.giaTreEm);
  data.giaTreNho = Number(data.giaTreNho);
  const isEditing = data._id && data._id.trim() !== '';
  if (!isEditing) delete data._id;

  const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing
    ? `${API_BASE_URL}/api_tour/${data._id}`
    : `${API_BASE_URL}/api_tour`;

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    if (!response.ok) {
      console.error("Phản hồi lỗi từ server:", responseData);
      throw new Error(responseData.message || 'Lỗi không xác định từ server');
    }

    alert(isEditing ? 'Cập nhật tour thành công!' : 'Thêm tour thành công!');
    dongFormTour();
    loadData();
  } catch (err) {
    console.error("Chi tiết lỗi:", err);
    alert('Đã xảy ra lỗi khi gửi dữ liệu!');
  }
});

async function suaTour(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api_tour/${id}`);
    if (!res.ok) throw new Error('Không tìm thấy tour');
    const tour = await res.json();
    moFormTour(tour);
  } catch (err) {
    console.error('Lỗi khi tải tour:', err);
    alert('Không thể tải thông tin tour!');
  }
}
async function xoaTour(id) {
  if (!confirm('Bạn chắc chắn muốn xóa tour này?')) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api_tour/${id}`, { method: 'DELETE' });

    if (!res.ok) throw new Error('Xóa thất bại');
    alert('Xóa tour thành công!');
    loadData();

  } catch (err) {
    console.error(err);
    alert('Đã xảy ra lỗi khi xóa!');
  }
}
document.getElementById('anhDaiDien').addEventListener('change', function (event) {
  const files = event.target.files;
  const previewContainer = document.getElementById('previewContainer');

  // Xóa preview cũ
  previewContainer.innerHTML = '';

  if (files && files.length > 0) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '150px';
        img.style.marginRight = '10px';
        img.style.marginBottom = '10px';
        img.style.border = '1px solid #ccc';
        img.style.borderRadius = '4px';
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }
});
function themDichVu() {
  const container = document.getElementById('dichVuThemContainer');
  const row = document.createElement('div');
  row.className = 'dichvu-row';
  row.innerHTML = `
    <input type="text" name="dichVuThemTen[]" placeholder="Tên dịch vụ" />
    <input type="number" name="dichVuThemGia[]" placeholder="Giá dịch vụ" />
    <button type="button" onclick="xoaDichVu(this)">X</button>
  `;
  container.appendChild(row);
}
function xoaDichVu(btn) {
  btn.parentElement.remove();
}
async function doiTrangThaiDatTour(id, trangThaiMoi) {
  try {
    const res = await fetch(`${API_BASE_URL}/api_dattour/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trangThai: trangThaiMoi }),
    });

    if (!res.ok) throw new Error('Cập nhật thất bại');
    alert('Cập nhật trạng thái thành công!');
  } catch (err) {
    console.error(err);
    alert('Lỗi khi cập nhật trạng thái');
  }
}

async function xemChiTietTour(tourId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api_tour/${tourId}`);
    if (!res.ok) throw new Error('Không tìm thấy tour');
    const tour = await res.json();
    const content = document.getElementById('tourDetailContent');
    content.innerHTML = `
      <h3>${tour.tenTour}</h3>
      <p><strong>Loại địa điểm:</strong> ${tour.loaiDiaDiem || ''}</p>
      <p><strong>Điểm khởi hành:</strong> ${tour.diemKhoiHanh || ''}</p>
      <p><strong>Điểm đến:</strong> ${tour.diemDen || ''}</p>
      <p><strong>Loại tour:</strong> ${tour.loaiTour || ''}</p>
      <p><strong>Thời gian:</strong> ${tour.thoiGian || `${tour.soNgay || 0} ngày ${tour.soDem || 0} đêm`}</p>
      <p><strong>Phương tiện:</strong> ${
        Array.isArray(tour.phuongTien) ? tour.phuongTien.join(', ') : tour.phuongTien
      }</p>
      <p><strong>Giá người lớn:</strong> ${tour.giaNguoiLon?.toLocaleString()} đ</p>
      <p><strong>Giá trẻ em:</strong> ${tour.giaTreEm?.toLocaleString()} đ</p>
      <p><strong>Giá trẻ nhỏ:</strong> ${tour.giaTreNho?.toLocaleString()} đ</p>
      <p><strong>Lịch trình:</strong> ${tour.lichTrinh || 'Không có'}</p>
      <p><strong>Dịch vụ thêm:</strong> ${
        (tour.dichVuThem || []).length
          ? tour.dichVuThem.map(dv => `${dv.ten} (${dv.gia.toLocaleString()}đ)`).join(', ')
          : 'Không có'
      }</p>
      <div><strong>Hình ảnh:</strong><br>
        ${
          (tour.hinhAnh || []).length
            ? tour.hinhAnh.map(img => `<img src="${API_BASE_URL}${img}" style="max-width:300px;margin:5px;">`).join('')
            : 'Không có'
        }
      </div>
    `;
    document.getElementById('tourDetailModal').style.display = 'block';
  } catch (err) {
    console.error(err);
    alert('Lỗi khi xem chi tiết tour');
  }
}

function xemChiTietDatTour(order) {
  try {
    const o = typeof order === 'string' ? JSON.parse(order) : order;
    const content = document.getElementById('orderDetailContent');

    content.innerHTML = `
      <p><strong>Khách hàng:</strong> ${o.khachHangId?.hoTen || ''}</p>
      <p><strong>Tour:</strong> ${o.tourId?.tenTour || ''}</p>
      <p><strong>Ngày đặt:</strong> ${new Date(o.ngayDat).toLocaleDateString()}</p>
      <p><strong>Khởi hành:</strong> ${new Date(o.ngayKhoiHanh).toLocaleDateString()} ${o.gioKhoiHanh || ''}</p>
      <p><strong>Người lớn:</strong> ${o.soNguoiLon}</p>
      <p><strong>Trẻ em:</strong> ${o.soTreEm}</p>
      <p><strong>Trẻ nhỏ:</strong> ${o.soTreNho}</p>
      <p><strong>Dịch vụ thêm:</strong> ${
        (o.dichVuThem || []).length > 0
          ? o.dichVuThem.map(d => `${d.ten} (${d.gia.toLocaleString()}đ)`).join(', ')
          : 'Không có'
      }</p>
      <p><strong>Tổng tiền:</strong> ${o.tongTien?.toLocaleString()} đ</p>
      <p><strong>Trạng thái:</strong> ${o.trangThai}</p>
    `;

    document.getElementById('orderDetailModal').style.display = 'block';
  } catch (err) {
    console.error(err);
    alert('Lỗi khi xem chi tiết đặt tour');
  }
}
function dongChiTietTour() {
  document.getElementById('tourDetailModal').style.display = 'none';
}
function dongChiTietDatTour() {
  document.getElementById('orderDetailModal').style.display = 'none';
}
function xoaDatTour(id, btn) {
  if (!confirm('Bạn có chắc muốn hủy đặt tour này?')) return;

  fetch(`${API_BASE_URL}/api_dattour/${id}`, {
    method: 'DELETE'
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    if (data.message.toLowerCase().includes('thành công')) {
      // Xóa dòng chứa nút bấm này khỏi bảng
      if (btn && btn.closest) {
        const tr = btn.closest('tr');
        if (tr) tr.remove();
      }
    }
  })
  .catch(err => console.error('Lỗi khi xóa:', err));
}

// ===== BIỂU ĐỒ CHART.JS =====
let _charts = {};
let _allOrders = [], _allTours = [], _allTopTours = [];

function destroyChart(key) {
  if (_charts[key]) { _charts[key].destroy(); delete _charts[key]; }
}

function renderCharts(orderStats, tours, topTours) {
  _allTopTours = topTours;

  const P = {
    yellow:  '#f59e0b',
    cyan:    '#06b6d4',
    indigo:  '#6366f1',
    green:   '#10b981',
    red:     '#ef4444',
    blue:    '#3b82f6',
    orange:  '#f97316',
    purple:  '#8b5cf6',
    slate:   '#64748b',
  };

  // ---- 1. Doughnut: trạng thái đơn ----
  destroyChart('orderStatus');
  const ctx1 = document.getElementById('chartOrderStatus').getContext('2d');
  _charts.orderStatus = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: ['Chờ xác nhận', 'Đã xác nhận', 'Đang diễn ra', 'Đã hoàn thành', 'Đã hủy'],
      datasets: [{
        data: [orderStats.pending, orderStats.confirmed, orderStats.ongoing, orderStats.done, orderStats.cancelled],
        backgroundColor: [P.yellow, P.cyan, P.indigo, P.green, P.red],
        borderWidth: 2, borderColor: '#fff',
      }]
    },
    options: {
      responsive: true, cutout: '62%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 12 } },
        tooltip: { callbacks: { label: c => ` ${c.label}: ${c.parsed} đơn` } },
        datalabels: false,
      }
    },
    plugins: [{
      id: 'centerLabels',
      afterDatasetsDraw(chart) {
        const { ctx, data } = chart;
        chart.getDatasetMeta(0).data.forEach((arc, i) => {
          const val = data.datasets[0].data[i];
          if (!val) return;
          const { x, y } = arc.tooltipPosition();
          ctx.save();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px Be Vietnam Pro, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val, x, y);
          ctx.restore();
        });
      }
    }]
  });

  // ---- 2. Pie: loại địa điểm ----
  destroyChart('tourType');
  const loaiList   = ['Biển', 'Núi', 'Rừng', 'Thành phố', 'Khác'];
  const loaiColors = [P.blue, P.indigo, P.green, P.orange, P.slate];
  const loaiData   = loaiList.map(l => tours.filter(t => t.loaiDiaDiem === l).length);
  const ctx2 = document.getElementById('chartTourType').getContext('2d');
  _charts.tourType = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: loaiList,
      datasets: [{
        data: loaiData,
        backgroundColor: loaiColors,
        borderWidth: 2, borderColor: '#fff',
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 12 } },
        tooltip: { callbacks: { label: c => ` ${c.label}: ${c.parsed} tour` } },
      }
    },
    plugins: [{
      id: 'pieLabels',
      afterDatasetsDraw(chart) {
        const { ctx, data } = chart;
        chart.getDatasetMeta(0).data.forEach((arc, i) => {
          const val = data.datasets[0].data[i];
          if (!val) return;
          const { x, y } = arc.tooltipPosition();
          ctx.save();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px Be Vietnam Pro, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val, x, y);
          ctx.restore();
        });
      }
    }]
  });

  // ---- 3. Horizontal bar: top 5 theo số đơn ----
  destroyChart('topByOrder');
  if (topTours.length > 0) {
    const ctx3 = document.getElementById('chartTopByOrder').getContext('2d');
    const labels3 = topTours.map(t => t.name.length > 28 ? t.name.slice(0,28)+'…' : t.name);
    _charts.topByOrder = new Chart(ctx3, {
      type: 'bar',
      data: {
        labels: labels3,
        datasets: [{
          label: 'Số đơn đặt',
          data: topTours.map(t => t.count),
          backgroundColor: P.blue + 'cc',
          borderColor: P.blue,
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => ` ${c.parsed.x} đơn` } }
        },
        scales: {
          x: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f1f5f9' } },
          y: { ticks: { font: { size: 12 } }, grid: { display: false } }
        }
      }
    });
  }

  // ---- 4. Horizontal bar: top 5 doanh thu thực tế vs dự kiến ----
  destroyChart('topByRevenue');
  if (topTours.length > 0) {
    const ctx4 = document.getElementById('chartTopByRevenue').getContext('2d');
    const labels4 = topTours.map(t => t.name.length > 28 ? t.name.slice(0,28)+'…' : t.name);
    _charts.topByRevenue = new Chart(ctx4, {
      type: 'bar',
      data: {
        labels: labels4,
        datasets: [
          {
            label: 'Thực tế',
            data: topTours.map(t => Math.round(t.revenueActual / 1000000 * 10) / 10),
            backgroundColor: P.green + 'cc',
            borderColor: P.green,
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: 'Dự kiến',
            data: topTours.map(t => Math.round(t.revenueExpected / 1000000 * 10) / 10),
            backgroundColor: P.orange + 'cc',
            borderColor: P.orange,
            borderWidth: 1,
            borderRadius: 4,
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 12 }, padding: 12 } },
          tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.x} triệu đ` } }
        },
        scales: {
          x: { beginAtZero: true, grid: { color: '#f1f5f9' }, title: { display: true, text: 'triệu đồng' } },
          y: { ticks: { font: { size: 12 } }, grid: { display: false } }
        }
      }
    });
  }
}

// ---- 5. Biểu đồ đường doanh thu theo thời gian ----
function buildRevenueLineData(orders, groupBy, from, to) {
  const actualOrders   = orders.filter(o => o.trangThai === 'DA_HOAN_THANH');
  const expectedOrders = orders.filter(o => o.trangThai === 'DA_XAC_NHAN' || o.trangThai === 'DANG_DIEN_RA');

  const fromDate = from ? new Date(from) : null;
  const toDate   = to   ? new Date(to)   : null;

  function getKey(dateStr) {
    const d = new Date(dateStr);
    if (groupBy === 'day')   return d.toISOString().slice(0,10);
    if (groupBy === 'month') return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    return String(d.getFullYear());
  }

  function inRange(dateStr) {
    const d = new Date(dateStr);
    if (fromDate && d < fromDate) return false;
    if (toDate   && d > toDate)   return false;
    return true;
  }

  const actualMap = {}, expectedMap = {};

  actualOrders.forEach(o => {
    if (!o.ngayDat || !inRange(o.ngayDat)) return;
    const k = getKey(o.ngayDat);
    actualMap[k] = (actualMap[k] || 0) + (o.tongTien || 0);
  });

  expectedOrders.forEach(o => {
    if (!o.ngayKhoiHanh || !inRange(o.ngayKhoiHanh)) return;
    const k = getKey(o.ngayKhoiHanh);
    expectedMap[k] = (expectedMap[k] || 0) + (o.tongTien || 0);
  });

  const allKeys = [...new Set([...Object.keys(actualMap), ...Object.keys(expectedMap)])].sort();

  return {
    labels: allKeys,
    actual:   allKeys.map(k => Math.round((actualMap[k]   || 0) / 1000000 * 10) / 10),
    expected: allKeys.map(k => Math.round((expectedMap[k] || 0) / 1000000 * 10) / 10),
  };
}

function updateRevenueChart() {
  const groupBy = document.getElementById('revenueGroupBy').value;
  const from    = document.getElementById('revenueFrom').value;
  const to      = document.getElementById('revenueTo').value;

  const { labels, actual, expected } = buildRevenueLineData(_allOrders, groupBy, from, to);

  destroyChart('revenueLine');
  const ctx = document.getElementById('chartRevenueLine').getContext('2d');
  _charts.revenueLine = new Chart(ctx, {
        type: 'bar', data: {
      labels,
      datasets: [
        {
          label: 'Doanh thu thực tế (triệu đ)',
          data: actual,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.75)',
          borderRadius: 4,
        },
        {
          label: 'Doanh thu dự kiến (triệu đ)',
          data: expected,
          borderColor: '#f97316',
          backgroundColor: 'rgba(249,115,22,0.70)',
          borderRadius: 4,
          borderDash: undefined,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top', labels: { font: { size: 12 }, padding: 14 } },
        tooltip: {
          callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y} triệu đ` }
        }
      },
      scales: {
        x: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 12 } } },
        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, title: { display: true, text: 'triệu đồng' } }
      }
    }
  });
}
