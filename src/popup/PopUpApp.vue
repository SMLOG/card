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
      <div>
        <a @click="showwordlist = !showwordlist">List:</a
        ><select v-model="currentWordType" @click="showwordlist = 1">
          <option v-for="type in wordlistTypes" :key="type" :value="type">
            {{ type }}({{ wordlist()[type].length }})
          </option>
        </select>
      </div>

      <div>
        <a @click="transAll()">Trans</a>
        (<input
          v-model.number="curIndex"
          min="0"
          type="number"
          :max="candiates.length - 1"
          style="width: 40px"
          @click="scrollTo()"
        />/<a @click="scrollTo()">{{ candiates.length }}</a
        >)
      </div>
      <div @click="save()">Save</div>
      <div style="margin: 5px">
        <input v-model="en" @focus="en = ''" @keyup.enter="addItem(en)" />
      </div>
    </div>
    <div
      style="
        position: fixed;
        top: 30px;
        bottom: 30px;
        overflow: auto;
        right: 0;
        left: 0;
      "
    >
      <div
        style="
          position: absolute;
          background: white;
          inset: 0px;
          overflow: auto;
        "
        :style="{ zIndex: showwordlist ? 1 : 0 }"
      >
        <ul id="candy">
          <li
            v-for="(word, i) in candiates"
            :key="i"
            :style="{ color: enMap[word.toLowerCase()] ? 'red' : '' }"
          >
            <div v-if="transMap[word.toLowerCase()]">
              <span @click="curIndex = i"> {{ i }}、</span
              ><a
                style="cursor: pointer"
                @click="
                  (en = word),
                    !enMap[word.toLowerCase()] && addItem(word),
                    (showwordlist = 0),
                    search(word),
                    (curItem = items.filter((e) => e.en == word)[0])
                "
                :style="{
                  color: transMap[word.toLowerCase()].to ? 'green' : '',
                }"
                >{{ word }}</a
              >
              <span>{{ transMap[word.toLowerCase()].to }}</span>
              <span v-if="transMap[word.toLowerCase()].ph_am"
                >[{{ transMap[word.toLowerCase()].ph_am }}]</span
              >
              <span
                v-if="
                  transMap[word.toLowerCase()].ph_am !=
                  transMap[word.toLowerCase()].ph_en
                "
                >[{{ transMap[word.toLowerCase()].ph_en }}]</span
              >
            </div>
          </li>
        </ul>
      </div>
      <div
        :style="{ zIndex: showwordlist ? 0 : 1 }"
        style="
          position: absolute;
          background: white;
          inset: 0px;
          overflow: auto;
        "
      >
        <ul>
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
                      curItem && item.en == curItem.en
                        ? '2px solid red'
                        : 'none',
                  }"
                />
              </div>
              <div style="margin-left: 10px">
                <div style="display: table">
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
                  <div style="display: table-row">
                    <div style="display: table-cell">
                      <a @click="googleopen(item)">IMG:</a>
                      <a @click="closegoogle(item)">IMG:</a>
                    </div>
                    <input v-model="item.img" style="display: table-cell" />
                  </div>
                </div>
              </div>
              <div
                style="margin-left: 20px; display: flex; flex-direction: column"
              >
                <a @click.stop="del(item)" style="cursor: pointer">Delete</a>
                <a @click.stop="trans(item)" style="cursor: pointer">trans</a>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
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
        style="
          cursor: pointer;
          color: blue;
          font-weight: bold;
          margin: 5px 10px;
        "
        class="ctrl"
        @click="page = page - 1"
        v-if="page >= 1"
      >
        Prev
      </a>
      <a
        style="
          cursor: pointer;
          color: blue;
          font-weight: bold;
          margin: 5px 10px;
        "
        class="ctrl"
        @click="page = page + 1"
        v-if="page <= parseInt((items.length + 1) / pageSize)"
      >
        Next({{ page }}/{{ parseInt((items.length + 1) / pageSize) }})
      </a>
      Total:{{ items.length }}

      <a @click="upload()" style="margin: 5px 10px">Upload</a>
      <a @click="download()" style="margin: 5px 10px">Download</a>
      <span style="margin: 5px 10px">Page Size:</span
      ><input
        v-model="pageSize"
        min="10"
        max="1000"
        type="number"
        style="width: 40px; margin: 5px 10px"
      />
    </div>
  </div>
</template>

<script>
import storejs from "storejs";
import words from "./words";
import config from "./config";
import { service } from "@/service";
import pako from "pako";
import wordlist from "./wordlist.json";
//require("lzma");
const uint8base64 = require("byte-base64");
const lzma = require("lzma/src/lzma_worker.js").LZMA_WORKER;
wordlist["custom"] = words
  .split(/\n+/)
  .filter((e) => e.trim())
  .map((e) => e.trim());

