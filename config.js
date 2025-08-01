// config.js

const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

const API_BASE_URL = isLocal
  ? 'http://localhost:3000'
  : 'https://d-l5f3.onrender.com';
const REDIRECT_URL = isLocal
  ? 'http://127.0.0.1:5500/index.html'
  : 'https://khuongn2k3.github.io/DoAn1/index.html';
const ADMIN_REDIRECT_URL = isLocal
  ? 'http://127.0.0.1:5500/Admin/admin_dashboard.html'
  : 'https://khuongn2k3.github.io/DoAn1/Admin/admin_dashboard.html';
  const AVATAR_BASE_URL = isLocal
  ? 'http://127.0.0.1:5500/avatar'
  : 'https://khuongn2k3.github.io/DoAn1/avatar';
