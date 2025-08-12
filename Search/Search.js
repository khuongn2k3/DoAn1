function initSearch() {
  const searchInput = document.getElementById("search-input");
  const resultsContainer = document.getElementById("results");

  if (!searchInput || !resultsContainer) {
    console.error("Không tìm thấy phần tử search-input hoặc results.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const keyword = params.get("q");
  if (!keyword) return;

  searchInput.value = keyword;
  search(keyword);
}

document.addEventListener("DOMContentLoaded", () => {
  initSearch();
});

window.addEventListener("popstate", () => {
  initSearch();
});

function handleEnter(event) {
  if (event.key === "Enter") {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    const keyword = searchInput.value.trim();
    if (keyword) {
      window.history.pushState({}, "", `${SEARCH_PAGE_URL}?q=${encodeURIComponent(keyword)}`);
      initSearch();
    }
  }
}

async function search(keyword) {
  try {
    const response = await fetch(`${API_BASE_URL}/api_search?q=${encodeURIComponent(keyword)}`);
    const data = await response.json();
    displaySearchResults(data);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm:", error);
  }
}

function displaySearchResults(results) {
  const container = document.getElementById("results");
  if (!container) return;

  container.innerHTML = "";
  if (!Array.isArray(results) || results.length === 0) {
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
