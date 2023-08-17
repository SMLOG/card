import Vue from "vue";
import App from "./PopUpApp.vue";
//import router from "./router";
import storejs from "storejs";
import axios from "storejs";
import infiniteScroll from "vue-infinite-scroll";
import $ from "jquery";

chrome.runtime.sendMessage(
  {
    _page: "1",
  },
  function (response) {
    console.log(response);
    // document.write(response);
  }
);

if (location.href.indexOf("image.baidu.com") > -1) {
  $(function () {
    $("body").on("click", ".imgitem", function () {
      chrome.runtime.sendMessage(
        {
          _page: "image",
          value: $(this).find("img").eq(0).attr("data-imgurl"),
        },
        function (response) {
          console.log(response);
          // document.write(response);
        }
      );

      return false;
    });

    chrome.runtime.onMessage.addListener(function (
      message,
      sender,
      sendResponse
    ) {
      if (message && message.contents._page == "ui" && message.contents.value) {
        sendResponse(message);
        $("#kw").val(message.contents.value);
        $("#kw").closest("form").trigger("submit");
      }
    });

    $(document).on("scroll", function () {
      $(".newfcImgli").remove();
      $(".imgitem img").each(function () {
        var box = $(this).closest(".imgbox");
        if (box.find(".mark").length > 0) return true;
        box.prepend(
          '<input class="mark" style="position:absolute;z-index:1000;" type="checkbox"/>'
        );
      });
    });
  });
} else {
  Vue.prototype.$http = axios;
  Vue.prototype.$storejs = storejs;

  Vue.use(infiniteScroll);

  var root = document.createElement("div");
  var id = "dictword_app";
  root.setAttribute("id", id);

  document.body.appendChild(root);

  new Vue({
    // router,
    render: (h) => h(App),
  }).$mount("#" + id);
}
