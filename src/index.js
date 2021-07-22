// Bootstrapのスタイルシート側の機能を読み込む
import "bootstrap/dist/css/bootstrap.min.css";

// BootstrapのJavaScript側の機能を読み込む
import "bootstrap";

import "@fortawesome/fontawesome-free/js/fontawesome";
import "@fortawesome/fontawesome-free/js/solid";
import "@fortawesome/fontawesome-free/js/regular";
import "animate.css/animate.min.css";
import "./index.scss";

const { WOW } = require("wowjs");
window.WOW = require("wowjs");
const wow = new WOW({
  boxClass: "wow", // default
  animateClass: "animated", // default
  offset: 0, // アニメーションをスタートさせる距離
});

wow.init();
