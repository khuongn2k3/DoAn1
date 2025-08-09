document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const keyword = params.get("q");
    if (!keyword) return;
  
    document.getElementById("search-input").value = keyword;
  
    search(keyword);
  });
  
  function handleEnter(event) {
    if (event.key === "Enter") {
      const keyword = document.getElementById('search-input').value.trim();
      if (keyword) {
        window.location.href = `search.html?q=${encodeURIComponent(keyword)}`;
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
  