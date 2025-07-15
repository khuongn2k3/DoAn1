document.addEventListener('DOMContentLoaded', function () {
  const authArea = document.getElementById('authArea');
  if (!authArea) return;

  const khachHangId = localStorage.getItem('khachHangId');

  if (khachHangId) {
    authArea.innerHTML = `
      <div class="user-icon" onclick="location.href='user.html'" title="Trang cá nhân">
        <i class="fas fa-user-circle"></i>
      </div>
    `;
  } else {
    authArea.innerHTML = `
      <a href="login_account.html" class="btn-login">Đăng Nhập</a>
      <a href="register_account.html" class="btn-register">Đăng Ký</a>
    `;
  }
});
