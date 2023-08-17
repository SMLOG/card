<template>
  <div class="list">
    <div
      v-infinite-scroll="loadMore"
      infinite-scroll-disabled="busy"
      infinite-scroll-distance="30"
      style="max-height: 400px; overflow: auto"
    >
      <div style="padding: 5px; background: white">
        <table style="text-align: left; width: 100%">
          <tr
            v-for="(item, i) in pageList"
            :key="item.vid || item.title"
            style="cursor: pointer"
          >
            <td>
              <template>
                <div
                  @click="play(item, 1, i)"
                  :class="{ cur: curVideoId == item.vid, ni: !item.i }"
                >
                  <i class="num" @click="onFav($event, item, mediaType)">{{
                    i + 1
                  }}</i>
                  <span v-if="item.d">{{ item.d }}:</span>
                  {{
                    (curMediaType.title && curMediaType.title(item)) ||
                    item.title
                  }}
                  <span class="src" v-if="item.src">{{ item.src }}</span>

                  <span v-if="item.rate"> rate:{{ item.rate }} </span>

                  <span v-if="item.fav">*</span>
                </div>

                <div
                  v-if="curVideoId == item.vid && item.urls && item.urls.length"
                >
                  <span
                    style="margin: 8px"
                    v-for="(url, index) in item.urls"
                    :key="index"
                    :class="{ cur: subIndex == index }"
                    >{{ index + 1 }}</span
                  >
                </div>
              </template>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div style="text-align: right; background: gray; padding-right: 5px">
      <select v-show="opts1.length" v-model="curOpt1" @change="page = 1">
        <option value="">All</option>
        <option v-for="src in opts1" :key="src" :value="src">
          {{ src }}<span v-if="cnt">({{ cnt[src + curOpt2] }})</span>
        </option>
      </select>
      <select v-show="opts2.length" v-model="curOpt2" @change="page = 1">
        <option value="">All</option>
        <option v-for="src in opts2" :key="src" :value="src">
          {{ src }}<span v-if="cnt">({{ cnt[curOpt1 + src] }})</span>
        </option>
      </select>
      <select v-model="mediaType" @change="changeMediaType()">
        <option v-for="(meidaType, i) in mediaTypes" :key="i" :value="i">
          {{ meidaType.n }}
        </option>
      </select>
      Filter:<input
        style="width: 60px"
        v-model="search"
        @focus="focusSearch()"
      />
      (<input style="width: 25px" v-model="page" />/{{ pages }})
      <a class="ctrl" @click="toPage(page - 1)"> Prev </a>
      <a class="ctrl" @click="toPage(page + 1)"> Next </a>
    </div>
  </div>
</template>

<script>
import bus from "@/bus";
import { mapState } from "vuex";
import { service } from "@/service";

import radios from "@/../public/radios.json";
//import iptv from "@/../public/iptv.json";
import storejs from "storejs";
import { sources } from "@/config";

function calcTime(date, city, offset) {
  let d = new Date();
  let utc = d.getTime() + d.getTimezoneOffset() * 60000;

  let dt = new Date(utc + 3600000 * offset);

  var stemp;
  //	var dt_year = dt.getUTCFullYear();
  //var dt_month = dt.getMonth() + 1;
  //var dt_day = dt.getDate();
  var dt_hour = dt.getHours();
  var dt_minute = dt.getMinutes();
  var dt_second = dt.getSeconds();
  //	dt_year = dt_year.toString();
  if (dt_hour < 10) dt_hour = "0" + dt_hour;
  if (dt_minute < 10) dt_minute = "0" + dt_minute;
  if (dt_second < 10) dt_second = "0" + dt_second;
  stemp = " " + dt_hour + ":" + dt_minute + ":" + dt_second + "";
  return stemp;

  //   return "<div class='cty-name'>" + city + " </div>" + nd.toLocaleString();
}

const tzs = {
  UK: { name: "纽约", t: 0, d: "-5" },
  US: { name: "纽约", t: 0, d: "-4" },
  CL: { name: "西班牙", d: "+1" },
  CA: { name: "加拿大", t: 0, d: "+1" },
  AU: { name: "莫斯科", t: 0, d: "+3" },
  CN: { name: "北京", t: 0, d: "+8" },
  JP: { name: "东京", t: 0, d: "+9" },
};

(async () => {
  for (;;) {
    Object.keys(tzs).map((e) => {
      let tz = tzs[e];
      tz.t = calcTime(0, 0, tz.d);
    });
    await new Promise((r) => setTimeout(r, 10000));
  }
})();

let radioList = radios.map((e) => {
  e.vid = e.url;
  return e;
});
let iptvList = storejs.get("iptv_fav") || [];

