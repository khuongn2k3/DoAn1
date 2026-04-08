// ===== HELPER: REMOVE VIETNAMESE ACCENT =====
function normalizeText(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/đ/g, "d")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

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

// ================= USER =================
async function searchUser() {
  const keyword = normalizeText(document.getElementById("searchUserKeyword").value);

  try {
    const response = await fetch(`${API_BASE_URL}/api_khachhang`);
    const result = await response.json();
    const users = result;

    if (!keyword) {
      renderUserList(users);
      return;
    }

    const filteredUsers = users.filter(user =>
      normalizeText(user.hoTen).includes(keyword) ||
      normalizeText(user.email).includes(keyword) ||
      normalizeText(user.soDienThoai).includes(keyword)
    );

    renderUserList(filteredUsers);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm khách hàng:", error);
    alert("Lỗi tải dữ liệu khách hàng");
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

// ================= TOUR =================
async function searchTourDropdown() {
  const keywordRaw = document.getElementById("searchKeyword").value.trim();
  const keyword = normalizeText(keywordRaw);

  const loaiDiaDiem = document.getElementById("searchLoaiDiaDiem").value;
  const loaiTour = document.getElementById("searchLoaiTour").value;
  const trangThai = document.getElementById("searchTrangThai").value;

  const isEmptySearch = !keywordRaw && !loaiDiaDiem && !loaiTour && !trangThai;
  if (isEmptySearch) {
    loadData(); 
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api_tour`);
    const tours = await res.json();

    const filtered = tours.filter(t => {
      const matchKeyword =
        !keyword ||
        normalizeText(t.tenTour).includes(keyword) ||
        normalizeText(t.diemDen).includes(keyword) ||
        normalizeText(t.diemKhoiHanh).includes(keyword);

      const matchLoaiDiaDiem = !loaiDiaDiem || t.loaiDiaDiem === loaiDiaDiem;
      const matchLoaiTour = !loaiTour || t.loaiTour === loaiTour;
      const matchTrangThai = !trangThai || t.trangThai === trangThai;

      return matchKeyword && matchLoaiDiaDiem && matchLoaiTour && matchTrangThai;
    });

    renderTourList(filtered);

  } catch (err) {
    console.error("Lỗi khi tìm kiếm:", err);
    alert("Lỗi kết nối server (tour)");
    renderTourList([]);
  }
}

function clearSearchTourFilter() {
  document.getElementById("searchKeyword").value = "";
  document.getElementById("searchLoaiDiaDiem").value = "";
  document.getElementById("searchLoaiTour").value = "";
  document.getElementById("searchTrangThai").value = "";
  loadData();
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

// ================= ORDER =================
async function searchOrderDropdown() {
  const keyword = normalizeText(document.getElementById("searchOrderKeyword").value);
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

      const keywordMatch = !keyword || (
        normalizeText(tour.tenTour).includes(keyword) ||
        normalizeText(tour.diemDen).includes(keyword) ||
        normalizeText(khachHang?.hoTen).includes(keyword)
      );

      const statusMatch = !trangThai || order.trangThai === trangThai;

      const d = new Date(order.ngayKhoiHanh);
      const dateStr = d.getFullYear() + "-" +
        String(d.getMonth()+1).padStart(2,'0') + "-" +
        String(d.getDate()).padStart(2,'0');

      const dateMatch =
        (!tuNgay || dateStr >= tuNgay) &&
        (!denNgay || dateStr <= denNgay);

      const loaiMatch = !loaiTour || tour.loaiTour === loaiTour;

      const dichVuMatch = !dichVuThem || (
        order.dichVuThem &&
        order.dichVuThem.some(dv => dv.ten === dichVuThem)
      );

      return keywordMatch && statusMatch && dateMatch && loaiMatch && dichVuMatch;
    });

    renderOrderList(filtered);
  } catch (err) {
    console.error("Lỗi khi tải/lọc đặt tour:", err);
    alert("Lỗi tải dữ liệu đơn đặt");
  }
}

function clearOrderFilter() {
  document.getElementById("searchOrderKeyword").value = "";
  document.getElementById("searchOrderStatus").value = "";
  document.getElementById("searchTuNgay").value = "";
  document.getElementById("searchDenNgay").value = "";
  document.getElementById("searchLoaiTour_Order").value = "";
  document.getElementById("searchDichVuThem").value = "";
  loadData();
}
