function showSection(sectionId) {
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.style.display = 'none';
  });
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
function handleEnter(event) {
  if (event.key === 'Enter') {
    search();
  }
}

function search() {
  const keyword = document.getElementById('search-input').value.trim();
  if (!keyword) return;
  window.location.href = `Search/Search.html?q=${encodeURIComponent(keyword)}`;
}     
document.getElementById('btnplan').addEventListener('click', function (e) {
    e.preventDefault();
    const khachHangId = localStorage.getItem('khachHangId');
    if (!khachHangId) {
        alert('Vui lòng đăng nhập trước khi lên kế hoạch!');
        window.location.href = 'Auth/login_account.html';
    } else {
        window.location.href = PLAN_BASE_URL;
    }
});        
        
        
