/* eslint-disable */
console.log("Hello from the content-script");

if (location.href.indexOf("image.baidu.com") > -1) {
  require("@/popup/main");
} else if (location.href.indexOf("popup_main.html") > -1) {
  require("@/popup/main");
}
