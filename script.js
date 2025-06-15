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
    
        function showSuggestions(value) {
          const val = value.trim().toLowerCase();
          if (!val) {
            suggestionsBox.style.display = 'none';
            suggestionsBox.innerHTML = '';
            return;
          }
    
          const matched = suggestionsData.filter(item => item.toLowerCase().includes(val));
          if (matched.length === 0) {
            suggestionsBox.style.display = 'none';
            suggestionsBox.innerHTML = '';
            return;
          }
    
          suggestionsBox.innerHTML = matched.map(item => `<div onclick="selectSuggestion('${item}')">${item}</div>`).join('');
          suggestionsBox.style.display = 'block';
        }
    
        function selectSuggestion(text) {
          input.value = text;
          suggestionsBox.style.display = 'none';
        }
    
        function search() {
          const query = input.value.trim();
          if (query) {
            // Chuyển sang trang kết quả với tham số q
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
          } else {
            alert('Vui lòng nhập từ khóa tìm kiếm!');
          }
        }
    
        // Ẩn suggestions khi click ra ngoài
        document.addEventListener('click', function(event) {
          if (!document.getElementById('search-container').contains(event.target)) {
            suggestionsBox.style.display = 'none';
          }
        });
        
        
        
        