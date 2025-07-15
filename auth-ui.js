document.addEventListener('DOMContentLoaded', async function () {
  const authArea = document.getElementById('authArea');
  if (!authArea) return;

  const khachHangId = localStorage.getItem('khachHangId');

  if (khachHangId) {
    try {
      const res = await fetch(`https://d-l5f3.onrender.com/api_khachhang/${khachHangId}`);
      const data = await res.json();

      // Kiểm tra hợp lệ - có dữ liệu người dùng
      if (data && data.email) {
        authArea.innerHTML = `
          <div class="user-icon" onclick="location.href='user.html'" title="Trang cá nhân">
            <i class="fas fa-user-circle"></i>
          </div>
        `;
      } else {
        // Không hợp lệ: xóa localStorage
        localStorage.removeItem('khachHangId');
        showLoginRegister(authArea);
      }
    } catch (err) {
      console.error("Lỗi xác thực:", err);
      localStorage.removeItem('khachHangId');
      showLoginRegister(authArea);
    }
  } else {
    showLoginRegister(authArea);
  }

  function showLoginRegister(container) {
    container.innerHTML = `
      <a href="login_account.html" class="btn-login">Đăng Nhập</a>
      <a href="register_account.html" class="btn-register">Đăng Ký</a>
    `;
  }
});
