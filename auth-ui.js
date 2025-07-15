// auth-ui.js

document.addEventListener('DOMContentLoaded', function () {
  const authArea = document.getElementById('authArea');
  if (!authArea) return;

  const khachHangId = localStorage.getItem('khachHangId');

  if (khachHangId) {
    authArea.innerHTML = `
      <div class="user-icon" onclick="location.href='trangcanhan.html'" title="Trang cá nhân">
        <i class="fas fa-user-circle"></i>
      </div>
    `;
  } else {
    authArea.innerHTML = `
      <a href="dangnhap.html" class="btn-login">Đăng Nhập</a>
      <a href="dangky.html" class="btn-register">Đăng Ký</a>
    `;
  }
});
