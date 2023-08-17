<template>
  <div>
    <div v-show="show" ref="top" class="top">
      <div ref="videoCon" class="videoCon" v-show="0 != mediaType">
        <video
          style="width: 100%; height: 100%"
          x5-playsinline
          preload="auto"
          webkit-playsinline="true"
          playsinline="true"
          x-webkit-airplay="allow"
          airplay="allow"
          controls
          ref="videoPlayer"
          class="video-js vjs-default-skin vjs-big-play-centered vjs-16-9"
          poster=""
          autoplay="false"
        ></video>
      </div>
      <audio
        controls
        style="width: 100%"
        :title="title"
        ref="audio"
        v-show="mediaType == 0"
      />
      <div style="position: relative">
        <a
          @click="clickUrl(url)"
          :title="title"
          style="color: blue; cursor: pointer"
          >{{ title }}</a
        >
        <div
          style="
            position: absolute;
            right: 0;
            top: 0;
            background: white;
            padding-left: 10px;
          "
          id="bts"
          ref="bts"
        >
          <select v-model="qIndex" @change="changeQulity()">
            <option v-for="q in qualities" :key="q.l">{{ q.q }}</option>
            <option value="-1">auto</option>
          </select>
          <a class="up"
            ><input type="checkbox" v-model="isCc" :checked="isCc" /> cc</a
          >
          <!-- <a @click="toggleBg()" :class="{ enable: isBgAudioOn }"> bg</a> -->
          <a @click="next()"> Next</a>
          <a @click="prev()"> Prev</a>
          <a class="up"
            ><input
              type="checkbox"
              v-model="isAutoScroll"
              :checked="isAutoScroll"
            />
            Up {{ top }}</a
          >
        </div>
      </div>
      <div ref="text" class="text">
        <a @click="clickUrl(url)" style="color: blue; cursor: pointer">{{
          title
        }}</a>
        <div v-html="text" ref="lynx"></div>
      </div>
    </div>
    <PlayerControllers :playing="playing" />
  </div>
</template>

<script>
import $ from "jquery";
import { mapState } from "vuex";
import bus from "@/bus";
import { htmlTrans } from "@/HtmlTrans";

import PlayerControllers from "../components/PlayerControllers";
//import { vplayer } from "vue-hls-player";
import Vue from "vue";

import { service } from "@/service";
import { getExtra } from "@/config";

import videojs from "video.js";
import "videojs-contrib-hls";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
import "@silvermine/videojs-airplay/dist/silvermine-videojs-airplay.css";

require("@silvermine/videojs-airplay")(videojs);

Vue.prototype.$video = videojs;

