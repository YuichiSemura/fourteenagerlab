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

// biography
import { tsParticles } from '@tsparticles/engine';
import { loadLinksPreset } from '@tsparticles/preset-links';

// Initialize AOS
AOS.init({
  duration: 1200,
  once: true,
  offset: 50
});

window.isTransparentOfNavbar = true;

// index.html
const scrollEventIndex = function () {
  // navbarのcolor
  // navtitle の opacity
  window.addEventListener('scroll', function () {
    const threshold = window.innerHeight * 0.65;
    if (window.pageYOffset < threshold) {
      if (!window.isTransparentOfNavbar) {
        const navbar = document.querySelector('.navbar__index');
        if (navbar != null) {
          navbar.classList.add('navbar__transparent');
          navbar.classList.remove('navbar__blue');
        }
        const navTitle = document.querySelector('.nav_title__index');
        if (navTitle != null) {
          navTitle.classList.add('opacity-0');
        }
        const body = document.getElementById('body');
        if (body != null) {
          body.style.backgroundColor = 'rgb(90, 90, 90)';
        }
      }
      window.isTransparentOfNavbar = true;
    } else if (window.pageYOffset >= threshold) {
      if (window.isTransparentOfNavbar) {
        const navbar = document.querySelector('.navbar__index');
        if (navbar != null) {
          navbar.classList.add('navbar__blue');
          navbar.classList.remove('navbar__transparent');
        }
        const navTitle = document.querySelector('.nav_title__index');
        if (navTitle != null) {
          navTitle.classList.remove('opacity-0');
        }
        const body = document.getElementById('body');
        if (body != null) {
          body.style.backgroundColor = 'rgb(0, 72, 92)';
        }
      }
      window.isTransparentOfNavbar = false;
    }
  });
};

// biography.html
const scrollEventBiography = function () {
  // navbarのcolor
  // navtitle の opacity
  window.addEventListener('scroll', function () {
    const threshold = window.innerHeight * 0.65;
    if (window.pageYOffset < threshold && !window.isTransparentOfNavbar) {
      const navbar = document.querySelector('.navbar__bio');
      if (navbar != null) {
        navbar.classList.add('navbar__transparent');
        navbar.classList.remove('navbar__orange');
      }
      const body = document.getElementById('body');
      if (body != null) {
        body.style.backgroundColor = 'rgb(90, 90, 90)';
      }
      window.isTransparentOfNavbar = true;
    } else if (
      window.pageYOffset >= threshold &&
      window.isTransparentOfNavbar
    ) {
      const navbar = document.querySelector('.navbar__bio');
      if (navbar != null) {
        navbar.classList.add('navbar__orange');
        navbar.classList.remove('navbar__transparent');
      }
      const body = document.getElementById('body');
      if (body != null) {
        body.style.backgroundColor = 'rgba(145, 89, 0)';
      }
      window.isTransparentOfNavbar = false;
    }
  });
};

// biography.html
const particleJson = {
  background: {
    color: {
      // use transparent so the particle canvas does not cover the page/footer background
      value: 'transparent',
    },
  },
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 600,
      },
    },
    color: {
      value: '#ffffff',
    },
    shape: {
      type: 'circle',
      stroke: {
        width: 0,
        color: '#000000',
      },
      polygon: {
        nb_sides: 3,
      },
      image: {
        src: 'img/github.svg',
        width: 100,
        height: 100,
      },
    },
    opacity: {
      value: 0.3,
      random: false,
      anim: {
        enable: false,
        speed: 1,
        opacity_min: 0.1,
        sync: false,
      },
    },
    size: {
      value: 2,
      random: true,
      anim: {
        enable: false,
        speed: 40,
        size_min: 0.1,
        sync: false,
      },
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: '#ffffff',
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 2,
      direction: 'none',
      random: false,
      straight: false,
      out_mode: 'out',
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200,
      },
    },
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: {
        enable: false,
        mode: 'repulse',
      },
      onclick: {
        enable: false,
        mode: 'push',
      },
      resize: true,
    },
    modes: {
      grab: {
        distance: 400,
        line_linked: {
          opacity: 1,
        },
      },
      bubble: {
        distance: 400,
        size: 40,
        duration: 2,
        opacity: 8,
        speed: 3,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
      push: {
        particles_nb: 4,
      },
      remove: {
        particles_nb: 2,
      },
    },
  },
  retina_detect: true,
};

const drawBioKeywords = function () {
  const canvas = document.getElementById('el_kw_words_canvas');
  if (canvas.getContext) {
    const ctx = canvas.getContext('2d');
    canvas.height = 1200;
    canvas.width = (1200 * canvas.clientWidth) / canvas.clientHeight;
    const h = canvas.height;
    const w = canvas.width;
    ctx.fillStyle = '#6B6B6B';

    drawRectRotate(ctx, 31, w * 0.48, h * -0.1, w * 0.0625, h * 1.3);
    drawRectRotate(ctx, -29, w * 0.26, h * -0.1, w * 0.0625, h * 1.3);
    drawRectRotate(ctx, -80, w * -0.1, h * 0.7, w * 0.0625, h * 1.3);

    ctx.font = 'bold ' + Math.round(w * 0.072) + "px '游明朝'";
    ctx.fillStyle = '#fffafaff';
    drawTextRotate(ctx, 'Keywords', 0, w * 0.25, h * 0.6);

    ctx.font = Math.round(w * 0.03) + "px '游明朝'";
    ctx.fillStyle = '#EEEEEE';
    drawTextRotate(ctx, '「価値観の相違はあるんだよ」', 10, w * 0.42, h * 0.78);
    ctx.font = Math.round(w * 0.05) + "px '游明朝'";
    drawTextRotate(ctx, '7776', 100, w * 0.14, h * 0.18);
    drawTextRotate(ctx, '65536', 20, w * 0.73, h * 0.24);
    drawTextRotate(ctx, '1001', -10, w * 0.2, h * 0.9);
    drawTextRotate(ctx, '9', 30, w * 0.93, h * 0.95);
  }
};

const drawRectRotate = function (ctx, r, l, t, w, h) {
  const rot = (Math.PI * r) / 180;
  const ll = Math.cos(-rot) * l - Math.sin(-rot) * t;
  const tt = Math.sin(-rot) * l + Math.cos(-rot) * t;
  ctx.rotate(rot);
  ctx.fillRect(ll, tt, w, h);
  ctx.rotate(-rot);
};

const drawTextRotate = function (ctx, text, r, l, t) {
  const rot = (Math.PI * r) / 180;
  const ll = Math.cos(-rot) * l - Math.sin(-rot) * t;
  const tt = Math.sin(-rot) * l + Math.cos(-rot) * t;
  ctx.rotate(rot);
  ctx.fillText(text, ll, tt);
  ctx.rotate(-rot);
};

// 全pageの設定
window.onload = function () {
  const spinner = document.getElementById('loader');
  spinner.classList.add('el_loader_spinner__loaded');
  if (pageName === 'biography.html') {
    (async () => {
      await loadLinksPreset(tsParticles);
      await tsParticles.load({
        id: 'heroHeader_particles',
        options: {
          ...particleJson,
          preset: 'links',
        },
      });
    })();
  }
};

// pageごとの設定
const pathName = location.pathname;
const pageName = pathName.substring(pathName.lastIndexOf('/') + 1);
if (pageName === 'index.html' || pageName.length == 0) {
  scrollEventIndex();
} else if (pageName === 'biography.html') {
  // canvas の設定
  setInterval(drawBioKeywords, 250);
  scrollEventBiography();
}
