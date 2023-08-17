<template>
  <div>
    <div
      style="
        display: flex;
        flex: 1;
        position: fixed;
        background: white;
        top: 0;
        right: 0;
        left: 0;
        justify-content: space-between;
      "
    >
      <div @click="transAll()">Translate all</div>
      <div @click="save()">Save</div>
      <div style="margin: 5px">
        <input v-model="en" @focus="en = ''" @keyup.enter="addItem(en)" />
      </div>
    </div>

    <ul style="padding-top: 30px">
      <li
        style="display: flex; margin-bottom: 10px"
        v-for="(item, i) in pageList()"
        :key="item.en"
        :class="{ selected: curItem && item.en == curItem.en }"
      >
        <div style="display: flex">
          <div>{{ items.length - (page * pageSize + i) }}、</div>
          <div>
            <img
              referrerpolicy="no-referrer"
              :src="item.img"
              style="width: 60px; height: 60px"
              @click="selectItem(item)"
              :style="{
                border:
                  curItem && item.en == curItem.en ? '2px solid red' : 'none',
              }"
            />
          </div>
          <div style="margin-left: 10px">
            <div style="display: table">
              <div style="display: table-row">
                <div style="display: table-cell">
                  <a
                    @click="
                      curItem = item;
                      search(item['en']);
                    "
                    >en</a
                  >
                </div>

                <input style="display: table-cell" v-model="item['en']" />
              </div>
              <div
                v-for="lan in config.langs"
                :key="lan"
                style="display: table-row"
              >
                <div
                  style="display: table-cell"
                  @click="
                    curItem = item;
                    search(item[lan]);
                  "
                >
                  {{ lan }}:
                </div>
                <input v-model="item[lan]" style="display: table-cell" />
              </div>
            </div>
          </div>
          <div style="margin-left: 20px; display: flex; flex-direction: column">
            <a @click.stop="del(item)" style="cursor: pointer">Delete</a>
            <a @click.stop="trans(item)" style="cursor: pointer">trans</a>
          </div>
        </div>
      </li>
    </ul>

    <div
      style="
        position: fixed;
        bottom: 0;
        right: 0;
        text-align: right;
        margin: 5px;
        user-select: none;
      "
    >
      <a
        style="cursor: pointer; color: blue; font-weight: bold"
        class="ctrl"
        @click="page = page - 1"
        v-if="page >= 1"
      >
        Prev
      </a>
      <a
        style="cursor: pointer; color: blue; font-weight: bold"
        class="ctrl"
        @click="page = page + 1"
        v-if="page <= parseInt((items.length + 1) / pageSize)"
      >
        Next({{ page }})
      </a>
      Total:{{ items.length }}

      <a @click="upload()">Upload</a>
      <a @click="download()">Download</a>
      <span>Page Size:</span
      ><input
        v-model="pageSize"
        min="10"
        max="1000"
        type="number"
        style="width: 40px"
      />
    </div>
  </div>
</template>

