document.addEventListener('DOMContentLoaded', async function () {
  const khachHangId = localStorage.getItem('khachHangId');
  if (!khachHangId) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "login_account.html";
    return;
  }

  let selectedAvatar = "";

  try {
    const res = await fetch(`https://d-l5f3.onrender.com/api_khachhang/${khachHangId}`);
    const data = await res.json();

    // Gán thông tin người dùng
    document.getElementById('hoTen').textContent = data.hoTen;
    document.getElementById('email').textContent = data.email;
    document.getElementById('soDienThoai').textContent = data.soDienThoai;
    document.getElementById('diaChi').textContent = data.diaChi;
    document.getElementById('sidebarName').textContent = data.hoTen;

    // Hiển thị ảnh đại diện hiện tại
    const avatarImg = document.querySelector('.sidebar img');
    avatarImg.src = data.anhDaiDien || 'images/default-avatar.png';

    selectedAvatar = data.anhDaiDien || '';

  } catch (err) {
    alert("Lỗi khi tải thông tin người dùng.");
  }

  // Đăng xuất
  document.getElementById('btnDangXuat').addEventListener('click', () => {
    localStorage.removeItem('khachHangId');
    window.location.href = 'login_account.html';
  });

  // Đổi mật khẩu
  document.getElementById('btnSubmitChange').addEventListener('click', async () => {
    const oldPass = document.getElementById('oldPassword').value;
    const newPass = document.getElementById('newPassword').value;

    if (!oldPass || !newPass) {
      alert("Vui lòng nhập đủ mật khẩu.");
      return;
    }

    try {
      const res = await fetch(`https://d-l5f3.onrender.com/api_khachhang/change-password`, {
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

  // Chọn ảnh đại diện từ danh sách có sẵn
  const avatarOptions = document.querySelectorAll('.avatar-option');
  avatarOptions.forEach(img => {
    img.addEventListener('click', () => {
      avatarOptions.forEach(i => i.classList.remove('selected'));
      img.classList.add('selected');
      selectedAvatar = img.src;
    });
  });

  // Lưu ảnh đại diện mới
  document.getElementById('saveAvatarBtn').addEventListener('click', async () => {
    if (!selectedAvatar) {
      alert("Vui lòng chọn ảnh đại diện.");
      return;
    }

    try {
      const res = await fetch(`https://d-l5f3.onrender.com/api_khachhang/${khachHangId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anhDaiDien: selectedAvatar })
      });

      if (res.ok) {
        alert("Cập nhật ảnh đại diện thành công!");
        // Cập nhật lại ảnh bên sidebar ngay lập tức
        document.querySelector('.sidebar img').src = selectedAvatar;
      } else {
        alert("Không thể cập nhật ảnh.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi gửi yêu cầu.");
    }
  });
});
