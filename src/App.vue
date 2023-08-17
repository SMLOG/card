<template>
  <div style="user-select: none" id="con">
    <div
      style="
        text-align: left;
        color: red;
        min-height: 1em;
        height: 1em;
        margin-bottom: 8px;
      "
    >
      <template v-if="rightCn - wrongCn > 0">
        <font-awesome-icon
          v-for="i in rightCn - wrongCn"
          :key="i"
          icon="star"
          fixed-width
      /></template>
    </div>
    <div
      class="word"
      v-if="mode != 3 && list.length > 0 && curIndex >= 0"
      style="
        color: dodgerblue;
        font-size: 300%;
        font-weight: 900;
        text-align: center;
        margin-bottom: 10px;
      "
      @click="replay"
    >
      {{ list[curIndex][lan] }}
    </div>

    <ul class="figure-list" style="text-align: center">
      <li
        v-for="(item, k) in list"
        :key="k"
        class="card"
        :class="{ click: clickIndex == k, ready: !selected }"
        @click="select(k, item, $event)"
      >
        <div class="card__content">
          <div class="itemText card__back">
            <span style="font-weight: bold">{{ item[lan].toLowerCase() }}</span
            ><span
              :class="{ red: count(item) > 0, green: count(item) < 0 }"
              v-if="count(item) != 0"
              style="flex: 0; font-size: 80%; position: absolute; bottom: 0"
              >{{ count(item) == 0 ? "" : count(item) > 0 ? "+" : ""
              }}{{ count(item) }}</span
            >
          </div>
          <figure
            class="card__front"
            style="cursor: pointer"
            :style="{
              backgroundImage: `url(${item.img + '&cache=0'})`,
            }"
          ></figure>
        </div>
      </li>
    </ul>
    <div
      style="
        cursor: pointer;
        user-select: none;
        margin-top: 10px;
        text-align: center;
      "
    >
      <span @click="replay">
        <font-awesome-icon
          :class="{ speaking: speaking }"
          icon="volume-up"
          fixed-width
        />Replay
      </span>
      <span
        v-if="true"
        @click="
          wrongCn += 3;
          randList();
        "
        style="margin-left: 10px"
      >
        <font-awesome-icon
          :class="{ speaking: speaking }"
          icon="step-forward"
          fixed-width
        />Next</span
      >
      <span style="margin-left: 10px">
        <select v-model="mode">
          <option value="1">Listen</option>
          <option value="0">Read</option>
          <option value="3">Write</option>
        </select></span
      >
      <span @click="refresh()" style="margin-left: 10px">
        <font-awesome-icon icon="refresh" fixed-width />({{
          dictList.length
        }}){{ refresing ? "..." : "" }}</span
      >
      <span v-if="false" @click="sync()" style="margin-left: 10px">
        <font-awesome-icon icon="arrows-down-to-line" fixed-width />({{
          dictList.filter((e) => e.s).length
        }}){{ syning ? "..." : "" }}</span
      >
      <span style="margin-left: 10px" @click.stop="showSetting = 1">
        <font-awesome-icon icon="gear" fixed-width />Setting</span
      >
      <audio
        controls
        ref="audio"
        v-show="false"
        style="height: 0px; width: 0px"
        referrerpolicy="no-referrer"
      ></audio>
    </div>
    <div style="text-align: center" class="board" v-if="mode == 3">
      <div>
        <div style="position: relative">
          <span
            class="al"
            v-for="(c, i) in letters"
            :key="`${c}${i}`"
            @click="unFillLetterIndex(i)"
            style="position: relative"
          >
            <b v-if="i < fill.length">{{ letters2[fill[i]] }}</b>
            <b v-else style="visibility: hidden">{{ c }}</b>

            <div
              v-if="i == letters.length - 1 && isCorrect"
              style="position: absolute; top: 0; right: -2em; color: red"
            >
              <font-awesome-icon
                fixed-width
                :icon="isCorrect == 1 ? 'thumbs-up' : 'thumbs-down'"
              />
            </div>
          </span>
        </div>

        <div style="border-top: 1px dashed #ccc">
          <template v-for="(c, i) in letters2">
            <span
              :key="`${c}${i}`"
              @click="fillLetterIndex(i)"
              class="al"
              style="visibility: hidden"
              v-if="fill.indexOf(i) > -1"
            >
              {{ c }}</span
            >
          </template>
          <template v-for="(c, i) in letters2">
            <span
              :key="`${c}${i}`"
              @click="fillLetterIndex(i)"
              class="al"
              v-if="fill.indexOf(i) == -1"
            >
              {{ c }}</span
            >
          </template>
        </div>
      </div>
    </div>

    <div v-if="showGameIf" style="background: white">
      <GameList :showgame="showgame" @select="showgame = 1" id="gamefr" />
      <div
        style="
          position: fixed;
          top: 0;
          cursor: pointer;
          right: 0;
          color: white;
          z-index: 10000;
        "
      >
        <span @click="openGame(6)">{{ clockt / 1000 }}</span>
        <span style="font-size: 1.5em">
          <font-awesome-icon
            icon="arrow-left"
            fixed-width
            @click="showgame = !showgame"
            style="background: black; border-radius: 1em; margin-right: 10px"
          />
          <font-awesome-icon
            icon="times-circle"
            fixed-width
            @click="closeGame()"
            style="background: black; border-radius: 1em"
          />
        </span>
      </div>
    </div>
    <setting
      ref="setting"
      style="background: white; padding: 10px"
      class="centered"
      v-show="showSetting"
      @openGame="openGame"
    />
  </div>
