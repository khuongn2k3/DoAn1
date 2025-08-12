document.addEventListener('DOMContentLoaded', async function () {
  const authArea = document.getElementById('authArea');
  if (!authArea) return;

  const khachHangId = localStorage.getItem('khachHangId');

  if (khachHangId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api_khachhang/${khachHangId}`);
      const data = await res.json();
      
      if (data && data.email) {
        const avatarUrl = data.anhDaiDien && data.anhDaiDien.startsWith('http')
          ? data.anhDaiDien
          : `${AVATAR_BASE_URL}${data.anhDaiDien || 'usernew.png'}`;
        authArea.innerHTML = `
          <div class="user-avatar" onclick="location.href='${USER_BASE_URL}'" title="Trang cá nhân">
            <img src="${avatarUrl}" alt="Avatar" onerror="this.src='${AVATAR_BASE_URL}/usernew.png'" />
          </div>
        `;
      } else {
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