export default {
  data() {
    return {
      curIndex: 0,
      enMap: {},
      transMap: {},
      showwordlist: 0,
      curItem: null,
      wordlistTypes: Object.keys(wordlist).sort(),
      currentWordType: "custom",
      items: storejs.get("dicts") || [],
      config: config,
      page: 0,
      pages: 1,
      pageSize: 10,
      en: "",
      downTran: 0,
    };
  },
  mounted() {
    Object.assign(
      this.enMap,
      this.items.reduce((map, it) => {
        map[it.en.toLowerCase()] = 1;
        return map;
      }, {})
    );
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

    this.transMap = {};
    for (let i of this.candiates) {
      this.transMap[i.toLowerCase()] = { to: "", ph_am: "", ph_en: "" };
    }
  },
  computed: {
    candiates() {
      console.log(this.currentWordType);
      return wordlist[this.currentWordType] || [];
    },
  },
  watch: {
    currentWordType() {
      this.transMap = {};
      for (let i of this.candiates) {
        this.transMap[i.toLowerCase()] = { to: "", ph_am: "", ph_en: "" };
      }
    },
  },
  methods: {
    scrollTo() {
      document.querySelectorAll("#candy li")[this.curIndex].scrollIntoView();
    },
    wordlist() {
      return wordlist;
    },
    googleopen(item) {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(
          item.en
        )}&tbm=isch`,
        "googleimage"
      );
    },
    printLog() {
      let links = [];
      for (let item of this.items) {
        for (let ll of this.config.langs) {
          let lan = this.config.ttslan[ll];
          let str = item[ll];
          links.push(
            `"${ll}/${str.trim()}.mp3" ` +
              `https://fanyi.baidu.com/gettts?lan=${encodeURIComponent(
                lan
              )}&text=${encodeURIComponent(str.trim())}&spd=3&source=web`
          );
        }
      }
      console.log(links.join("\n"));
    },
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
      // console.log(list);
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
      this.page = 0;
      this.enMap[en.toLowerCase()] = 1;
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
      console.log(this.showwordlist);
      if (!this.showwordlist) {
        if (this.downTran & 1) {
          console.log("return");
          return;
        }
        this.dongTran |= 1;
        for (let i = 0, items = this.pageList(); i < items.length; i++) {
          await this.trans(items[i]);
        }
        this.dongTran &= ~1;
      } else {
        console.log(2);
        if (this.downTran & (1 << 2)) {
          console.log("return");
          return;
        }
        this.downTran |= 1 << 2;
        await this.rawTranList();
        this.downTran &= ~(1 << 2);
      }
      this.$forceUpdate();
    },
    async rawTranList() {
      console.log("rawTranList");
      let config = { tranUrl: "http://localhost:8084/tran" };

      let self = this;
      for (; this.curIndex < this.candiates.length; this.curIndex++) {
        let i = this.curIndex;
        let word = this.candiates[i];
        let resp = await fetch("/tran?q=" + encodeURIComponent(word)).then(
          (r) => r.json()
        );
        if (resp.enc) {
          resp = JSON.parse(pako.ungzip(atob(resp.enc), { to: "string" }));
        } else if (resp.anc) {
          try {
            resp = JSON.parse(
              lzma.decompress(uint8base64.base64ToBytes(resp.anc))
            );
          } catch (ee) {
            console.error(ee);
          }
        }
        if (resp && resp.trans_result && resp.trans_result.data[0].dst) {
          Object.assign(this.transMap[word.toLowerCase()], {
            to: resp.trans_result.data[0].dst,
          });
          if (
            resp.dict_result &&
            resp.dict_result.simple_means &&
            resp.dict_result.simple_means.symbols &&
            resp.dict_result.simple_means.symbols.length
          ) {
            Object.assign(this.transMap[word.toLowerCase()], {
              ph_am: resp.dict_result.simple_means.symbols[0].ph_am,
              ph_en: resp.dict_result.simple_means.symbols[0].ph_en,
            });
          }
        }

        // this.$forceUpdate();
        if (resp.trans_result) continue;

        console.log(i, word);
        await new Promise((resolve) => {
          service(
            null,
            {
              cmd: "translate",
              config: config,
              content: {
                q: word,
                opts: { to: "zh" },
              },
            },
            function (response) {
              console.log(response);
              if (
                response &&
                response.filter((e) => e.src == "BD").length > 0
              ) {
                let resp = response.filter((e) => e.src == "BD")[0]._raw;

                if (resp.trans_result)
                  Object.assign(self.transMap[word.toLowerCase()], {
                    to: resp.trans_result.data[0].dst,
                  });

                if (
                  resp.dict_result &&
                  resp.dict_result.simple_means &&
                  resp.dict_result.simple_means.symbols &&
                  resp.dict_result.simple_means.symbols.length
                ) {
                  Object.assign(self.transMap[word.toLowerCase()], {
                    ph_am: resp.dict_result.simple_means.symbols[0].ph_am,
                    ph_en: resp.dict_result.simple_means.symbols[0].ph_en,
                  });
                }
                if (resp.trans_result || resp.dict_result) {
                  resolve(response.filter((e) => e.src == "BD")[0].to);
                }
              }
            }
          );
          setTimeout(resolve, 10000);
        });

        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
      }
    },
    async trans(item) {
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
        this.enMap[item.en.toLowerCase()] = 0;

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
