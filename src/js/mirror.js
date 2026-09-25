// 鏡面世界のページ（トップ・Products・Biography）に共通の演出。
// Prescription は index.js（Bootstrap / AOS）を使うが、鏡面世界のページは軽くするためこれだけを使う。

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// フィルムの粒子
const makeNoise = function () {
  const size = 160;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
    image.data[i + 3] = 34;
  }
  ctx.putImageData(image, 0, 0);
  return `url(${canvas.toDataURL()})`;
};

// lamps：ヒーロー写真の中の街灯 [x, y, 光の直径]（画像の幅・高さに対する比率）
export const initMirrorPage = function ({ lamps = [] } = {}) {
  const root = document.documentElement;
  root.classList.add('js');
  root.style.setProperty('--noise', makeNoise());

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // 読み込みが終わったら幕を上げる（画像が遅くても 4 秒で上げる）
  const raiseCurtain = function () {
    document.getElementById('loader')?.classList.add('site-loader__done');
    document.body.classList.add('is-ready');
  };
  window.addEventListener('load', raiseCurtain);
  window.setTimeout(raiseCurtain, 4000);

  // ── ナビ（スマホでは「目次」で開閉） ──
  const nav = document.querySelector('.site-nav');
  const toggle = nav.querySelector('.site-nav_toggle');
  const setMenu = function (open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '閉じる' : '目次';
    nav.classList.toggle('site-nav__open', open);
  };
  toggle.addEventListener('click', () =>
    setMenu(toggle.getAttribute('aria-expanded') !== 'true')
  );
  nav.querySelector('.site-nav_menu').addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  // ── 水面 ──
  const hero = document.querySelector('.hero');
  const world = hero.querySelector('.hero_world');
  const photo = world.querySelector('.hero_photo');
  const below = hero.querySelector('.hero_below');
  const filters = document.querySelector('.site-filters');

  const lampBox = world.querySelector('.hero_lamps');
  lamps.forEach(() => {
    const lamp = document.createElement('i');
    lamp.className = 'hero_lamp';
    lamp.style.animationDelay = `${-Math.random() * 7}s`;
    lampBox.appendChild(lamp);
  });

  // 鏡の中の世界＝同じ世界の複製（見出しは重複させない）
  const reflection = world.cloneNode(true);
  reflection.querySelectorAll('img').forEach((img) => {
    img.alt = '';
  });
  const clonedTitle = reflection.querySelector('h1');
  const titleCopy = document.createElement('div');
  titleCopy.className = clonedTitle.className;
  titleCopy.textContent = clonedTitle.textContent;
  clonedTitle.replaceWith(titleCopy);
  hero.querySelector('.hero_mirror').appendChild(reflection);

  const layoutLamps = function () {
    const iw = photo.naturalWidth || 1920;
    const ih = photo.naturalHeight || 1280;
    const [px, py] = window
      .getComputedStyle(photo)
      .objectPosition.split(' ')
      .map((v) => parseFloat(v) / 100);
    hero.querySelectorAll('.hero_world').forEach((w) => {
      const k = Math.max(w.clientWidth / iw, w.clientHeight / ih);
      const ox = (w.clientWidth - iw * k) * px;
      const oy = (w.clientHeight - ih * k) * py;
      w.querySelectorAll('.hero_lamp').forEach((lamp, i) => {
        const [x, y, size] = lamps[i];
        const top = oy + y * ih * k;
        Object.assign(lamp.style, {
          display: top < 0 ? 'none' : '',
          left: `${ox + x * iw * k}px`,
          top: `${top}px`,
          width: `${size * iw * k}px`,
          height: `${size * iw * k}px`,
        });
      });
    });
  };
  if (lamps.length) {
    layoutLamps();
    photo.addEventListener('load', layoutLamps);
    window.addEventListener('resize', layoutLamps);
  }

  // 雨（水面の上だけ）
  if (!reduceMotion) {
    const rain = hero.querySelector('.hero_rain');
    const count = window.innerWidth < 768 ? 24 : 46;
    for (let i = 0; i < count; i++) {
      const drop = document.createElement('i');
      drop.className = 'hero_drop';
      Object.assign(drop.style, {
        left: `${Math.random() * 110}%`,
        height: `${50 + Math.random() * 70}px`,
        animationDuration: `${0.55 + Math.random() * 0.45}s`,
        animationDelay: `${-Math.random() * 2}s`,
        opacity: String(0.4 + Math.random() * 0.6),
      });
      rain.appendChild(drop);
    }
  }

  // 波紋：雨粒と、ポインタの動きで広がる。手前ほど大きい
  const rings = hero.querySelector('.hero_rings');
  const spawnRing = function (x, y) {
    const width = 36 + clamp(y / below.clientHeight) * 190;
    const ring = document.createElement('i');
    ring.className = 'hero_ring';
    Object.assign(ring.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${width * 0.24}px`,
    });
    ring.addEventListener('animationend', () => ring.remove());
    rings.appendChild(ring);
  };

  let lastRing = 0;
  hero.addEventListener('pointermove', (e) => {
    const now = window.performance.now();
    const box = below.getBoundingClientRect();
    if (reduceMotion || now - lastRing < 90 || e.clientY < box.top) return;
    lastRing = now;
    spawnRing(e.clientX - box.left, e.clientY - box.top);
  });

  // 画面外では水面の動き（雨・波紋・揺らぎ）を止める
  let ringTimer = null;
  const startWater = function () {
    if (reduceMotion || ringTimer) return;
    ringTimer = setInterval(
      () =>
        spawnRing(
          Math.random() * below.clientWidth,
          Math.random() * below.clientHeight * 0.9
        ),
      260
    );
    filters.unpauseAnimations();
    hero.classList.remove('hero__paused');
  };
  const stopWater = function () {
    window.clearInterval(ringTimer);
    ringTimer = null;
    filters.pauseAnimations();
    hero.classList.add('hero__paused');
  };
  if (reduceMotion) stopWater();
  new window.IntersectionObserver(([entry]) =>
    entry.isIntersecting ? startWater() : stopWater()
  ).observe(hero);

  // ── スクロール ──
  // こちら側はゆっくり沈み、鏡の中は逆向きに動いて像がずれていく。
  // 『』の台詞は少し遅れてついてくる。
  const lagLines = [...document.querySelectorAll('[data-lag]')];
  let queued = false;
  const onScroll = function () {
    queued = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    nav.classList.toggle('site-nav__solid', y > 40);
    if (reduceMotion) return;
    if (y < vh * 1.2) hero.style.setProperty('--py', `${y * 0.34}px`);
    lagLines.forEach((line) => {
      const r = line.getBoundingClientRect();
      line.style.setProperty(
        '--p',
        clamp((vh - r.top) / (vh + r.height)).toFixed(3)
      );
    });
  };
  window.addEventListener(
    'scroll',
    () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(onScroll);
    },
    { passive: true }
  );
  onScroll();

  // 近づくとピントが合う
  const focusTargets = document.querySelectorAll('[data-focus]');
  if (reduceMotion) {
    focusTargets.forEach((el) => el.classList.add('is-focused'));
  } else {
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-focused');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px' }
    );
    focusTargets.forEach((el) => observer.observe(el));
  }
};
