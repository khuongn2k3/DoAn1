document.addEventListener('DOMContentLoaded', () => {
  const adminId = localStorage.getItem('adminId');
  if (!adminId) {
    alert("Lỗi");
    window.location.href = REDIRECT_URL;
    return;
  }

  // Tabs
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

  // Dropdown phương tiện
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
      console.error('Lỗi đặt vé:', err);
    }
  // Tổng quan
    document.getElementById('userCount').textContent = users.length;
    document.getElementById('tourCount').textContent = tours.length;
    document.getElementById('orderCount').textContent = orders.length;

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
        <button onclick="xoaKhachHang('${u._id}', this)">Xoá</button>
        </td>
    `;
    userList.appendChild(row);
    });

  
      // Danh sách tour
      const tourList = document.getElementById('tourList');
      tourList.innerHTML = '';
      tours.forEach(t => {
        console.log('Phương tiện:', t.phuongTien);
        const row = document.createElement('tr');
        const ptArray = Array.isArray(t.phuongTien)
        ? t.phuongTien
        : t.phuongTien?.split(',').map(pt => pt.trim()); // tách chuỗi nếu cần

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
            <button onclick="xoaTour('${t._id}', this)">Xoá</button>
          </td>
        `;
        tourList.appendChild(row);
      });
      // Danh sách đặt tour
      const orderList = document.getElementById('orderList');
      orderList.innerHTML = '';
      orders.forEach(o => {
        orderList.innerHTML += `<tr><td>${o.hoTenKhach}</td><td>${o.tenTour}</td><td>${new Date(o.ngayDat).toLocaleDateString()}</td></tr>`;
      });
  
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  }
  
  // Xoá khách hàng
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
  
    // Gán dữ liệu nếu đang sửa
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
      form.elements['hinhAnhCu'].value = tour.hinhAnh || '';
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
  
      if (tour.hinhAnh) {
        const previewImage = document.getElementById('previewImage');
        previewImage.src = `${API_BASE_URL}/${tour.hinhAnh}`;
        previewImage.style.display = 'block';
      }
    } else {
      const previewImage = document.getElementById('previewImage');
      previewImage.src = '';
      previewImage.style.display = 'none';

      const dvContainer = document.getElementById('dichVuThemContainer');
      dvContainer.innerHTML = '';
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
    
    const hinhAnhFile = form.querySelector('input[name="hinhAnh"]').files[0];
    let imagePath = '';

    if (hinhAnhFile) {
      const imageForm = new FormData();
      imageForm.append('hinhAnh', hinhAnhFile);
    
      try {
        const uploadRes = await fetch(`${API_BASE_URL}/api_tour/upload-image`, {
          method: 'POST',
          body: imageForm,
        });
        const uploadData = await uploadRes.json();
    
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.message || 'Upload ảnh thất bại');
        }
    
        imagePath = uploadData.path;
        data.hinhAnh = imagePath;
      } catch (err) {
        console.error("Lỗi khi upload ảnh:", err);
        alert("Không thể tải ảnh lên!");
        return;
      }
    } else {
      data.hinhAnh = form.elements['hinhAnhCu'].value || '';
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

    console.log("Dịch vụ thêm gửi đi:", dichVuThem);
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
    const file = event.target.files[0];
    const previewImage = document.getElementById('previewImage');
  
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewImage.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      previewImage.src = '';
      previewImage.style.display = 'none';
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