<script>
import storejs from "storejs";
import { service } from "@/service";
import pako from "pako";
export default {
  data() {
    return {
      curItem: null,

      items: storejs.get("dicts") || [],
      config: {
        passNum: 40,
        gameTime1: 3,
        gameTime2: 6,
        langs: ["en", "zh", "yue"],
        tips: {
          en: ["no no no", "oh sorry.", "incorrect", "come on."],
          zh: ["继续努力", "加油！"],
          yue: ["继续努力", "加油！"],
        },
        ttslan: { en: "en", zh: "zh", yue: "cte" },
        games: [
          {
            _blank: 1,
            name: "pbskids.org games",
            imgUrl:
              "https://cms-tc.pbskids.org/global/mezzanines/_shellTopicBlock/Sesame_Puppy-Pet-Care_PBSGameFeature_908x510.jpg",
            url: "https://pbskids.org/games",
          },
          {
            name: "圈小猫",
            imgUrl: "images/logo.jpg",
            path: "cat",
          },
          {
            name: "匹配游戏",
            path: "card",
          },
          {
            name: "方块消除",
            imgUrl: "bitmap/logo.png",
            path: "remove",
          },
          {
            name: "数字推盘",
            path: "szhrdGame",
          },
          {
            name: "Bubble",
          },
          {
            name: "五子棋",
            path: "wuziqi",
          },
          {
            name: "五子棋2",
            path: "wuziqi2",
          },
          {
            name: "unlock",
          },
          {
            name: "connection",
          },
          {
            name: "master_checkers_v3",
          },
          {
            name: "numpuz",
          },
          {
            name: "pintu",
            imgUrl: "assets/img_480/game_logo.png",
          },
          {
            name: "blue casino",
            path: "blue2",
          },
          {
            name: "lollipop",
          },
          {
            path: "smarty-bubbles-2",
            name: "smarty bubbles",
            imgUrl: "SmartyBubbles2Teaser.jpg",
          },
          {
            name: "ppiano",
            imgUrl: "PerfectPiano_Teaser.jpg",
          },
          {
            name: "pianoonline",
          },
          {
            path: "pvz",
            name: "Plant zombie",
            imgUrl: "images/interface/Logo.jpg",
            src: "http://crge.cn/games",
          },
        ],
      },
      page: 0,
      pages: 1,
      pageSize: 10,
      en: "",
    };
  },
  mounted() {
    let self = this;
    chrome.runtime.onMessage.addListener(function (
      message,
      sender,
      sendResponse
    ) {
      if (
        message &&
        message.contents._page == "image" &&
        message.contents.value
      ) {
        sendResponse(message);
        console.log(message);
        if (self.curItem.en && message.contents.value) {
          self.curItem.img = message.contents.value;
          self.save();
        }
      }
    });
  },
  methods: {
    upload() {
      console.log(this.config);
      if (confirm("upload Y?"))
        service(
          null,
          {
            cmd: "upload",
            content: { config: this.config, items: this.items },
          },
          function (response) {
            console.log(response);
            if (response) alert(JSON.stringify(response));
          }
        );
    },
    download() {
      if (!confirm("download Y/N?")) {
        return;
      }

      fetch("https://smlog.github.io/data/dict.js")
        .then((r) => r.text())
        .then((r) => {
          let data = r.trim().substring(4).replace('");', "");
          let items = JSON.parse(pako.ungzip(atob(data), { to: "string" }))[
            "items"
          ];

          for (let ee of items) {
            let item;
            if (this.map[ee.en] == undefined) {
              item = {};
              this.items.push(item);
              Object.assign(item, ee);
              this.map[item.en] = this.items.length - 1;
            }
          }

          this.save();
        })
        .catch((err) => {
          alert("error:" + err);
        });
    },
    pageList() {
      let list = this.searchItems().slice().reverse();
      console.log(list);
      if (list.length > 0) {
        let begin = this.page * this.pageSize;
        let end = (1 + this.page) * this.pageSize;
        list = list.slice(begin, end);
      }
      return list;
    },
    searchItems() {
      return this.en
        ? this.items.filter((e) => e.en.indexOf(this.en) > -1)
        : this.items;
    },
    async addItem(en) {
      let item = { en: en, img: "" };
      this.trans(item);
      this.items.push(item);
    },
    selectItem(item) {
      this.curItem = item;
    },

    search(key) {
      key &&
        chrome.runtime.sendMessage(
          {
            _page: "ui",
            value: key,
          },
          function (response) {
            console.log(response);
            // document.write(response);
          }
        );
    },
    async transAll() {
      for (let i = 0, items = this.pageList(); i < items.length; i++) {
        await this.trans(items[i]);
      }
    },
    async trans(item) {
      let self = this;
      let langs = this.config.langs;
      if (item.en) {
        for (var i = 0; i < langs.length; i++) {
          if (item[langs[i]]) continue;
          let r = await new Promise((resove) => {
            service(
              null,
              {
                cmd: "translate",
                content: { q: item.en, opts: { to: langs[i] } },
              },
              function (response) {
                console.log(response);
                if (
                  response &&
                  response.filter((e) => e.src == "BD").length > 0 &&
                  response.filter((e) => e.src == "BD")[0].q == item.en
                ) {
                  resove(response.filter((e) => e.src == "BD")[0].to);
                }
              }
            );
            setTimeout(() => {
              resove("");
            }, 6000);
          });
          item[langs[i]] = r ? r : item[langs[i]];
        }
        self.$forceUpdate();
      }
    },
    save() {
      console.log(this.items);

      storejs.set("dicts", this.items);
    },
    del(item) {
      if (item && confirm("delete?")) {
        for (let i = 0, len = this.items.length; i < len; i++) {
          if (this.items[i].en == item.en) {
            this.items.splice(i, 1);
            len--;
            i--;
          }
        }
        console.log(this.items);
        this.save();
      }
    },
  },
  components: {},
};
</script>
<style scoped>
.ctrl {
  cursor: pointer;
  color: blue;
  font-weight: bold;
}
.selected > img {
  border: 2px solid red;
}
</style>
