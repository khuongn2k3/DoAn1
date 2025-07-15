   document.addEventListener('DOMContentLoaded', async function () {
      const khachHangId = localStorage.getItem('khachHangId');
      if (!khachHangId) {
        alert("Bạn chưa đăng nhập!");
        window.location.href = "login_account.html";
        return;
      }

      try {
        const res = await fetch(`https://<your-backend-domain>/api_khachhang/${khachHangId}`);
        const data = await res.json();

        document.getElementById('hoTen').textContent = data.hoTen;
        document.getElementById('email').textContent = data.email;
        document.getElementById('soDienThoai').textContent = data.soDienThoai;
        document.getElementById('diaChi').textContent = data.diaChi;
        document.getElementById('sidebarName').textContent = data.hoTen;
      } catch (err) {
        alert("Lỗi khi tải thông tin người dùng.");
      }

      document.getElementById('btnDangXuat').addEventListener('click', () => {
        localStorage.removeItem('khachHangId');
        window.location.href = 'login_account.html';
      });

      document.getElementById('btnSubmitChange').addEventListener('click', async () => {
        const oldPass = document.getElementById('oldPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const khachHangId = localStorage.getItem('khachHangId');

        if (!oldPass || !newPass) {
          alert("Vui lòng nhập đủ mật khẩu.");
          return;
        }

        try {
          const res = await fetch(`https://<your-backend-domain>/api_khachhang/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ khachHangId, oldPassword: oldPass, newPassword: newPass })
          });

          const result = await res.json();
          const msg = document.getElementById('statusMessage');
          if (res.ok) {
            msg.textContent = "✅ Đổi mật khẩu thành công!";
            msg.style.color = "green";
          } else {
            msg.textContent = "❌ " + (result.message || "Lỗi đổi mật khẩu");
            msg.style.color = "red";
          }
        } catch (err) {
          alert("Lỗi kết nối server.");
        }
      });
    });
