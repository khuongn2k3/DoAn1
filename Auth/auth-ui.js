document.addEventListener('DOMContentLoaded', async function () {
  const authArea = document.getElementById('authArea');
  if (!authArea) return;

  const khachHangId = localStorage.getItem('khachHangId');

  if (khachHangId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api_khachhang/${khachHangId}`);
      const data = await res.json();

      
      if (data && data.email) {
        const avatarUrl = data.anhDaiDien || 'avatar/user.png';
        authArea.innerHTML = `
          <div class="user-avatar" onclick="location.href='User/user.html'" title="Trang cá nhân">
            <img src="${avatarUrl}" alt="Avatar" onerror="this.src='avatar/user.png'" />
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
      <a href="Auth/login_account.html" class="btn-login">Đăng Nhập</a>
      <a href="Auth/register_account.html" class="btn-register">Đăng Ký</a>
    `;
  }
});