</template>

<script>
import storejs from "storejs";
import pako from "pako";
import $ from "jquery";
//import dictList from "./dict.json";

import GameList from "./components/GameList.vue";
import Setting from "./Setting.vue";
export default {
  created() {
    document.addEventListener("swUpdated", this.updateAvailable, {
      once: true,
    });
  },
  data: () => {
    return {
      showgame: 1,
      clockt: 0,
      rightCn: 0,
      wrongCn: 0,
      curAct: 0,
      list: [],
      curIndex: 0,
      speaking: false,
      seconds: 15,
      timer: 0,
      clickIndex: -1,
      showGameIf: false,
      showInput: false,
      lan: "en",
      lans: ["en"],
      lanMode: "auto",
      startCount: 0,
      mode: 1,
      fill: [],
      letters2: [],
      letters: [],
      isCorrect: 0,
      refresing: 0,
      dictList: storejs.get("dicts") || [],
      syning: 0,
      lastYesIndex: -1,
      refreshing: false,
      registration: null,
      updateExists: false,
      showSetting: 0,
    };
  },
  components: { GameList, Setting },
  mounted: function () {
    let mya = $(
      `<iframe id="myaudio" style="display:none;" referrerpolicy="no-referrer" />`
    );
    mya.appendTo("body");
    let ifr = mya[0];

    let currentDoc = ifr.contentDocument || ifr.contentWindow.document;
    currentDoc.body.innerHTML = `<audio id="sound" controls ></audio>`;
    let audio = currentDoc.querySelector("audio#sound");
    this.autio = audio;
    this.refresh();
    this.randList();
    let self = this;
    document.addEventListener("click", (event) => {
      if (
        self.$refs.setting &&
        !self.$refs.setting.$el.contains(event.target)
      ) {
        self.showSetting = 0;
      }
    });
  },
  activated() {
    //this.randList();
  },

  deactivated() {
    clearInterval(this.timer);
  },
  computed: {
    listenChangeCn() {
      const { rightCn, wrongCn } = this;
      return { rightCn, wrongCn };
    },
  },
  methods: {
    count(item, v) {
      if (!this.config.countMap) this.config.countMap = {};
      if (!this.config.countMap[this.lan]) {
        this.config.countMap[this.lan] = {};
      }
      if (this.config.countMap[this.lan][item[this.lan]] == undefined)
        this.config.countMap[this.lan][item[this.lan]] = 0;
      if (v !== undefined) {
        this.config.countMap[this.lan][item[this.lan]] = v;
        this.saveConfig();
      }
      console.log(this.config.countMap[this.lan][item[this.lan]]);
      return this.config.countMap[this.lan][item[this.lan]];
    },
    updateAvailable(event) {
      this.registration = event.detail;
      this.updateExists = true;
      this.refreshApp();
    },

    refreshApp() {
      this.updateExists = false;
      // Make sure we only send a 'skip waiting' message if the SW is waiting
      if (!this.registration || !this.registration.waiting) return;
      // send message to SW to skip the waiting and activate the new SW
      this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
    },
    openGame(minus, changePwd = 0) {
      let pwd = storejs.get("pwd");
      if (pwd) {
        let curpwd = prompt("pwd");
        if (curpwd == pwd) {
          if (changePwd) {
            pwd = prompt("setting pwd");
            let pwd2 = prompt("setting pwd");
            if (pwd == pwd2) storejs.set("pwd", pwd);
          } else this.startShowGame(minus);
        }
      } else {
        pwd = prompt("setting pwd");
        if (pwd) {
          storejs.set("pwd", pwd);
        }
        this.startShowGame(minus);
      }
    },
    async refresh() {
      let self = this;
      if (this.refresing) return;
      this.refresing = 1;
      for (var i = 5; i >= 0; i--) {
        try {
          await new Promise((resolve, reject) => {
            $.ajax({
              url: "https://smlog.github.io/data/dict.js",
              dataType: "jsonp",
              jsonpCallback: "cb",
            })
              .done(function (data) {
                //console.log(data);
                let dictList = self.dictList;
                let init = dictList.length == 0;
                let cmap = dictList.reduce((m, c) => {
                  m[c.en] = c.c == undefined ? 0 : c.c;
                  return m;
                }, {});
                dictList.length = 0;
                let obj = JSON.parse(pako.ungzip(atob(data), { to: "string" }));
                Object.assign(self.config, obj.config || {});
                console.log(self.config);
                self.saveConfig();
                dictList.push(...obj["items"]);
                dictList.forEach((e) => {
                  e.c = cmap[e.en] == undefined ? 0 : cmap[e.en];
                });
                if (init) self.randList();
                storejs.set("dicts", dictList);

                //  this.syning = 0;
                resolve();
              })
              .fail(function (e) {
                reject(e);
              });
          });

          break;
        } catch (e) {
          console.error(e);
          if (i == 0) alert("fail refresh data");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      }
      this.syning = 0;
      this.refresing = 0;
    },
    fillLetterIndex(i) {
      if (this.fill.indexOf(i) == -1) {
        this.fill.push(i);
        if (this.fill.length == this.letters2.length) {
          this.isCorrect =
            this.fill.map((e) => this.letters2[e]).join("") ==
            this.letters.join("")
              ? 1
              : 2;

          if (this.isCorrect == 1) {
            (async () => {
              await this.select(0, this.list[0]);
              //await this.say("yes", "en");
              await new Promise((resolve) => setTimeout(resolve, 1000));
              //await this.randList();
            })();
          } else if (this.isCorrect == 2) this.say("no", "en");
        }
      }
    },
    unFillLetterIndex(i) {
      this.fill.length > i && this.fill.splice(i);
    },

    sendFeedBack(selectIndex) {
      var item = this.list[this.curIndex];
      if (item.rTimes == null) item.rTimes = 0;
      if (selectIndex != this.curIndex) {
        if (item.rTimes > 0) item.rTimes = 0;
        item.rTimes--;
      } else {
        item.rTimes++;
      }
    },
    closeGame() {
      this.showGameIf = false;
      clearTimeout(this.timer);
      this.randList();
    },
    startShowGame(time) {
      this.clockt = parseInt(time * 60 * 1000);
      this.showGameIf = true;
      if (this.clockTimer) clearInterval(this.clockTimer);

      this.clockTimer = setInterval(() => {
        this.clockt = this.clockt - 1000;
        if (this.clockt <= 0) {
          this.showGameIf = false;
          clearInterval(this.clockTimer);
          this.randList();
        }
      }, 1000);
    },
    replay() {
      var item = this.list[this.curIndex];
      let text = item[this.lan];
      this.say(text);
    },
    async select(index, item, evt) {
      if (this.selected) {
        console.log("repeat select");
        return;
      }
      if (this.clickIndex == index) {
        this.clickIndex = -1;
      } else this.clickIndex = index;

      this.selected = 1;
      let targetText = item[this.lan];

      if (index == this.curIndex) {
        this.lastYesIndex = index;
        if ((this.mode != 0 && this.mode != 3) || (this.mode == 3 && !evt)) {
          this.rightCn++;
          this.curAct = 1;
          this.count(item, this.count(item) + 1);
        }
        await this.say(targetText, this.lan);

        if (this.rightCn - this.wrongCn >= this.config.passNum) {
          this.rightCn = 0;

          return this.startShowGame(this.config.gameTime2);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await this.randList();
        }
      } else {
        await this.say(targetText, this.lan);

        this.wrongCn++;
        this.curAct = -1;
        this.list.forEach((e) => this.count(e, this.count(e) - 1));
      }
      this.selected = 0;
    },

    n() {
      return this.mode == 1 ? 4 : 1;
    },
    async randList() {
      console.log(this.config.enable);
      let langs = Object.keys(this.config.enable).filter(
        (e) => this.config.enable[e]
      );
      if (langs.length == 0) {
        alert("please select  at least one language first");
        return;
      }
      this.lan = langs[parseInt(Math.random() * langs.length)];

      if (this.dictList.length == 0) return;

      let dictList = this.dictList;
      if (dictList.length < this.n()) {
        dictList = this.dictList;
      }
      this.selected = 0;

      this.list.length = 0;
      this.fill.length = 0;
      this.letters2.length = 0;
      this.letters.length = 0;
      this.isCorrect = 0;

      for (var i = 0; i < this.n(); i++) {
        var j = parseInt(dictList.length * Math.random());

        if (this.list.indexOf(dictList[j]) > -1) i--;
        else this.list.push(dictList[j]);
      }

      this.curIndex = parseInt(Math.random() * this.list.length);

      this.letters2 = this.list[this.curIndex][this.lan]
        .toLowerCase()
        .trim()
        .split("")
        .sort();
      this.letters = this.list[this.curIndex][this.lan]
        .toLowerCase()
        .trim()
        .split("");
      this.mode != 0 && this.replay();
      this.clickIndex = -1;
    },

    async say(str) {
      if (!str) {
        console.error("empty");
        return;
      }
      let lan = this.config.ttslan[this.lan];
      this.speaking = true;

      let _this = this;
      return new Promise((resolve) => {
        let base = `https://fanyi.baidu.com/gettts?lan=${encodeURIComponent(
          lan
        )}&text=${encodeURIComponent(str.trim())}&spd=3&source=web&cache=0`;

        if (this.lan == "en" && localStorage.sound == "YD") {
          base = `https://dict.youdao.com/dictvoice?type=2&audio=${encodeURIComponent(
            str.trim()
          )}&cache=0`;
        }

        let audio = this.autio;
        let t = 0;
        let tretry = function (error) {
          console.error("error");
          console.error(error);
          if (t < 10) {
            audio.src = base;
            audio.play();
          }
          t++;
        };

        audio.onerror = tretry;

        audio.src = base;
        audio.volume = 1;

        audio.addEventListener("ended", function () {
          _this.speaking = false;

          return resolve();
        });
        setTimeout(() => {
          audio.play();
        }, 10);
      });
    },

    getWrongSetence(lan) {
      let lanlist = {
        en: ["no no no", "oh sorry.", "incorrect", "come on."],
      };
      let list = lanlist[lan];
      let i = parseInt(Math.random() * list.length);
      return list[i];
    },
    getRightSetence(lan) {
      let lanlist = {
        en: ["yes yes yes", "well done", "good job"],
      };
      let list = lanlist[lan];

      let i = parseInt(Math.random() * list.length);
      return list[i];
    },
  },
  watch: {
    lanMode() {
      this.randList();
    },
    mode() {
      this.randList();
    },
  },
};
</script>

<style scoped>
span.al {
  border: 1px solid gray;
  display: inline-block;
  margin: 3px;
  padding: 3px;
  font-weight: bold;
  font-size: 1.4em;
  width: 1.5em;
  text-align: center;
}
span.al.hide {
  display: none;
}
#gamefr {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 1000;
  left: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(200, 200, 200, 0.8);
}
h3 {
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
li.it {
  display: flex;
  text-align: left;
  max-height: 100px;
  overflow: hidden;

  padding-top: 10px;
}

.url {
  margin: 5px;
  float: left;
  cursor: pointer;
}
.cur {
  background: gray;
}
.bt {
  cursor: pointer;
  margin: 5px 3px;
}
.showAll_k.it {
  max-height: 100%;
}

.figure-list {
  margin: 0;
  padding: 0;
}
.figure-list:after {
  content: "";
  display: block;
  clear: both;
  height: 0;
  overflow: hidden;
  visibility: hidden;
}
.figure-list li img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  transition: all 0.3s;
}
.figure-list li {
  list-style: none;
  width: calc(25% - 10px);
  margin: 0 5px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  vertical-align: top;
  border-radius: 14px;
  background: white;
  /*display: table-cell;*/
  padding: 5px;
  background: white;
  /* display: table-cell; */
  border: solid 1px #ccc;
  position: relative;
}
.figure-list li:nth-last-child(1):first-child {
  width: calc(400px - 10px);
}
.figure-list li:last-child {
  margin-right: 0;
}
@media screen and (max-width: 980px) {
  .figure-list li {
    list-style: none;
    width: calc(50% - 10px);
    margin: 5px;
  }
  .figure-list li:nth-last-child(1):first-child {
    width: 98%;
  }
}

