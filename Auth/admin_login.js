document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formAdminLogin');

  if (!form) {
    console.error("Không tìm thấy form #formAdminLogin");
    return;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const matKhau = document.getElementById('matKhau').value;
  
    const data = { email, matKhau };
  
    try {
      const res = await fetch(`${API_BASE_URL}/api_admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
  
      const result = await res.json();
      console.log('Phản hồi từ server:', result);
  
      if (res.ok) {
        localStorage.setItem('adminId', result.admin._id);
        window.location.href = ADMIN_REDIRECT_URL;
      } else {
        alert(result.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      alert("Lỗi khi kết nối tới máy chủ.");
      console.error('Lỗi:', err);
    }
  });
});
