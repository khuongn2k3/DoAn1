function showSection(sectionId) {
    // Ẩn tất cả các section
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      section.style.display = 'none';
    });
  
    // Hiển thị section được chọn
    const activeSection = document.getElementById(sectionId);
    activeSection.style.display = 'block';
  }

  const PostContainer = document.getElementById('PostContainer');
        const moreBtn = document.getElementById('moreBtn');
        const cards = document.querySelectorAll('.post-card');
        let visibleCount = 2;

        moreBtn.addEventListener('click', () => {
            visibleCount += 2;
            cards.forEach((card, index) => {
                if (index < visibleCount) {
                    card.classList.add('visible');
                }
            });

            if (visibleCount >= cards.length) {
                moreBtn.style.display = 'none';
            }
        });
        const suggestionsData = [
          "Đà Lạt",
          "Hà Nội",
          "Hồ Chí Minh",
          "Vịnh Hạ Long",
          "Phú Quốc",
          "Huế",
          "Nha Trang",
          "Sapa",
          "Mũi Né",
          "Cần Thơ"
        ];
    
        const suggestionsBox = document.getElementById('suggestions');
        const input = document.getElementById('search-input');
        // Ẩn suggestions khi click ra ngoài
        document.addEventListener('click', function(event) {
          if (!document.getElementById('search-container').contains(event.target)) {
            suggestionsBox.style.display = 'none';
          }
        });

        const API_BASE = "https://d-l5f3.onrender.com"; 

function showSuggestions(keyword) {
  if (keyword.length === 0) {
    document.getElementById("suggestions").innerHTML = "";
    return;
  }

  fetch(`${API_BASE}/search?keyword=${encodeURIComponent(keyword)}`)
    .then(response => response.json())
    .then(data => {
      const suggestions = data.map(item => `<div>${item.ten}</div>`).join('');
      document.getElementById("suggestions").innerHTML = suggestions;
    })
    .catch(err => {
      console.error("Lỗi khi lấy gợi ý:", err);
    });
}
      
function search() {
  const keyword = input.value.trim();
  if (keyword) {
    window.location.href = `/DoAn1/Search.html?q=${encodeURIComponent(keyword)}`;
  }
}
function handleEnter(event) {
  if (event.key === 'Enter') {
    search();
  }
}       
document.getElementById('btnplan').addEventListener('click', function (e) {
    e.preventDefault();
    const khachHangId = localStorage.getItem('khachHangId');
    if (!khachHangId) {
        alert('Vui lòng đăng nhập trước khi lên kế hoạch!');
        window.location.href = 'Auth/login_account.html';
    } else {
        window.location.href = 'Plan/plan.html';
    }
});        
        
        
