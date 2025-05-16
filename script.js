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