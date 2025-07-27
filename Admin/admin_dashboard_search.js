async function searchTourDropdown() {
    const keyword = document.getElementById("searchKeyword").value.trim();
    const loaiDiaDiem = document.getElementById("searchLoaiDiaDiem").value;
    const loaiTour = document.getElementById("searchLoaiTour").value;
    const trangThai = document.getElementById("searchTrangThai").value;
  
    const params = new URLSearchParams();
    if (keyword) params.append("tenTour", keyword);
    if (loaiDiaDiem) params.append("loaiDiaDiem", loaiDiaDiem);
    if (loaiTour) params.append("loaiTour", loaiTour);
    if (trangThai) params.append("trangThai", trangThai);
  
    try {
      const res = await fetch(`${API_BASE_URL}/api_tour/search?${params.toString()}`);
      if (!res.ok) throw new Error("Lỗi tìm kiếm");
  
      const data = await res.json();
      renderTourList(data);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm:", err);
      renderTourList([]);
    }
  }
  
  function clearSearchFilter() {
    document.getElementById("searchKeyword").value = "";
    document.getElementById("searchLoaiDiaDiem").value = "";
    document.getElementById("searchLoaiTour").value = "";
    document.getElementById("searchTrangThai").value = "";
    loadData(); 
  }
  function renderTourList(tours) {
    console.log("===> Gọi renderTourList với tours:", tours);
  
    const tourList = document.getElementById('tourList');
    tourList.innerHTML = "";
  
    if (!tours || tours.length === 0) {
      tourList.innerHTML = "<tr><td colspan='13'>Không có tour nào phù hợp</td></tr>";
      return;
    }
  
    tours.forEach(tour => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${tour.tenTour || ''}</td>
        <td>${tour.loaiDiaDiem || ''}</td>
        <td>${(tour.phuongTien || []).join(', ')}</td>
        <td>${tour.diemKhoiHanh || ''}</td>
        <td>${tour.diemDen || ''}</td>
        <td>${tour.loaiTour || ''}</td>
        <td>${tour.soNgay || 0}N/${tour.soDem || 0}Đ</td>
        <td>${tour.giaNguoiLon || 0}</td>
        <td>${tour.giaTreEm || 0}</td>
        <td>${tour.giaTreNho || 0}</td>
        <td>
          <ul>
            ${(tour.dichVuThem || []).map(dv => `<li>${dv.ten} - ${dv.gia}</li>`).join("")}
          </ul>
        </td>
        <td>${tour.trangThai || ''}</td>
        <td>
          <button onclick='suaTour("${tour._id}")'>Sửa</button>
          <button onclick='xoaTour("${tour._id}")'>Xóa</button>
        </td>
      `;
      tourList.appendChild(row);
    });
  }