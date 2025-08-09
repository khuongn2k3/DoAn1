document.addEventListener("DOMContentLoaded", () => {
  const allSearchInputs = document.querySelectorAll('[data-type]');

  allSearchInputs.forEach(input => {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        const type = input.getAttribute("data-type");
        if (type === "tour") {
          searchTourDropdown();
        } else if (type === "order") {
          searchOrderDropdown();
        } else if (type === "user") {
          searchUser();
        }
      }
    });
  });
});
async function searchUser() {
  const keyword = document.getElementById("searchUserKeyword").value.toLowerCase().trim();

  try {
    const response = await fetch(`${API_BASE_URL}/api_khachhang`);
    const result = await response.json();
    const users = result;

    if (!keyword) {
      renderUserList(users);
      return;
    }

    const filteredUsers = users.filter(user =>
      user.hoTen?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword) ||
      user.soDienThoai?.toLowerCase().includes(keyword)
    );

    renderUserList(filteredUsers);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm khách hàng:", error);
  }
}
function clearSearchUser() {
  document.getElementById("searchUserKeyword").value = "";
  searchUser();
}
function renderUserList(users) {
  const tbody = document.getElementById("userList");
  tbody.innerHTML = "";

  if (!users || users.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5'>Không có khách hàng nào phù hợp.</td></tr>";
    return;
  }

  users.forEach(u => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${u.hoTen || ""}</td>
      <td>${u.email || ""}</td>
      <td>${u.soDienThoai || ""}</td>
      <td>${u.diaChi || ""}</td>
      <td>
        <button onclick="xoaUser('${u._id}')">Xóa</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}
async function searchTourDropdown() {
  const keyword = document.getElementById("searchKeyword").value.trim();
  const loaiDiaDiem = document.getElementById("searchLoaiDiaDiem").value;
  const loaiTour = document.getElementById("searchLoaiTour").value;
  const trangThai = document.getElementById("searchTrangThai").value;

  const params = new URLSearchParams();
  if (keyword) params.append("tenTour", keyword);
  if (loaiDiaDiem) params.append("loaiDiaDiem", loaiDiaDiem);
  if (loaiTour) params.append("loaiTour", loaiTour);
  if (trangThai) params.append("trangThai", trangThai);

  const isEmptySearch = !keyword && !loaiDiaDiem && !loaiTour && !trangThai;
  if (isEmptySearch) {
    loadData(); 
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api_tour/search?${params.toString()}`);
    if (!res.ok) throw new Error("Lỗi tìm kiếm");

    const data = await res.json();
    renderTourList(data);
  } catch (err) {
    console.error("Lỗi khi tìm kiếm:", err);
    renderTourList([]);
  }
}
function clearSearchTourFilter() {
  document.getElementById("searchKeyword").value = "";
  document.getElementById("searchLoaiDiaDiem").value = "";
  document.getElementById("searchLoaiTour").value = "";
  document.getElementById("searchTrangThai").value = "";
  searchTourDropdown();
}
function renderTourList(tours) {
  const tourList = document.getElementById('tourList');
  tourList.innerHTML = "";

  if (!tours || tours.length === 0) {
    tourList.innerHTML = "<tr><td colspan='13'>Không có tour nào phù hợp</td></tr>";
    return;
  }

  tours.forEach(t => {
    const row = document.createElement("tr");
    const ptArray = Array.isArray(t.phuongTien)
      ? t.phuongTien
      : t.phuongTien?.split(',').map(pt => pt.trim());

    row.innerHTML = `
      <td>${t.tenTour || ''}</td>
      <td>${t.loaiDiaDiem || ''}</td>
      <td>
        ${
          ptArray?.length
            ? ptArray.map(pt => `
                <label style="margin-right: 8px; display: inline-flex; align-items: center;">
                  ${pt}
                </label>`).join('')
            : ''
        }
      </td>
      <td>${t.diemKhoiHanh || ''}</td>
      <td>${t.diemDen || ''}</td>
      <td>${t.loaiTour || ''}</td>
      <td>${t.soNgay || 0}N/${t.soDem || 0}Đ</td>
      <td>${t.giaNguoiLon?.toLocaleString() || 0} đ</td>
      <td>${t.giaTreEm?.toLocaleString() || 0} đ</td>
      <td>${t.giaTreNho?.toLocaleString() || 0} đ</td>
      <td>
        ${
          t.dichVuThem?.length
            ? t.dichVuThem.map(dv => `<div>${dv.ten} (${dv.gia.toLocaleString()}đ)</div>`).join('')
            : 'Không có'
        }
      </td>
      <td>${t.trangThai || ''}</td>
      <td>
        <button onclick='suaTour("${t._id}")'>Sửa</button>
        <button onclick='xoaTour("${t._id}")'>Xóa</button>
      </td>
    `;
    tourList.appendChild(row);
  });
}
async function searchOrderDropdown() {
  const keyword = document.getElementById("searchOrderKeyword").value.trim().toLowerCase();
  const trangThai = document.getElementById("searchOrderStatus").value;
  const tuNgay = document.getElementById("searchTuNgay").value;
  const denNgay = document.getElementById("searchDenNgay").value;
  const loaiTour = document.getElementById("searchLoaiTour_Order").value;
  const dichVuThem = document.getElementById("searchDichVuThem").value;

  try {
    const res = await fetch(`${API_BASE_URL}/api_dattour`);
    const data = await res.json();

    const isNoFilter =
      !keyword && !trangThai && !tuNgay && !denNgay && !loaiTour && !dichVuThem;

    if (isNoFilter) {
      loadData();
      return;
    }

    const filtered = data.filter(order => {
      const tour = order.tourId || {};
      const khachHang = order.khachHangId || {};

      const keywordMatch = keyword === "" || (
        (tour.tenTour && tour.tenTour.toLowerCase().includes(keyword)) ||
        (tour.diemDen && tour.diemDen.toLowerCase().includes(keyword)) ||
        (khachHang?.hoTen && khachHang.hoTen.toLowerCase().includes(keyword))
      );

      const statusMatch = !trangThai || order.trangThai === trangThai;
      const dateMatch =
        (!tuNgay || new Date(order.ngayKhoiHanh).toISOString().slice(0, 10) >= tuNgay) &&
        (!denNgay || new Date(order.ngayKhoiHanh).toISOString().slice(0, 10) <= denNgay);
      const loaiMatch = !loaiTour || tour.loaiTour === loaiTour;
      const dichVuMatch = !dichVuThem || (
        order.dichVuThem.some(dv => dv.ten === dichVuThem)
      );

      return keywordMatch && statusMatch && dateMatch && loaiMatch  && dichVuMatch;
    });

    renderOrderList(filtered);
  } catch (err) {
    console.error("Lỗi khi tải/lọc đặt tour:", err);
  }
}
function clearOrderFilter() {
  document.getElementById("searchOrderKeyword").value = "";
  document.getElementById("searchOrderStatus").value = "";
  document.getElementById("searchTuNgay").value = "";
  document.getElementById("searchDenNgay").value = "";
  document.getElementById("searchLoaiTour_Order").value = "";
  document.getElementById("searchDichVuThem").value = "";
  searchOrderDropdown()
}
function renderOrderList(orders) {
  const tbody = document.getElementById("orderList");
  tbody.innerHTML = "";

  if (!orders.length) {
    tbody.innerHTML = "<tr><td colspan='5'>Không có dữ liệu</td></tr>";
    return;
  }

  orders.forEach(o => {
    const tour = o.tourId || {};
    const khach = o.khachHangId || {};

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${khach.hoTen || '---'}</td>
      <td>${tour.tenTour || '---'}</td>
      <td>${new Date(o.ngayDat).toLocaleDateString()}</td>
      <td>
        <select onchange="doiTrangThaiDatTour('${o._id}', this.value)">
          <option value="CHO_XAC_NHAN" ${o.trangThai === 'CHO_XAC_NHAN' ? 'selected' : ''}>Chờ xác nhận</option>
          <option value="DA_XAC_NHAN" ${o.trangThai === 'DA_XAC_NHAN' ? 'selected' : ''}>Đã xác nhận</option>
          <option value="DANG_DIEN_RA" ${o.trangThai === 'DANG_DIEN_RA' ? 'selected' : ''}>Đang diễn ra</option>
          <option value="DA_HOAN_THANH" ${o.trangThai === 'DA_HOAN_THANH' ? 'selected' : ''}>Đã hoàn thành</option>
          <option value="DA_HUY" ${o.trangThai === 'DA_HUY' ? 'selected' : ''}>Đã hủy</option>
        </select>
      </td>
      <td>
        <button onclick="xemChiTietTour('${tour._id || ''}')">Chi tiết tour</button>
        <button onclick='xemChiTietDatTour(${JSON.stringify(o).replace(/'/g, "\\'")})'>Chi tiết đặt</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

