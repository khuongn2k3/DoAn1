document.addEventListener('DOMContentLoaded', () => {
    const stepsContent = document.querySelectorAll('.step-content');
    const steps = document.querySelectorAll('.stepper .step');
    const progressBar = document.getElementById('progress-bar');
  
    let currentStep = 0; // index bắt đầu từ 0
  
    // Các nút next/back bạn cần gắn sự kiện, ví dụ:
    document.querySelectorAll('[id^="next-to-step-"]').forEach(button => {
      button.addEventListener('click', () => {
        if (currentStep < stepsContent.length - 1) {
          goToStep(currentStep + 1);
        }
      });
    });
  
    document.querySelectorAll('[id^="back-to-step-"]').forEach(button => {
      button.addEventListener('click', () => {
        if (currentStep > 0) {
          goToStep(currentStep - 1);
        }
      });
    });
  
    function goToStep(stepIndex) {
      // Ẩn tất cả nội dung step
      stepsContent.forEach((stepDiv, i) => {
        stepDiv.classList.toggle('active', i === stepIndex);
      });
  
      // Cập nhật stepper
      steps.forEach((stepElem, i) => {
        stepElem.classList.remove('active', 'completed');
        if (i < stepIndex) {
          stepElem.classList.add('completed');
        } else if (i === stepIndex) {
          stepElem.classList.add('active');
        }
      });
  
      // Cập nhật progress bar (theo %, bước cuối là 100%)
      const progressPercent = (stepIndex) / (steps.length - 1) * 100;
      progressBar.style.width = progressPercent + '%';
  
      currentStep = stepIndex;
    }
  
    // Khởi tạo hiển thị bước đầu tiên
    goToStep(0);
  });
  