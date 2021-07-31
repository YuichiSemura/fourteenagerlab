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

window.isTransparentOfNavbar = true;

const scrollEvent = function () {
  // navbarのcolor
  // navtitle の opacity
  window.addEventListener("scroll", function () {
    if (
      window.pageYOffset < window.innerHeight &&
      window.isTransparentOfNavbar
    ) {
      let navbar = document.querySelector(".navbar");
      navbar.classList.add("nav-transparent", "py-2");
      navbar.classList.remove("nav-blue", "py-1");
      window.isTransparentOfNavbar = !window.isTransparentOfNavbar;
      let navTitle = document.querySelector("#nav-title");
      navTitle.classList.add("opacity-0");
    } else if (
      window.pageYOffset >= window.innerHeight &&
      !window.isTransparentOfNavbar
    ) {
      let navbar = document.querySelector(".navbar");
      navbar.classList.add("nav-blue", "py-1");
      navbar.classList.remove("nav-transparent", "py-2");
      window.isTransparentOfNavbar = !window.isTransparentOfNavbar;
      let navTitle = document.querySelector("#nav-title");
      navTitle.classList.remove("opacity-0");
    }
  });
};

scrollEvent();
