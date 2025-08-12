// Hàm khởi động tìm kiếm dựa trên query trong URL
function initSearch() {
  const params = new URLSearchParams(window.location.search);
  const keyword = params.get("q");
  if (!keyword) return;
  document.getElementById("search-input").value = keyword;
  search(keyword);
}

// Chạy khi trang load lần đầu
document.addEventListener("DOMContentLoaded", () => {
  initSearch();
});

// Xử lý khi nhấn Enter
function handleEnter(event) {
  if (event.key === "Enter") {
    const keyword = document.getElementById('search-input').value.trim();
    if (keyword) {
      // Cập nhật URL mà không reload trang
      window.history.pushState({}, "", `search.html?q=${encodeURIComponent(keyword)}`);
      // Gọi lại tìm kiếm với từ khóa mới
      initSearch();
    }
  }
}

// Hàm gọi API tìm kiếm
async function search(keyword) {
  try {
    const response = await fetch(`${API_BASE_URL}/api_search?q=${encodeURIComponent(keyword)}`);
    const data = await response.json();
    displaySearchResults(data);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm:", error);
  }
}

// Hiển thị kết quả tìm kiếm
function displaySearchResults(results) {
  const container = document.getElementById("results");
  container.innerHTML = "";
  if (results.length === 0) {
    container.innerHTML = `<p style="margin-left:100px;">Không tìm thấy kết quả nào.</p>`;
    return;
  }
  results.forEach(item => {
    const card = document.createElement("div");
    card.className = "post-card result-item";
    card.innerHTML = `
      <a href="../Diadiem/${item.url}">
        <img src="../image/${item.image}" alt="${item.tenDiaDiem}" />
      </a>
      <h3>${item.mien}</h3>
      <p><strong>${item.tenDiaDiem}</strong></p>
      <p>${item.moTa}</p>
    `;
    container.appendChild(card);
  });
}