export default {
  data() {
    return {
      qualities: [],
      cc: 0,
      qIndex: -1,
      cueIndex: 0,
      item: {},
      isCc: 0,
      mediaType: 1,
      videoUrl: "",
      isBgAudioOn: 0,
      show: 0,
      url: "",
      top: "0%",
      player: null,
      videos: null,
      videoId: "",
      videoIndex: 0,
      text: "",
      scrollTimer: 1,
      title: "",
      isAutoScroll: true,
      playing: 0,
      sps: [],
      options: {
        inactivityTimeout: 5000,
        userActions: {
          hotkeys: function (event) {
            // `this` is the player in this context

            // `x` key = pause
            if (event.which === 88) {
              this.pause();
            }
            // `y` key = play
            if (event.which === 89) {
              this.play();
            }
          },
        },
        type: "application/x-mpegURL",
        src: "",
        preload: true, //是否预下载，默认为true
        autoplay: false, //是否自动播放（兼容性不太好），默认为false
        isLoop: false, //是否循环，默认不循环
        playsinline: true, //h5是否行内播放，默认false，有兼容性问题
        // poster: "https://oimdztrab.qnssl.com/Frp4SyVe5PosdkUKRaE-krjK7B5z", //封面，仅视频有
        controls: "progress,current,durration,volume",
        crossOrigin: false, //设置视频的 CORS 设置。
        textTrackDisplay: true,
        playbackRates: [0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3],
        fill: true,
        fluid: true,
        plugins: {
          airPlay: {
            addButtonToControlBar: true, // defaults to `true`
          },
        },
        html5: {
          vhs: {
            overrideNative: false,
          },
          hls: {
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            overrideNative: false,
          },
          nativeVideoTracks: true,
          nativeAudioTracks: true,
          // nativeTextTracks: true,
        },
      },
    };
  },
  created() {},
  computed: {
    ...mapState(["curItem", "words"]),
  },
  components: { PlayerControllers },
  methods: {
    clickUrl(url) {
      open(url);
    },

    tryCaption2TTV() {
      var map = {};
      //  var arr = [];
      // arr.push("WEBVTT\n");
      let curTrack;
      this.onCuesChangeSync2 = (curCue, track) => {
        if (track.mode == "showing" && track.kind == "captions") {
          if (curTrack != track) {
            // arr.length = 0;
            map = {};
            $(this.$refs.lynx).html("");
          }
          curTrack = track;
          var cues = track.cues;
          var a = [];
          for (var i = cues.length - 1; i >= 0; i--) {
            let cue = cues[i];
            if (map["" + cue.startTime]) break;

            map["" + cue.startTime] = 1;
            let beg = parseInt(cue.startTime);
            let end = parseInt(cue.endTime);
            //console.log(cue.text);
            let t = `<span begin="${beg}" end="${end}">${htmlTrans(
              this.words,
              cue.text,
              false
            ).replace(/^(\s*[A-Z][^A-Z]+)/g, "<br />$1")}</span> `;
            a.unshift(t);
            // console.log(cue.text);
            //  console.log(t);
            // window.htmlTrans = htmlTrans;
          }
          if (a.length > 0) {
            //arr.push(...a);
            this.cues = $(this.$refs.lynx).append(a.join("\n")).find("span");
          }
        }
      };
    },
    scroll(clear) {
      clearInterval(this.scrollTimer);
      this.onCuesChangeSync = 0;

      if (!this.isAutoScroll || clear) {
        return;
      }

      if (this.cc) {
        //$("span:empty", this.$refs.text).remove();

        if (this.player) {
          this.cueIndex = 0;
          let $text = $(this.$refs.text);
          // $text.find("span").not("[begin]").remove();

          this.cues = $text.find("span");
          $text.find("span").each(function () {
            if (!$(this).text().trim()) $(this).attr("skip", 1);
          });
          this.onCuesChangeSync = () => {
            let sp = this.cues;
            //  console.log("scroll " + new Date().getSeconds());
            let s = parseInt(this.player.currentTime());
            //let s = parseInt(this.player.currentTime() - 500);
            if (this.cueIndex > 0) {
              let t = sp.eq(this.cueIndex);
              t.addClass("cur");

              if (!t.attr("skip")) this.scrollMid(t, $text);
              this.cueIndex++;
            } else
              for (let j = 0; j < sp.length; j++) {
                let t = sp.eq(j);
                if (t && t.attr("begin") <= s && t.attr("end") > s) {
                  //if (j == this.cueIndex) break;
                  $text.find("span.cur").removeClass("cur");
                  t.addClass("cur");

                  // sp.eq(this.cueIndex).removeClass("cur");
                  this.cueIndex = j + 1;
                  this.scrollMid(t, $text);
                  break;
                }
              }
          };
        }
      } else {
        let $text = $(this.$refs.text);
        let $lynx = $(this.$refs.lynx);
        let lastPos = 0;
        $text.animate({ scrollTop: -$text.height() }, 100);
        this.scrollTimer = setInterval(() => {
          let st = 0;
          let h = $text.height();
          let s = $lynx.height() - h;
          let duration = this.player.duration();
          let v = (s + h / 2) / duration;
          //let delay = h  / v;
          // let pace = Math.ceil((2 * s) / (duration - delay - delay));
          let pace = Math.ceil(2 * v);
          if (
            // this.player.currentTime() >= delay - 6 &&
            this.player.currentTime() != lastPos
          ) {
            st = $text.scrollTop() + pace;
            $text.animate({ scrollTop: st }, 100);
            lastPos = this.player.currentTime();
          }

          this.top = Math.floor(100 * Math.min(1, (1.0 * st) / s)) + "%";
        }, 2000);
      }
    },

    markNewWords(t) {
      var dict = this.words;
      window.words = dict;
      this.text = htmlTrans(dict, t.replace(/\n/g, "<br />"));
    },
    ajustTextHeight() {
      var topDom = this.$refs.text;

      topDom.style.top =
        $(this.$refs.videoCon).height() + $(this.$refs.bts).height() + "px";
    },
    next() {
      console.log("next");
      this.end(0);
      this.cueIndex = 0;
    },
    prev() {
      this.end(1);
    },
    end(reverse) {
      this.scroll(true);

      bus.$emit("end", this.videoId, reverse, this.videoIndex, this.subIndex);
    },

    async isRealPause() {
      let times = 0;
      for (;;) {
        if (this.lastPosition == this.player.currentTime()) times++;
        if (times > 3) break;
        this.lastPosition = this.player.currentTime();
        await new Promise((resolve) => setTimeout(resolve, 15000));
      }
    },
    setQuality(q) {
      this.qIndex = q;
      this.changeQulity();
    },
    changeQulity() {
      let list = this.qualities.filter((e) => e.q >= this.qIndex);
      if (list.length > 0) {
        let url =
          this.qIndex < 0
            ? this.videoUrl
            : this.videoUrl.substring(0, this.videoUrl.lastIndexOf("/") + 1) +
              list[list.length - 1].url;

        if (this.url == url) return;
        this.url = url;
        let ct = this.player.currentTime();
        this.player.src([
          {
            src: url,
            type: "application/x-mpegURL",
          },
        ]);
        this.player.currentTime(ct);
      }
    },
    updateQualities(url) {
      (async () => {
        var str = await fetch(url, { cache: "force-cache" }).then((r) =>
          r.text()
        );
        var lines = str.split(/\n/).filter((e) => e);

        var out = [];
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].indexOf("#EXT-X-STREAM-INF") == 0) {
            var q = lines[i].match(/RESOLUTION=\d+x(\d+)/)[1];
            out.push({ q: q, url: lines[i + 1] });
            i++;
          } else if (
            lines[i].indexOf("#EXT-X-MEDIA") == 0 &&
            lines[i].match(/URI="(.*?)"/)
          ) {
            out.push({ q: 0, url: lines[i].match(/URI="(.*?)"/)[1] });
          }
        }
        out.sort((a, b) => b.q - a.q);
        this.qualities.length = 0;
        this.qualities.push(...out);
        setTimeout(() => {
          this.changeQulity();
        }, 200);
      })();
    },
    initVideo(url) {
      this.videoUrl = url;
      let videoUrl = url;

      this.updateQualities(url);

      this.player.src([
        {
          src: videoUrl,
          type: "application/x-mpegURL",
        },
      ]);
      window.player = this.player;

      this.url = url;

      this.player.play();

      // Get all text tracks for the current player.

      this.ajustTextHeight();
    },
    toggleBg() {
      this.isBgAudioOn = !this.isBgAudioOn;
      service(null, { cmd: "bg", pause: !this.isBgAudioOn }, function () {});

      clearInterval(this.bgTimer);
      if (this.isBgAudioOn) {
        let ct = 0;

        this.bgTimer = setInterval(() => {
          let video = document.querySelector("video");
          if (!video.paused) {
            if (this.player.currentTime() == ct) {
              service(null, { cmd: "bg" }, function () {});
            }
            ct = this.player.currentTime();
          }
        }, 5000);
        this.player.play();
      }
    },
    cuechange(cue, track) {
      if (this.onCuesChangeSync2) {
        this.onCuesChangeSync2(cue, track);
      }
      if (this.onCuesChangeSync) {
        this.onCuesChangeSync(cue, track);
      }
    },
    initVideoPlayer() {
      var self = this;
      let player = this.player;
      if (!this.player) {
        $(this.$refs.top).scroll(function () {
          self.ajustTextHeight();
        });

        player = this.player = this.$video(
          this.$refs.videoPlayer,
          this.options,
          function () {
            /* var player = this;
            player.on("pause", function () {
              player.one("play", function () {
                player.src({
                  type: player.currentType(),
                  src: player.currentSrc(),
                });
                player.play();
              });
            });*/

            let tts = this.textTracks();

            let handler = () => {
              for (let i = 0; i < tts.length; i++) {
                let track = tts[i];
                if (track.mode == "showing" && track.kind == "captions") {
                  //track.removeEventListener(this.cuechange);
                  if (!track.cuechange) {
                    track.addEventListener("cuechange", () => {
                      track.activeCues[0] &&
                        self.cuechange(track.activeCues[0], track);
                    });
                    track.cuechange = 1;
                  }
                  break;
                }
              }
            };

            ["change", "removtrack", "addtrack"].forEach((e) => {
              tts.addEventListener(e, handler);
            });
            tts.addEventListener("addtrack", () => {
              setTimeout(() => {
                for (var d = 0; d < tts.length; d++) {
                  if (tts[d].kind == "captions")
                    tts[d].mode = self.cc ? "showing" : "disabled";
                  if (tts[d].label == "new word") break;
                }
              }, 5000);
            });
          }
        );

        player.on("ended", () => {
          this.end();
        });
        player.on("error", () => {
          this.end();
        });

        player.on("pause", () => {
          clearInterval(this.scrollTimer);
          this.scroll(true);
          this.playing = 0;
        });

        player.on("play", () => {
          this.playing = 1;
          this.scroll();
        });
        let audio = $(this.$refs.audio);
        audio.bind("ended", function () {
          self.end();
        });
        audio.bind("error", function () {
          self.end();
        });
        audio.bind("pause", function () {
          self.playing = 0;
        });
        audio.bind("play", function () {
          self.playing = 1;
        });
      }
    },
    trimDup(r) {
      var ret = [];
      var lines = r.split("\n");
      for (var i = 0; i < lines.length - 1; i++) {
        if (lines[i].trim()) {
          for (var j = i + 1; j < lines.length; j++) {
            if (lines[j].indexOf(lines[i]) == 0) {
              // console.log('i',i,'j',j)
              i = j;
            }
          }
        }
        // console.log(i,lines[i])

        ret.push(lines[i]);
      }
      ret = ret.map((e, i) => (i == 0 ? e : e.toLowerCase()));
      var re = ret
        .join("\n")
        .split(/(?=\d{2}:\d{2}:\d{2}.\d{3} --> \d{2}:\d{2}:\d{2}.\d{3})/)
        .map((e, i, arr) => {
          return i == 0 || i == arr.length - 1
            ? e
            : e.replace(
                /\d{2}:\d{2}:\d{2}.\d{3}\n/,
                arr[i + 1].split(" -->")[0] + "\n"
              );
        })
        .join("");
      return re;
    },
    async loadTTV(webvtt) {
      this.cc = 0;
      let raw = "";
      let text = "";

      if (webvtt) {
        let r = "";
        if (webvtt.indexOf("http") == 0) {
          try {
            r = await fetch(webvtt).then((r) => r.text());

            if (r.indexOf("<?xml") == 0) {
              r = r.replace(/\n/g, "");
              let p = /<p begin="(.*?)" end="(.*?)".*?>(.*?)<\/p>/g;
              let m;
              let vtt = "WEBVTT\n\n";

              while ((m = p.exec(r)) != null) {
                vtt += `${m[1]}0 --> ${m[2]}0\n${m[3]
                  .replace(/<.*?>\s*/g, " ")
                  .trim()}\n\n`;
              }
              r = vtt;
              this.cc = 1;
            }
          } catch (e) {
            console.log(e);
          }
        }
        let upper = r.match(/[A-Z]/g);
        let lower = r.match(/[a-z]/gi, "");
        if (upper && lower && upper.length / lower.length > 0.4) {
          var ar = r.split(/\n+/).filter((e) => e.indexOf(":") != 2);
          ar.shift();
          var temp = [];
          for (var i = 0; i < ar.length; i++) {
            var cl = ar[i].trim();
            for (var j = i + 1; j < ar.length; j++) {
              var nl = ar[j].trim();
              if (nl.indexOf(cl) > -1) {
                i = j;
                cl = ar[i].trim();
                continue;
              }
              break;
            }

            var k = temp.length;
            i;
            for (var jj = k - 1; jj >= 0 && k >= temp.length - 4; jj--) {
              var tl = temp[jj];
              if (cl.indexOf(tl) == 0) {
                k = jj;
                continue;
              }
            }
            temp.length = k;

            temp.push(cl);
          }
          r = temp.join(" ").toLowerCase().replace(/\s+/, " ");
        } else {
          this.cc = 1;
        }

        raw = r;
        console.log(this.isCc, this.cc);
        if (this.isCc && !this.cc) {
          this.next();
          return 1;
        }
        if (raw.trim()) {
          raw = htmlTrans(this.words, raw, false);
        }
        if (this.cc) {
          text = this.trans(raw);

          this.text = "";
          setTimeout(() => {
            this.text = this.caption2Text(raw);
          }, 500);
        } else {
          r = r.replace(/\.[\s]+/g, ".\n");
          this.markNewWords(r);
        }

        setTimeout(() => this.scroll(), 1000);
      }

      let player = this.player;
      let tracks = player.textTracks();
      for (var d = 0; d < tracks.length; d++) {
        if (tracks[d].label == "new word")
          player.removeRemoteTextTrack(tracks[d]);
      }

      if (text.trim()) {
        // console.error(raw);

        var subBlob = new Blob([raw]);
        var subURL = URL.createObjectURL(subBlob);

        player.addRemoteTextTrack(
          {
            kind: "captions",
            label: "new word",
            mode: "showing",
            srclang: "zh",
            default: "true",
            src: subURL,
          },
          true
        );
      }
      return 0;
    },
    caption2Text(raw) {
      return (
        "<span>" +
        raw
          .split(/\n/)
          .map((e) => e.replace(/^(\s*[A-Z][^A-Z]+)/g, "<br />$1"))
          .join("\n")
          .replace(
            /(\d{2}):(\d{2}):(\d{2}).(\d{3}) --> (\d{2}):(\d{2}):(\d{2}).(\d{3})/g,
            (a, a1, a2, a3, a4, a5, a6, a7) =>
              `<span begin="${a2 * 60 + parseInt(a3)}" end="${
                a6 * 60 + parseInt(a7)
              }">`
          )
          .replace(/<span/g, "</span><span")
      );
    },
    trans(raw) {
      let temp = $("<div>" + raw + "</div>");
      temp.find("em.newWord").replaceWith(function () {
        var t = $(this);

        let en = t.find(".newWorda").text();
        let zh = t.find(".newWordb").text();
        return `<i>${en}</i><b>${zh}</b>`;
      });
      return temp.html().replace(/&gt;/g, ">");
    },
    async loadVideo(item, mediaType) {
      let skip = 0;

      await getExtra(item, mediaType);

      this.onCuesChangeSync2 = 0;
      this.text = "";
      if (this.show) {
        await this.loadTTV(item.cc);
        if (!item.cc) {
          skip = 0;
          this.cc = 2;
          setTimeout(() => {
            this.tryCaption2TTV();
          }, 0);
        }
      }

      !skip && this.initVideo(item.url);
    },

    scrollMid(span, $parent) {
      if (!span || !span.offset) return;
      let y =
        span.offset().top +
        $parent[0].scrollTop -
        $parent.offset().top -
        $parent.height() / 2;
      /*
      document
        .getElementsByClassName(parent)[0]
        .scrollTo(
          0,
          y
        );
        */
      $($parent).animate({ scrollTop: y }, 1000);
    },
  },
  mounted() {
    let self = this;

    this.initVideoPlayer();
    bus.$on("videoId", (mediaType, item, click, index, index2) => {
      if (click) this.show = 1;
      this.videoId = item.vid;
      this.title = item.title;
      this.item = item;
      this.videoIndex = index;
      this.subIndex = index2;
      this.mediaType = mediaType;
      if (this.mediaType == 0) {
        if (this.player) this.player.pause();
        this.url = this.$refs.audio.src = this.videoId;
        this.$refs.audio.play();
      } else {
        this.$refs.audio && this.$refs.audio.pause();

        this.loadVideo(item, mediaType).catch((e) => {
          console.error(e);
          this.end();
        });
      }
    });
    bus.$on("videos", (videos) => {
      this.videos = videos;
    });
    bus.$on("togglePlay", () => {
      if (this.mediaType == 2) {
        if (this.playing) this.$refs.audio.pause();
        else this.$refs.audio.play();
      } else {
        if (this.playing) this.player.pause();
        else this.player.play();
      }
    });

    bus.$on("showPlayer", () => {
      this.show = !this.show;
    });

    $(window).on("resize", function () {
      self.ajustTextHeight();
    });
  },

  watch: {
    isAutoScroll() {
      this.scroll();
    },
    show(n) {
      if (!n) {
        if (this.mediaType == 1)
          setTimeout(() => {
            this.setQuality(0);
          }, 1000);
      } else {
        setTimeout(() => {
          $(window).resize();
        }, 100);
      }
    },
  },
};
</script>