export default {
  data() {
    return {
      mediaTypes: [
        { n: "Radio", data: radioList },
        {
          n: "Video",
          c: sources,
          data: function () {
            return this.videos;
          },
        },
        { n: "TV", data: iptvList, c: [] },
        {
          n: "CH",
          data: [],
          c: [],
          s: function (e, v) {
            let content =
              e["group-title"] + e["tvg-language"] + e["tvg-country"] + e.title;
            return content.toLowerCase().indexOf(v) > -1;
          },
          c2: [],
          c2f: function (e, v) {
            let lang = e["tvg-language"];
            return lang && lang.indexOf(v) > -1;
          },
          title: function (item) {
            let c = item["tvg-country"];
            return c + (tzs[c] && tzs[c].t ? tzs[c].t : "") + ":" + item.title;
          },
          cnt: {},
        },
        {
          n: "MJ",
          data: [],
          c: [],
        },
      ],
      curOpt1: "",
      curOpt2: "",
      pageSize: 500,
      page: 1,
      curVideoId: "",
      search: "",
      busy: 0,
      mediaType: 1,
      subIndex: 0,
    };
  },
  created() {},
  computed: {
    cnt() {
      return this.mediaTypes[this.mediaType].cnt;
    },
    curMediaType() {
      return this.mediaTypes[this.mediaType];
    },
    opts1() {
      let r = this.mediaTypes[this.mediaType].c || [];
      let cnt = this.mediaTypes[this.mediaType].cnt;
      if (this.curOpt2 && cnt) {
        r = r.filter((e) => cnt[e + this.curOpt2]);
      }
      return r;
    },
    opts2() {
      let r = this.mediaTypes[this.mediaType].c2 || [];
      let cnt = this.mediaTypes[this.mediaType].cnt;
      if (this.curOpt1 && cnt) {
        r = r.filter((e) => cnt[this.curOpt1 + e]);
      }

      return r;
    },
    pageList() {
      let list = this.searchList();

      if (list.length > 0) list = list.slice(0, this.page * this.pageSize);
      return list;
    },

    pages() {
      let list = this.searchList();

      return Math.floor((list.length + this.pageSize - 1) / this.pageSize);
    },
    ...mapState(["videos"]),
  },
  methods: {
    onFav(event, item, mediaType) {
      event.stopPropagation();
      if (mediaType == 3) {
        item.fav = !item.fav;
        let index = -1;
        for (var i = 0; i < iptvList.length; i++) {
          if (iptvList[i]["tvg-id"] == item["tvg-id"]) {
            index = i;
            break;
          }
        }
        if (index > -1) {
          if (!item.fav) iptvList.splice(index, 1);
        } else {
          if (item.fav) iptvList.push(item);
        }
        storejs.set("iptv_fav", iptvList);
      }
    },
    focusSearch() {
      this.search = "";
    },
    changeMediaType() {
      switch (this.mediaTypes[this.mediaType].n) {
        case "CH":
          if (this.mediaTypes[this.mediaType].data.length == 0) {
            let ss = sessionStorage;
            let allChannels = this.mediaTypes[this.mediaType].data;
            let types = this.mediaTypes[this.mediaType].c;
            let langs = this.mediaTypes[this.mediaType].c2;
            let mapCount = this.mediaTypes[this.mediaType].cnt;

            const groupTitle = "group-title";
            const language = "tvg-language";
            (async () => {
              if (this.loading) return;
              this.loading = 1;
              if (ss.getItem("chs")) {
                allChannels.push(...JSON.parse(ss.getItem("chs")));
                types.push(...JSON.parse(ss.getItem("chs_groups")));
                langs.push(...JSON.parse(ss.getItem("chs_langs")));
                Object.assign(mapCount, JSON.parse(ss.getItem("chs_cnt")));
              } else
                for (let k = 10; k > 0; k--) {
                  try {
                    var con = await fetch(
                      "https://iptv-org.github.io/iptv/index.m3u?cache=1296000000"
                    ).then((r) => r.text());
                    let lines = con.split(/\n+/);

                    let reg = /([^\s=]+)="(.*?)"/g;
                    for (let i = 0; i < lines.length; i++) {
                      let ch = {};
                      if (lines[i].indexOf("#EXTINF") == 0) {
                        let m;
                        while ((m = reg.exec(lines[i]))) {
                          ch[m[1]] = m[2];
                        }
                        let lang = ch["tvg-language"];
                        ch["title"] = lines[i].split(",").pop();
                        i++;
                        if (lines[i].indexOf("http") == 0) {
                          ch["url"] = lines[i];
                          //  console.log(ch);
                          ch["vid"] = i;
                          ch.src = ch[groupTitle];
                          ch.fav = 0;
                          allChannels.push(ch);

                          ch.src &&
                            ch.src.split(/;/).forEach((e) => {
                              types.indexOf(e) == -1 && types.push(e);
                            });

                          lang &&
                            lang.split(/;/).forEach((e) => {
                              langs.indexOf(e) == -1 && langs.push(e);
                            });
                        }
                      }
                    }
                    allChannels.sort((a, b) =>
                      a[groupTitle].localeCompare(b[groupTitle])
                    );
                    types.sort();
                    langs.sort();
                    ss.setItem("chs", JSON.stringify(allChannels));
                    ss.setItem("chs_groups", JSON.stringify(types));
                    ss.setItem("chs_langs", JSON.stringify(langs));
                    allChannels.forEach((e) => {
                      if (e[groupTitle]) {
                        e[groupTitle].split(";").forEach((g) => {
                          let k = g + e[language];
                          mapCount[k] = mapCount[k] ? mapCount[k] + 1 : 1;
                          mapCount[g] = mapCount[g] ? mapCount[g] + 1 : 1;
                        });
                      }

                      mapCount[e[language]] = mapCount[e[language]]
                        ? mapCount[e[language]] + 1
                        : 1;
                    });
                    ss.setItem("chs_cnt", JSON.stringify(mapCount));

                    break;
                  } catch (e) {
                    console.error(e);
                    types.length = allChannels.length = 0;
                    this.loading = 0;
                  }
                }
              this.loading = 0;
            })();
          }
          break;
        case "MJ":
          if (this.mediaTypes[this.mediaType].data.length == 0) {
            if (this.loading) return;
            this.loading = 1;
            service(
              null,
              { cmd: "urls", content: { p: "mj.json", cache: 86400000 } },
              (resp) => {
                this.loading = 0;

                if (resp.content && resp.content.length) {
                  this.mediaTypes[this.mediaType].data.push(
                    ...resp.content.map((e) => {
                      return {
                        vid: e[0],
                        title: e[1],
                        urls: [],
                        rate: e[2],
                        date: e[4],
                      };
                    })
                  );
                }
              }
            );
          }

          break;
      }
    },
    loadMore() {
      this.busy = true;
      setTimeout(() => {
        this.busy = this.pages > 0 && this.page >= this.pages;
        if (!this.busy) {
          this.page++;
        }
      }, 1000);
    },
    searchList() {
      let s = this.search.toLowerCase().trim();

      if (this.mediaType == 1) {
        let videos = this.videos;

        if (this.curOpt1) videos = videos.filter((e) => e.src == this.curOpt1);

        if (!s) return videos;

        return videos.filter(
          (e) => e.d.indexOf(s) > -1 || e.title.toLowerCase().indexOf(s) > -1
        );
      }

      let mediaArr = this.mediaTypes[this.mediaType].data;
      let opt2f = this.mediaTypes[this.mediaType].c2f;
      let search =
        this.mediaTypes[this.mediaType].s ||
        ((e, s) => e.title.toLowerCase().indexOf(s) > -1);

      if (this.curOpt1)
        mediaArr = mediaArr.filter((e) => e.src.indexOf(this.curOpt1) > -1);
      if (this.curOpt2 && opt2f)
        mediaArr = mediaArr.filter((e) => opt2f(e, this.curOpt2));

      if (!s) return mediaArr;
      else return mediaArr.filter((e) => search(e, s));
    },

    play(item, click, index, index2) {
      this.curVideoId = item.vid;
      console.log("vidoeId" + item.vid);
      let run = 1;
      if (this.mediaType == 4) {
        index2 = index2 || 0;
        this.subIndex = index2;

        if (item.urls.length) item.url = item.urls[index2];
        else {
          run = 0;
          service(
            null,
            { cmd: "urls", content: { p: "mj/" + item.vid, cache: 86400000 } },
            (resp) => {
              if (resp.content && resp.content.length) {
                item.urls.push(...resp.content);
                item.url = item.urls[index2];
                bus.$emit(
                  "videoId",
                  parseInt(this.mediaType),
                  item,
                  click,
                  index,
                  index2
                );
              }
            }
          );
        }
      }
      if (run)
        bus.$emit(
          "videoId",
          parseInt(this.mediaType),
          item,
          click,
          index,
          index2
        );

      if (click) {
        this.$emit("selectItem", item);
      }
    },
    toPage(i) {
      if (i < 1 || i > this.pages) return;
      this.page = i;
    },
  },
  mounted() {
    bus.$on("end", (videoId, reverse, i, i2) => {
      let list = this.searchList();

      let index = i;
      let index2 = i2;

      if (this.mediaType != 4) {
        if (reverse) {
          index--;
          if (index < 0) index = list.length - 1;
        } else {
          index++;
          if (index >= list.length) index = 0;
        }
      } else {
        let mlen = list[index].urls.length;

        if (reverse) {
          index2--;
          if (index2 < 0) index2 = mlen - 1;
        } else {
          index2++;
          if (index2 >= mlen) index2 = 0;
        }
      }
      this.play(list[index], 0, index, index2);
    });
  },

  watch: {
    mediaType() {
      this.page = 1;
      this.busy = 0;
      this.curOpt1 = this.curOpt2 = "";
    },
  },
};
</script>

<style scoped>
p {
  font-size: 20px;
}
table tr:nth-child(odd) {
  background-color: #f5f5f5;
}
table tr:nth-child(even) {
  background-color: #fff;
}
.ctrl {
  user-select: none;
  cursor: pointer;
}
.ni {
  color: gray;
}
.cur {
  color: red;
}
.list >>> .src,
.list >>> .num {
  color: gray;
  font-size: 0.8em;
  display: inline-block;
  padding-right: 5px;
  cursor: pointer;
}
</style>
