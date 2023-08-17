import Vue from "vue";
import App from "./App.vue";

import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";

import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from "@fortawesome/vue-fontawesome";

library.add(fas, far, fab);
import "./registerServiceWorker";

import $ from "jquery";

import store from './store';
import mixin from "./mixin";
window.$ = $;
Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.component("font-awesome-layers", FontAwesomeLayers);
Vue.component("font-awesome-layers-text", FontAwesomeLayersText);

Vue.config.productionTip = false;
Vue.mixin(mixin);
new Vue({
  render: (h) => h(App),
  store: store,
  data: {
    eventHub: new Vue(),
  },
}).$mount("#app");

//阻止safari浏览器双击放大功能
let lastTouchEnd = 0; //更新手指弹起的时间
document.documentElement.addEventListener("touchstart", function (event) {
  //多根手指同时按下屏幕，禁止默认行为
  if (event.touches.length > 1) {
    event.preventDefault();
  }
});
document.documentElement.addEventListener(
  "touchend",
  function (event) {
    let now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      //当两次手指弹起的时间小于300毫秒，认为双击屏幕行为
      event.preventDefault();
    } else {
      // 否则重新手指弹起的时间
      lastTouchEnd = now;
    }
  },
  false
);
//阻止双指放大页面
document.documentElement.addEventListener("gesturestart", function (event) {
  event.preventDefault();
});