/*.figure-list figure:hover {
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
  border-radius: 4px;
}*/
.figure-list figure {
  position: relative;
  width: 100%;
  height: 0;
  overflow: hidden;
  margin: 0;
  padding-bottom: 100%; /* 关键就在这里 */
  background-position: center;
  background-repeat: no-repeat;
  /*background-size: cover;*/
  background-size: contain;

  -webkit-transition: all 1s;
  transition: all 1s;
  margin: 0;
  border-radius: 10px;
}
.figure-list figure a {
  display: block;
  position: absolute;
  width: 100%;
  top: 0;
  bottom: 0;
}
li:hover {
  box-shadow: rgb(245, 108, 108) 0 0 10px;
}
li.ready:hover {
  box-shadow: none;
}

@keyframes tada {
  0% {
    transform: rotateY(0deg);
  }

  100% {
    transform: rotateY(-180deg);
  }
}

.tada {
  animation-name: tada;
}

.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}

.animated.infinite {
  animation-iteration-count: infinite;
}
.speaking {
  animation: warn 1.5s ease-out 0s infinite;
}
@keyframes warn {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }

  30% {
    opacity: 1;
  }

  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}
.itemText {
  text-align: left;
  position: absolute;
  font-size: 2em;
  display: flex;
  z-index: 0;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  right: 0;
  bottom: 0;
  align-items: center;
  text-align: center;
}
.itemText span {
  display: block;
  width: 100%;
  color: black;
}
.itemText span:first-child {
  background: white;
}
.itemText span:last-child {
  background: white;
}
.aDSsMd-open {
  position: absolute;
  width: 40px;
  height: 40px;
  bottom: -4px;
  left: -4px;
  -webkit-transform: scale(0.5);
  -ms-transform: scale(0.5);
  transform: scale(0.5);
  background: url(//m.baidu.com/static/ecom/img/pc/pc-video-volume@2_5ae888e.png)
    no-repeat;
}
.yes {
  animation: fadenum 1s;
  animation-fill-mode: forwards;
}

@keyframes fadenum {
  0% {
    transform: scale(1, 1);
  }

  100% {
    transform: scale(0, 0);
  }
}

.card {
  margin: auto;
  width: calc(25% - 10px);
  background-color: transparent;
}
.card__content {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: all 1s;
  transform-style: preserve-3d;
}

.click .card__content {
  transform: rotateY(180deg);
}

.card__front,
.card__back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card__front {
  font-size: 150px;
}

.card__back {
  transform: rotateY(180deg);
}
.itemText span.red {
  color: red;
}
.itemText span.green {
  color: green;
}
.centered {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
