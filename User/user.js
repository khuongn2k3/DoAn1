document.addEventListener('DOMContentLoaded', async function () {
  const khachHangId = localStorage.getItem('khachHangId');
  if (!khachHangId) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "../Auth/login_account.html";
    return;
  }
  const btnThongTin = document.getElementById("btn-thongTin");
  const sectionUserInfo = document.getElementById("userInfo"); 
  const btnDonDatTour = document.getElementById("btn-donDatTour");
  const sectionDonDatTour = document.getElementById("section-donDatTour");
  const tabHienTai = document.getElementById("tab-hientai");
  const tabLichSu = document.getElementById("tab-lichsu");
  const btnFavorite = document.getElementById('btn-favorite');
  const sectionFavorite = document.getElementById('favoriteTours');
  const btnPassword = document.querySelector('.btn-password');
  const sectionPassword = document.getElementById('passwordForm');

  if (btnThongTin && sectionUserInfo && sectionPassword) {
    btnThongTin.addEventListener("click", () => {

      sectionUserInfo.style.display = "block";
      sectionDonDatTour.style.display = "none";
      sectionPassword.style.display = "none";
    });
  }
  if (btnDonDatTour && sectionDonDatTour && sectionUserInfo && sectionPassword) {
    btnDonDatTour.addEventListener("click", () => {
      sectionDonDatTour.style.display = "block";
      sectionUserInfo.style.display = "none"; 
      sectionPassword.style.display = "none";
      tabHienTai.classList.add("active");
      tabLichSu.classList.remove("active");
      sectionFavorite.style.display = "none";
      document.getElementById("content-hientai").style.display = "block";
      document.getElementById("content-lichsu").style.display = "none";
      taiTourHienTai();
    });
  }
  if (tabHienTai && tabLichSu) {
    tabHienTai.addEventListener("click", () => {
      tabHienTai.classList.add("active");
      tabLichSu.classList.remove("active");
      document.getElementById("content-hientai").style.display = "block";
      document.getElementById("content-lichsu").style.display = "none";
      taiTourHienTai();
    });
  
    tabLichSu.addEventListener("click", () => {
      tabLichSu.classList.add("active");
      tabHienTai.classList.remove("active");
      document.getElementById("content-hientai").style.display = "none";
      document.getElementById("content-lichsu").style.display = "block";
      taiLichSuTour();
    });
  }
  if (btnFavorite && sectionFavorite) {
    btnFavorite.addEventListener("click", async () => {
      sectionUserInfo.style.display = "none";
      sectionDonDatTour.style.display = "none";
      sectionPassword.style.display = "none";
      sectionFavorite.style.display = "block";
      await taiTourYeuThich();
    });
  }
  if (btnPassword && sectionPassword && sectionUserInfo && sectionDonDatTour) {
    btnPassword.addEventListener("click", () => {
      sectionUserInfo.style.display = "none";
      sectionDonDatTour.style.display = "none";
      sectionPassword.style.display = "block";
      sectionFavorite.style.display = "none";
    });
  }
  if (sectionUserInfo) sectionUserInfo.style.display = "block";
  if (sectionDonDatTour) sectionDonDatTour.style.display = "none";
  
  let selectedAvatar = "";
  try {
    const res = await fetch(`${API_BASE_URL}/api_khachhang/${khachHangId}`);
    const data = await res.json();

    document.getElementById('hoTen').textContent = data.hoTen;
    document.getElementById('email').textContent = data.email;
    document.getElementById('soDienThoai').textContent = data.soDienThoai;
    document.getElementById('diaChi').textContent = data.diaChi;
    document.getElementById('sidebarName').textContent = data.hoTen;

    const avatarImg = document.querySelector('.sidebar img');
    avatarImg.src = data.anhDaiDien ? `${data.anhDaiDien}` : `${AVATAR_BASE_URL}/usernew.png`;

    selectedAvatar = data.anhDaiDien || '';

  } catch (err) {
    alert("Lỗi khi tải thông tin người dùng.");
  }

  document.getElementById('Btn_logout').addEventListener('click', () => {
    localStorage.removeItem('khachHangId');
    window.location.href = REDIRECT_URL;
  });

  document.getElementById('btnSubmitChange').addEventListener('click', async () => {
    const oldPass = document.getElementById('oldPassword').value;
    const newPass = document.getElementById('newPassword').value;

    if (!oldPass || !newPass) {
      alert("Vui lòng nhập đúng mật khẩu.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api_khachhang/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ khachHangId, oldPassword: oldPass, newPassword: newPass })
      });

      const result = await res.json();
      const msg = document.getElementById('statusMessage');
      if (res.ok) {
        msg.textContent = "Đổi mật khẩu thành công!";
        msg.style.color = "green";
      } else {
        msg.textContent = (result.message || "Lỗi đổi mật khẩu");
        msg.style.color = "red";
      }
    } catch (err) {
      alert("Lỗi kết nối server.");
    }
  });
  document.querySelectorAll('.avatar-option').forEach(img => {
    const fileName = img.getAttribute('data-avatar');
    img.src = `${AVATAR_BASE_URL}/${fileName}`;
  });

  const btnToggle = document.getElementById('Btn_choseimg');
  const avatarBox = document.getElementById('choseimg');

  btnToggle.addEventListener('click', () => {
    if (avatarBox.style.display === 'none' || avatarBox.style.display === '') {
      avatarBox.style.display = 'block';
    } else {
      avatarBox.style.display = 'none';
    }
  });
  const avatarOptions = document.querySelectorAll('.avatar-option');
  avatarOptions.forEach(img => {
    img.addEventListener('click', async () => {
      const selectedAvatar = img.getAttribute('src');

      avatarOptions.forEach(i => i.classList.remove('selected'));
      img.classList.add('selected');

      try {
        const res = await fetch(`${API_BASE_URL}/api_khachhang/${khachHangId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anhDaiDien: selectedAvatar })
        });

        const data = await res.json();
        if (res.ok) {
          alert("Đã cập nhật ảnh đại diện!");
          document.querySelector('.sidebar img').src = selectedAvatar;
        } else {
          alert(data.message || "Lỗi cập nhật.");
        }
      } catch (err) {
        alert("Lỗi khi gửi yêu cầu.");
      }
    });
  });
  taiTourHienTai();
  async function taiTourHienTai() {
    try {
      const res = await fetch(`${API_BASE_URL}/api_dattour/hientai/${khachHangId}`);
      const data = await res.json();
      const container = document.getElementById("content-hientai");
      container.innerHTML = "";
  
      if (data.length === 0) {
        container.innerHTML = "<p>Không có tour nào.</p>";
      } else {
        data.forEach(tour => {
          const html = `
            <div class="tour-item">
              <h4>${tour.tourId.tenTour}</h4>
              <p><b>Ngày khởi hành:</b> ${tour.ngayKhoiHanh}</p>
              <p><b>Thời gian:</b> ${tour.gioKhoiHanh}</p>
              <p><b>Trạng thái:</b> ${tour.trangThai}</p>
              <button class="btn-chitiet" onclick="toggleChiTiet('${tour._id}', '${tour.tourId._id}', this)">Chi tiết</button>
              <button class="btn-huy" data-id="${tour._id}">Huỷ tour</button>
              <div class="chitiet-tour" id="chitiet-${tour.tourId._id}" style="display: none; "></div>
            </div>
          `;
          container.innerHTML += html;
        });
        document.querySelectorAll('.btn-huy').forEach(btn => {
          btn.addEventListener('click', async function () {
            const id = this.dataset.id;
            await huyTour(id);
          });
        });
      }
    } catch (err) {
      console.error("Lỗi khi tải tour", err);
    }
  }
  async function taiLichSuTour() {
    try {
      const res = await fetch(`${API_BASE_URL}/api_dattour/lichsu/${khachHangId}`);
      const data = await res.json();
      const container = document.getElementById("content-lichsu");
      container.innerHTML = "";
  
      if (data.length === 0) {
        container.innerHTML = "<p>Không có lịch sử tour.</p>";
      } else {
        data.forEach(tour => {
          const html = `
            <div class="tour-item">
              <h4>${tour.tourId.tenTour}</h4>
              <p><b>Ngày khởi hành:</b> ${tour.ngayKhoiHanh}</p>
              <p><b>Trạng thái:</b> ${tour.trangThai}</p>
              <button class="btn-chitiet" onclick="toggleChiTiet('${tour._id}', '${tour.tourId._id}', this)">Chi tiết</button>
              <div class="chitiet-tour" id="chitiet-${tour.tourId._id}" style="display: none; "></div>
            </div>
          `;
          container.innerHTML += html;
        });
      }
    } catch (err) {
      console.error("Lỗi khi tải lịch sử tour:", err);
    }
  }
  async function huyTour(dattourId) {
    if (!confirm("Bạn có chắc muốn huỷ tour này?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api_dattour/${dattourId}`, {
        method: "DELETE", 
        headers: { "Content-Type": "application/json" }
      });

      const result = await res.json();
      if (res.ok) {
        alert("Đã huỷ tour thành công!");
        await taiTourHienTai(); 
      } else {
        alert(result.message || "Không thể huỷ tour.");
      }
    } catch (err) {
      console.error("Lỗi khi huỷ tour:", err);
    }
  }
});
async function toggleChiTiet(datTourId, tourId, btn) {
  const detailDiv = document.getElementById(`chitiet-${tourId}`);
  const isVisible = detailDiv.style.display === 'block';
  
  if (isVisible) {
    detailDiv.style.display = 'none';
    btn.textContent = "Chi tiết";
    return;
  }

  if (detailDiv.innerHTML.trim() !== "") {
    detailDiv.style.display = 'block';
    btn.textContent = "Ẩn chi tiết";
    return;
  }

  detailDiv.innerHTML = "<p>Đang tải chi tiết...</p>";
  detailDiv.style.display = 'block';

  try {
    const resDatTour = await fetch(`${API_BASE_URL}/api_dattour/${datTourId}`);
    if (!resDatTour.ok) throw new Error("Không lấy được thông tin đặt tour");
    const datTour = await resDatTour.json();

    let tour = datTour.tourId;
    if (!tour || !tour.tenTour) {
      const resTour = await fetch(`${API_BASE_URL}/api_tour/${tourId}`);
      if (!resTour.ok) throw new Error("Không lấy được thông tin tour");
      tour = await resTour.json();
    }

    const dichVuTourHTML = Array.isArray(tour.dichVuThem) && tour.dichVuThem.length > 0
      ? `<ul>${tour.dichVuThem.map(dv => `<li>${dv.ten} - ${dv.gia.toLocaleString()} VND</li>`).join('')}</ul>`
      : "Không có";

      let dichVuThemUser = "Không có";
      if (Array.isArray(datTour.dichVuThem)) {
        const selectedServices = datTour.dichVuThem.map(dv => {
          return `- ${dv.ten} (+${dv.gia.toLocaleString()} VND)`;
        });
      
        if (selectedServices.length > 0) {
          dichVuThemUser = selectedServices.join("<br>");
        }
      }
    detailDiv.innerHTML = `
      <div class="detail-box">
        <h4>🧭 Thông tin tour</h4>
        <p><b>Tên tour:</b> ${tour.tenTour}</p>
        <p><b>Điểm khởi hành:</b> ${tour.diemKhoiHanh}</p>
        <p><b>Điểm đến:</b> ${tour.diemDen}</p>
        <p><b>Loại tour:</b> ${tour.loaiTour}</p>
        <p><b>Thời gian:</b> ${tour.soNgay} ngày ${tour.soDem} đêm</p>
        <p><b>Phương tiện:</b> ${Array.isArray(tour.phuongTien) ? tour.phuongTien.join(', ') : "Không rõ"}</p>
        <p><b>Loại địa điểm:</b> ${tour.loaiDiaDiem}</p>
        <p><b>Dịch vụ tour:</b> ${dichVuTourHTML}</p>
        <hr/>
        <h4>📌 Thông tin đặt tour</h4>
        <p><b>Ngày khởi hành:</b> ${new Date(datTour.ngayKhoiHanh).toLocaleDateString()}</p>
        <p><b>Giờ khởi hành:</b> ${datTour.gioKhoiHanh || "Không rõ"}</p>
        <p><b>Người lớn:</b> ${datTour.soNguoiLon}</p>
        <p><b>Trẻ em:</b> ${datTour.soTreEm}</p>
        <p><b>Trẻ nhỏ:</b> ${datTour.soTreNho}</p>
        <p><b>Dịch vụ thêm:</b><br> ${dichVuThemUser}</p>
        <p><b>Tổng tiền:</b> ${datTour.tongTien?.toLocaleString() || "0"} VND</p>
        <p><b>Trạng thái:</b> ${datTour.trangThai}</p>
      </div>
    `;

    btn.textContent = "Ẩn chi tiết";

  } catch (err) {
    console.error(err);
    detailDiv.innerHTML = "<p style='color:red'>Không thể tải chi tiết tour.</p>";
  }
}
async function taiTourYeuThich() {
  const khachHangId = localStorage.getItem('khachHangId');
  if (!khachHangId) return;

  const listContainer = document.getElementById('favoriteList');
  listContainer.innerHTML = 'Đang tải...';

  try {
    const res = await fetch(`${API_BASE_URL}/api_favorite/danhsach/${khachHangId}`);
    const danhSachYeuThich = await res.json();

    listContainer.innerHTML = '';

    if (!Array.isArray(danhSachYeuThich) || danhSachYeuThich.length === 0) {
      listContainer.innerHTML = '<p>Bạn chưa có tour nào yêu thích.</p>';
      return;
    }

    for (const favorite of danhSachYeuThich) {
      const tourId = typeof favorite.tourId === 'object' ? favorite.tourId._id : favorite.tourId;
      const tourRes = await fetch(`${API_BASE_URL}/api_tour/${tourId}`);
      const tour = await tourRes.json();

      const div = document.createElement('div');
      div.className = 'tour-item';

      const imgSrc = Array.isArray(tour.hinhAnh) ? `${API_BASE_URL}/${tour.hinhAnh[0]}` : `${API_BASE_URL}/${tour.hinhAnh}`;

      div.innerHTML = `
        <div class="tour-thumbnail">
          <img src="${imgSrc}" alt="${tour.tenTour}">
        </div>
        <div class="tour-info">
          <h3>${tour.tenTour}</h3>
          <p><strong>Thời gian:</strong> ${tour.soNgay} ngày ${tour.soDem} đêm</p>
          <p><strong>Điểm khởi hành:</strong> ${tour.diemKhoiHanh}</p>
          <div class="tourfavorite-buttons">
            <button class="btn-detail" data-id="${tour._id}">Xem chi tiết</button>
            <button class="btn-remove" data-id="${tour._id}">Bỏ thích</button>
          </div>
        </div>
      `;
      listContainer.appendChild(div);
    }
document.querySelectorAll('.btn-detail').forEach(btn => {
  btn.addEventListener('click', function () {
    const tourId = this.dataset.id;
    window.location.href = `../Plan/plan.html?tourId=${tourId}`;
  });
});
document.querySelectorAll('.btn-remove').forEach(btn => {
  btn.addEventListener('click', async function () {
    const tourId = this.dataset.id;
    const khachHangId = localStorage.getItem('khachHangId');
    if (!tourId || !khachHangId) return;

    const ok = confirm("Bạn có chắc muốn bỏ thích tour này?");
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api_favorite/xoa`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ khachHangId, tourId })
      });
      if (res.ok) {
        alert("Đã bỏ thích tour.");
        taiTourYeuThich(); 
      } else {
        alert("Không thể bỏ thích.");
      }
    } catch (err) {
      console.error("Lỗi khi bỏ thích:", err);
    }
  });
});
} catch (err) {
console.error('Lỗi khi tải tour yêu thích:', err);
listContainer.innerHTML = '<p style="color:red;">Không thể tải dữ liệu.</p>';
}
}


