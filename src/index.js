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
    let threshold = window.innerHeight * 0.65;
    if (window.pageYOffset < threshold && window.isTransparentOfNavbar) {
      let navbar = document.querySelector(".navbar__index");
      if (navbar != null) {
        navbar.classList.add("navbar__transparent");
        navbar.classList.remove("navbar__blue");
      }
      window.isTransparentOfNavbar = !window.isTransparentOfNavbar;
      let navTitle = document.querySelector(".nav_title__index");
      if (navTitle != null) {
        navTitle.classList.add("opacity-0");
      }
    } else if (
      window.pageYOffset >= threshold &&
      !window.isTransparentOfNavbar
    ) {
      let navbar = document.querySelector(".navbar__index");
      if (navbar != null) {
        navbar.classList.add("navbar__blue");
        navbar.classList.remove("navbar__transparent");
      }
      window.isTransparentOfNavbar = !window.isTransparentOfNavbar;
      let navTitle = document.querySelector(".nav_title__index");
      if (navTitle != null) {
        navTitle.classList.remove("opacity-0");
      }
    }
  });
};

scrollEvent();
