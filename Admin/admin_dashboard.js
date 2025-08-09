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
        <button onclick="suaKhachHang('${u._id}')">Sửa</button>
        <button style="background-color:red; onclick="xoaKhachHang('${u._id}', this)">Xoá</button>
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
      // Danh sách đặt tour
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
  