<style scoped>
.video-js ::cue {
  font-size: 1.5em;
  width: 90%;
}
video::cue(u),
.video-js >>> .vjs-text-track-cue u {
  color: lightpink;
}
video::cue(i),
.video-js >>> .vjs-text-track-cue i {
  color: lightblue;
}
.video-js >>> .vjs-loading-spinner {
  font-size: 2.5em;
  width: 2em;
  height: 2em;
  border-radius: 1em;
  margin-top: -1em;
  margin-left: -1.5em;
}

.video-js >>> .vjs-big-play-button {
  font-size: 3em;
  line-height: 42px !important;
  height: 50px !important;
  width: 50px !important;
  position: absolute !important;
  left: 50% !important;
  top: 50% !important;
  margin-top: -25px !important;
  margin-left: -25px !important;
  padding: 0;
  cursor: pointer;
  opacity: 1;
  border: 0.06666em solid #fff;
  background-color: #2b333f;
  background-color: rgba(43, 51, 63, 0.7);
  border-radius: 50% !important;
  -webkit-transition: all 0.4s;
  transition: all 0.4s;
}
.vjs-paused .vjs-big-play-button,
.vjs-paused.vjs-has-started >>> .vjs-big-play-button {
  display: block !important;
}
.myVideo-dimensions {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
}
.vjs-poster {
  background-size: 100% 100% !important;
}
.vjs-paused .vjs-big-play-button,
.vjs-paused.vjs-has-started .vjs-big-play-button {
  display: block;
}

.top {
  position: fixed;
  background-color: white;
  overflow: scroll;
  width: 100%;
  top: 0;
  right: 0;
  left: 0;
  bottom: 48px;
  overflow: hidden;
  z-index: 10000;
}

@media screen and (min-width: 750px) {
  .top {
    max-width: 800px;
  }
}

.videoCon {
  width: 100%;
}
.text {
  word-break: break-all;
  position: absolute;
  width: 100%;
  bottom: 0px;
  display: block;
  font-size: 24px;
  line-height: 1.5em;
  color: #333;
  word-break: break-word;
  word-wrap: break-word;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;

  padding: 10px 20px 10px 10px;
  overflow: overlay;
  box-sizing: border-box;
  text-align: left;
}
.text >>> .cur {
  color: green;
}
#bts {
  text-align: right;
}
#bts a {
  display: inline-block;
  margin: 0px 0px 5px 5px;
  padding: 6px 8px;
  font-size: 14px;
  outline: none;
  text-align: center;
  line-height: 1em;
  cursor: pointer;
  color: white;
  background-color: rgba(0, 64, 156, 0.8);
  user-select: none;
}
#bts input {
  margin: 0;
  padding: 0;
}
#bts a.enable {
  color: red;
}
</style>

