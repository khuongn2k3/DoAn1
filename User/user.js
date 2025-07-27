document.addEventListener('DOMContentLoaded', async function () {
  const khachHangId = localStorage.getItem('khachHangId');
  if (!khachHangId) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "../Auth/login_account.html";
    return;
  }

  let selectedAvatar = "";

  try {
    const res = await fetch(`${API_BASE_URL}/api_khachhang/${khachHangId}`);
    const data = await res.json();

    // Gán thông tin người dùng
    document.getElementById('hoTen').textContent = data.hoTen;
    document.getElementById('email').textContent = data.email;
    document.getElementById('soDienThoai').textContent = data.soDienThoai;
    document.getElementById('diaChi').textContent = data.diaChi;
    document.getElementById('sidebarName').textContent = data.hoTen;

    // Hiển thị ảnh đại diện hiện tại
    const avatarImg = document.querySelector('.sidebar img');
    avatarImg.src = data.anhDaiDien || '../avatar/usernew.png';

    selectedAvatar = data.anhDaiDien || '';

  } catch (err) {
    alert("Lỗi khi tải thông tin người dùng.");
  }

  // Đăng xuất
  document.getElementById('Btn_logout').addEventListener('click', () => {
    localStorage.removeItem('khachHangId');
    window.location.href = REDIRECT_URL;
  });

  // Đổi mật khẩu
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

   // Hiện các ảnh đại diện khi bấm nút
  const btnToggle = document.getElementById('Btn_choseimg');
  const avatarBox = document.getElementById('choseimg');

  btnToggle.addEventListener('click', () => {
    if (avatarBox.style.display === 'none' || avatarBox.style.display === '') {
      avatarBox.style.display = 'block';
    } else {
      avatarBox.style.display = 'none';
    }
  });
  // Xử lý chọn ảnh
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
});
