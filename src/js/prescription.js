// Prescription（平成のノベルゲーム風）。
// 物語は src/scenario/prescription.txt に書く（書き方はそのファイルの先頭を参照）。
import '../scss/prescription.scss';
import source from '../scenario/prescription.txt?raw';
import { applyGrain } from './grain.js';
import { parseScript } from './novel-script.js';

// 背景に使える画像：src/assets の jpg（台本では「@bg slider-1」のように拡張子なしで書く）
const BACKGROUNDS = import.meta.glob('../assets/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});
const bgUrl = (name) => BACKGROUNDS[`../assets/${name}.jpg`];

// 名札の色：瀬村＝街灯の色、新居＝月の色（ほかの人は色なし）
const SPEAKERS = { 瀬村: 'sem', 新居: 'koko' };
const speakerKey = (name) => SPEAKERS[name] ?? '';

const TITLE_BG = 'slider-1';
const SLOT_COUNT = 12;
const SAVE_KEY = 'fourteenager-prescription-saves';
const CONFIG_KEY = 'fourteenager-prescription-config';

const steps = parseScript(source);
const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// ブラウザに保存（使えない環境でも止まらないように）
const storage = {
  read(key, fallback) {
    try {
      return JSON.parse(window.localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 保存できなくても遊べるようにする
    }
  },
};

const config = {
  textSpeed: 32, // 1 文字あたりのミリ秒（0 で一瞬）
  autoWait: 1600, // オートで次へ進むまでの待ち時間
  windowAlpha: 0.8, // 窓の濃さ
  ...storage.read(CONFIG_KEY, {}),
};

const $ = (selector) => document.querySelector(selector);
const novel = $('.novel');
const layers = [...document.querySelectorAll('.stage_bg')];
const titleScreen = $('.title');
const game = $('.game');
const adv = $('.adv');
const advName = $('.adv_name');
const advText = $('.adv_text');
const advNext = $('.adv_next');
const nvl = $('.nvl');
const nvlPage = $('.nvl_page');
const quick = $('.quick');
const card = $('.card');
const live = $('.novel_live');
const confirmBox = $('.confirm');
const sheets = { log: $('.log'), saves: $('.saves'), config: $('.config') };

const state = {
  screen: 'title',
  pos: 0, // 次に読むステップ
  current: -1, // 表示中の文のステップ
  mode: 'adv',
  bg: '',
  chapter: '',
  log: [],
  waiting: false, // 文を出し終えて、クリックを待っている
  auto: false,
  skip: false,
  hidden: false, // 窓を隠している
};
let finishTyping = null; // 文字送りの途中なら、全文を出しきる関数
let afterCard = null; // 章タイトルを閉じたあとに続ける処理
let timer = 0;

// ── 背景 ──
let front = 0;
const setBackground = function (name, instant = false) {
  if (!name || name === state.bg) return;
  const url = bgUrl(name);
  if (!url) {
    console.warn(`台本：背景「${name}」が src/assets に見つかりません`);
    return;
  }
  state.bg = name;
  front = 1 - front;
  layers.forEach((layer) =>
    layer.classList.toggle('stage_bg__instant', instant)
  );
  layers[front].style.setProperty('--bg', `url(${url})`);
  layers[front].classList.add('is-shown');
  layers[1 - front].classList.remove('is-shown');
};

// ── 表示モード（adv：下の窓／nvl：画面いっぱい） ──
const clearWindow = function () {
  nvlPage.replaceChildren();
  advName.textContent = '';
  advText.textContent = '';
  advNext.hidden = true;
};
const setMode = function (mode) {
  state.mode = mode === 'nvl' ? 'nvl' : 'adv';
  nvl.hidden = state.mode !== 'nvl';
  adv.hidden = state.mode !== 'adv';
  clearWindow();
};

// ── 文字送り ──
const typeText = function (el, text, done) {
  if (state.skip || reduceMotion || config.textSpeed === 0) {
    el.textContent = text;
    done();
    return;
  }
  const chars = Array.from(text);
  const start = window.performance.now();
  let frame = 0;
  const finish = function () {
    window.cancelAnimationFrame(frame);
    finishTyping = null;
    el.textContent = text;
    done();
  };
  const tick = function (now) {
    const count = Math.floor((now - start) / config.textSpeed) + 1;
    if (count >= chars.length) {
      finish();
      return;
    }
    el.textContent = chars.slice(0, count).join('');
    frame = window.requestAnimationFrame(tick);
  };
  finishTyping = finish;
  frame = window.requestAnimationFrame(tick);
};

// オート・スキップのときは、文を出し終えたら自動で次へ
const scheduleNext = function () {
  window.clearTimeout(timer);
  if (!state.waiting || isSheetOpen()) return;
  if (state.skip) timer = window.setTimeout(next, 60);
  else if (state.auto) {
    const length = steps[state.current]?.text.length ?? 0;
    timer = window.setTimeout(next, config.autoWait + length * 40);
  }
};

const showText = function (step, index) {
  state.current = index;
  state.waiting = false;
  state.log.push({ speaker: step.speaker, text: step.text });
  live.textContent = step.speaker ? `${step.speaker}：${step.text}` : step.text;

  let target = advText;
  if (state.mode === 'nvl') {
    nvlPage.querySelector('.nvl_next')?.remove();
    target = document.createElement('p');
    nvlPage.append(target);
  } else {
    advName.textContent = step.speaker;
    advName.dataset.speaker = speakerKey(step.speaker);
    advNext.hidden = true;
  }

  typeText(target, step.text, () => {
    state.waiting = true;
    if (state.mode === 'nvl') {
      const mark = document.createElement('span');
      mark.className = 'nvl_next';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = '▼';
      target.append(mark);
    } else {
      advNext.hidden = false;
    }
    scheduleNext();
  });
};

// ── 章タイトル（「― おわり ―」にも使う） ──
const showCard = function (text, then) {
  card.textContent = text;
  card.hidden = false;
  window.requestAnimationFrame(() => card.classList.add('is-shown'));
  afterCard = then;
  window.clearTimeout(timer);
  timer = window.setTimeout(closeCard, state.skip ? 500 : 2400);
};
const closeCard = function () {
  window.clearTimeout(timer);
  const then = afterCard;
  afterCard = null;
  card.classList.remove('is-shown');
  window.setTimeout(() => {
    if (!afterCard) card.hidden = true;
  }, 800);
  then?.();
};

// ── 台本を読み進める ──
const applyCommand = function (step, silent = false) {
  if (step.type === 'bg') setBackground(step.args[0], silent);
  else if (step.type === 'mode') setMode(step.args[0]);
  else if (step.type === 'page') {
    if (state.mode === 'nvl') nvlPage.replaceChildren();
  } else if (!silent) {
    console.warn(`台本 ${step.line} 行目：知らない命令「@${step.type}」`);
  }
};

const run = function () {
  while (state.pos < steps.length) {
    const step = steps[state.pos];
    state.pos += 1;
    if (step.type === 'text') {
      showText(step, state.pos - 1);
      return;
    }
    if (step.type === 'chapter') {
      state.chapter = step.title;
      showCard(step.title, run);
      return;
    }
    if (step.type === 'end') break;
    applyCommand(step);
  }
  setAuto(false);
  setSkip(false);
  showCard('― おわり ―', goTitle);
};

const next = function () {
  window.clearTimeout(timer);
  state.waiting = false;
  run();
};

// クリック・Enter：文字送りの途中なら全文を出し、出し終わっていれば次へ
const advance = function () {
  if (state.screen !== 'game' || isSheetOpen()) return;
  if (state.hidden) setHidden(false);
  else if (afterCard) closeCard();
  else if (finishTyping) finishTyping();
  else if (state.waiting) next();
};

const resetStory = function () {
  window.clearTimeout(timer);
  finishTyping = null;
  afterCard = null;
  card.hidden = true;
  card.classList.remove('is-shown');
  Object.assign(state, {
    pos: 0,
    current: -1,
    chapter: '',
    log: [],
    waiting: false,
  });
  setMode('adv');
  setHidden(false);
};

// セーブした場所まで、背景・モード・読み返しを組み立て直してから続ける
const resumeAt = function (index) {
  resetStory();
  steps.slice(0, index).forEach((step) => {
    if (step.type === 'text') {
      state.log.push({ speaker: step.speaker, text: step.text });
      if (state.mode === 'nvl') {
        const p = document.createElement('p');
        p.textContent = step.text;
        nvlPage.append(p);
      }
    } else if (step.type === 'chapter') {
      state.chapter = step.title;
    } else if (step.type !== 'end') {
      applyCommand(step, true);
    }
  });
  state.pos = index;
  run();
};

// ── 画面の切り替え ──
const showScreen = function (name) {
  state.screen = name;
  titleScreen.hidden = name !== 'title';
  game.hidden = name !== 'game';
  novel.classList.toggle('novel__title', name === 'title');
};

const startStory = function () {
  closeSheets(false);
  showScreen('game');
  resetStory();
  run();
};

const goTitle = function () {
  setAuto(false);
  setSkip(false);
  resetStory();
  showScreen('title');
  setBackground(TITLE_BG);
  titleScreen.querySelector('button')?.focus();
};

const setHidden = function (hidden) {
  state.hidden = hidden;
  game.classList.toggle('game__hidden', hidden);
};

const syncToggles = function () {
  quick
    .querySelector('[data-action="auto"]')
    .setAttribute('aria-pressed', String(state.auto));
  quick
    .querySelector('[data-action="skip"]')
    .setAttribute('aria-pressed', String(state.skip));
};
const setAuto = function (on) {
  state.auto = on;
  if (on) state.skip = false;
  syncToggles();
  scheduleNext();
};
const setSkip = function (on) {
  state.skip = on;
  if (on) {
    state.auto = false;
    finishTyping?.();
  }
  syncToggles();
  scheduleNext();
};

// ── シート（読み返し・セーブ／ロード・設定） ──
let opener = null;
const isSheetOpen = () =>
  Object.values(sheets).some((sheet) => !sheet.hidden) || !confirmBox.hidden;

const openSheet = function (sheet) {
  window.clearTimeout(timer);
  if (!isSheetOpen()) opener = document.activeElement;
  Object.values(sheets).forEach((s) => {
    s.hidden = s !== sheet;
  });
  sheet.querySelector('.sheet_close').focus();
};
const closeSheets = function (restoreFocus = true) {
  const open = Object.values(sheets).filter((sheet) => !sheet.hidden);
  open.forEach((sheet) => {
    sheet.hidden = true;
  });
  if (open.length && restoreFocus) opener?.focus();
  scheduleNext();
  return open.length > 0;
};

const renderLine = function (entry) {
  const item = document.createElement('li');
  item.className = 'log_item';
  if (entry.speaker) {
    const name = document.createElement('p');
    name.className = 'log_name';
    name.dataset.speaker = speakerKey(entry.speaker);
    name.textContent = entry.speaker;
    item.append(name);
  }
  const text = document.createElement('p');
  text.textContent = entry.text;
  item.append(text);
  return item;
};
const openLog = function () {
  const list = sheets.log.querySelector('.log_list');
  list.replaceChildren(...state.log.map(renderLine));
  openSheet(sheets.log);
  list.scrollTop = list.scrollHeight;
};

const readSaves = () => storage.read(SAVE_KEY, []);
const formatDate = function (time) {
  const d = new Date(time);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};
const renderSlot = function (data, i, mode) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'slot';
  button.disabled = mode === 'load' && !data;

  const thumb = document.createElement('span');
  thumb.className = 'slot_thumb';
  if (data && bgUrl(data.bg)) {
    thumb.style.backgroundImage = `url(${bgUrl(data.bg)})`;
  } else {
    thumb.textContent = 'NO DATA';
  }
  const info = document.createElement('span');
  info.className = 'slot_info';
  const no = document.createElement('span');
  no.className = 'slot_no';
  no.textContent = `No.${String(i + 1).padStart(2, '0')}\u3000${
    data ? formatDate(data.date) : ''
  }`;
  const chapter = document.createElement('span');
  chapter.className = 'slot_chapter';
  chapter.textContent = data ? data.chapter || '―' : '― 空き ―';
  const text = document.createElement('span');
  text.className = 'slot_text';
  text.textContent = data ? data.text : '';
  info.append(no, chapter, text);
  button.append(thumb, info);

  button.addEventListener('click', () =>
    mode === 'save' ? saveTo(i) : loadFrom(i)
  );
  item.append(button);
  return item;
};
const openSaves = function (mode) {
  const sheet = sheets.saves;
  sheet.querySelector('h2').textContent = mode === 'save' ? 'セーブ' : 'ロード';
  const saves = readSaves();
  sheet
    .querySelector('.slots')
    .replaceChildren(
      ...Array.from({ length: SLOT_COUNT }, (_, i) =>
        renderSlot(saves[i], i, mode)
      )
    );
  openSheet(sheet);
};
const saveTo = function (i) {
  const step = steps[state.current];
  if (!step) return;
  const saves = readSaves();
  saves[i] = {
    index: state.current,
    chapter: state.chapter,
    bg: state.bg,
    text: step.speaker ? `${step.speaker}${step.text}` : step.text,
    date: Date.now(),
  };
  storage.write(SAVE_KEY, saves);
  openSaves('save');
  sheets.saves.querySelectorAll('.slot')[i].focus();
};
const loadFrom = function (i) {
  const data = readSaves()[i];
  if (!data) return;
  closeSheets(false);
  setAuto(false);
  setSkip(false);
  showScreen('game');
  resumeAt(Math.min(data.index, steps.length - 1));
};

// 設定：左右の向きは「右ほど速い・濃い」にそろえる
const configInputs = [...sheets.config.querySelectorAll('input')];
const toSlider = {
  textSpeed: (v) => 80 - v,
  autoWait: (v) => v,
  windowAlpha: (v) => Math.round(v * 100),
};
const fromSlider = {
  textSpeed: (v) => 80 - v,
  autoWait: (v) => v,
  windowAlpha: (v) => v / 100,
};
const applyConfig = function () {
  novel.style.setProperty('--window-alpha', String(config.windowAlpha));
};
configInputs.forEach((input) => {
  input.value = String(toSlider[input.name](config[input.name]));
  input.addEventListener('input', () => {
    config[input.name] = fromSlider[input.name](Number(input.value));
    storage.write(CONFIG_KEY, config);
    applyConfig();
  });
});

// 確認ダイアログ
const ask = function (message, onYes) {
  window.clearTimeout(timer);
  const yes = confirmBox.querySelector('[data-answer="yes"]');
  const no = confirmBox.querySelector('[data-answer="no"]');
  const back = document.activeElement;
  const answer = function (ok) {
    confirmBox.hidden = true;
    yes.onclick = null;
    no.onclick = null;
    if (ok) onYes();
    else {
      back?.focus();
      scheduleNext();
    }
  };
  confirmBox.querySelector('.confirm_text').textContent = message;
  confirmBox.hidden = false;
  yes.onclick = () => answer(true);
  no.onclick = () => answer(false);
  no.focus();
};

// ── 操作 ──
const actions = {
  start: startStory,
  load: () => openSaves('load'),
  save: () => openSaves('save'),
  config: () => openSheet(sheets.config),
  log: openLog,
  auto: () => setAuto(!state.auto),
  skip: () => setSkip(!state.skip),
  title: () => ask('タイトルにもどりますか？', goTitle),
  close: () => closeSheets(),
};
novel.addEventListener('click', (e) => {
  const button = e.target.closest('[data-action]');
  if (button) {
    actions[button.dataset.action]();
    return;
  }
  if (!e.target.closest('button, a, input, .sheet, .confirm')) advance();
});

// 右クリック：窓を隠す（シートが開いていれば閉じる）
game.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (!closeSheets()) setHidden(!state.hidden);
});
// ホイールを上に回すと読み返し
game.addEventListener(
  'wheel',
  (e) => {
    if (e.deltaY < 0 && !isSheetOpen() && !state.hidden) openLog();
  },
  { passive: true }
);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!confirmBox.hidden)
      confirmBox.querySelector('[data-answer="no"]').click();
    else if (!closeSheets() && state.screen === 'game') {
      setHidden(!state.hidden);
    }
    return;
  }
  if (state.screen !== 'game' || isSheetOpen()) return;
  if (e.key === 'Control' && !e.repeat) setSkip(true);
  if (
    (e.key === 'Enter' || e.key === ' ') &&
    !e.target.closest('button, a, input')
  ) {
    e.preventDefault();
    advance();
  }
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'Control' && state.screen === 'game') setSkip(false);
});

// タイトルのメニューは ↑↓ でも選べる
const menuItems = [...titleScreen.querySelectorAll('.title_menu > *')];
titleScreen.querySelector('.title_menu').addEventListener('keydown', (e) => {
  const i = menuItems.indexOf(document.activeElement);
  if (i < 0 || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
  e.preventDefault();
  const step = e.key === 'ArrowDown' ? 1 : -1;
  menuItems[(i + step + menuItems.length) % menuItems.length].focus();
});

// ── はじまり ──
applyGrain();
applyConfig();
setBackground(TITLE_BG, true);
showScreen('title');
window.addEventListener('load', () => {
  window.setTimeout(
    () => {
      $('.loading').classList.add('loading__done');
      novel.classList.add('is-ready');
    },
    reduceMotion ? 0 : 900
  );
});
