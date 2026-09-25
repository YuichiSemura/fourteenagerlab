// Bootstrapのスタイルシート側の機能を読み込む
import '@popperjs/core';
import 'bootstrap/dist/css/bootstrap.min.css';

// BootstrapのJavaScript側の機能を読み込む
import 'bootstrap';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../scss/index.scss';

// Initialize AOS
AOS.init({
  duration: 1200,
  once: true,
  offset: 50,
});

// 全pageの設定
window.onload = function () {
  const spinner = document.getElementById('loader');
  spinner.classList.add('el_loader_spinner__loaded');
};
