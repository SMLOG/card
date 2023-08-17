<template>
  <div>
    <div v-show="show" ref="top" class="top">
      <div ref="videoCon" class="videoCon" v-show="1 == mediaType">
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
          :title="title"
        ></video>
      </div>
      <audio
        controls
        style="width: 100%"
        :title="title"
        ref="audio"
        v-show="mediaType == 2"
      />
      <div id="bts" ref="bts">
        <input v-if="false" style="width: 30px" type="text" v-model="nstream" />
        <a @click="toggleBg()" :class="{ enable: isBgAudioOn }"> bg</a>
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
      <div ref="text" class="text">
        <a :href="url">{{ title }}</a>
        <div v-html="text" ref="lynx"></div>
      </div>
    </div>
    <PlayerControllers :playing="playing" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import bus from "@/bus";
import { htmlTrans } from "@/HtmlTrans";

import PlayerControllers from "../components/PlayerControllers";
//import { vplayer } from "vue-hls-player";
import Vue from "vue";
import Video from "video.js";
Vue.prototype.$video = Video;
import "videojs-contrib-hls";
import "video.js/dist/video-js.css";
import "videojs-hls-quality-selector";
import "videojs-contrib-quality-levels";
import { service } from "@/service";
//import sounds from "@/../public/3s.mp3";
import $ from "jquery";
var mediaBaseUrl = "https://medium.ngtv.io/media/";
var VideoIOBaseUrl = "https://fave.api.cnn.io";

export default {
  data() {
    return {
      mediaType: 0,
      videoUrl: "",
      isBgAudioOn: 0,
      show: 0,
      url: "",
      nstream: 20,
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
        languages: ["zh"],
        language: "zh",
        triggerSelectedlanguagechange: 1,
        playbackRates: [0.6, 0.8, 1, 1.2, 1.5],
        nativeTextTracks: false,

        html5: {
          vhs: {
            overrideNative: false,
          },
          hls: {
            overrideNative: false,
          },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
          nativeTextTracks: true,
        },

        hlsQualitySelector: {
          displayCurrentQuality: true,
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
    scroll(clear) {
      clearInterval(this.scrollTimer);
      if (!this.isAutoScroll || clear) {
        return;
      }
      let $text = $(this.$refs.text);
      let $lynx = $(this.$refs.lynx);
      let lastPos = 0;
      this.scrollTimer = setInterval(() => {
        let st = 0;
        let h = $text.height();
        let s = $lynx.height() - h;
        let duration = this.player.duration();
        let v = s / duration;
        let delay = h / 2 / v;

        let pace = Math.ceil((3 * s) / (duration - delay - delay));
        if (
          this.player.currentTime() >= delay - 3 &&
          this.player.currentTime() != lastPos
        ) {
          st = $text.scrollTop() + pace;
          $text.animate({ scrollTop: st }, 100);
          lastPos = this.player.currentTime();
        }

        this.top = Math.floor(100 * Math.min(1, (1.0 * st) / s)) + "%";
        console.log(pace, st, s, duration);
      }, 3000);
    },

    markNewWords(t) {
      var dict = this.words;
      window.words = dict;
      this.text = htmlTrans(dict, t.replace(/\n/g, "<br />"));
    },
    scrollFunc() {
      var topDom = this.$refs.text;

      topDom.style.top =
        $(this.$refs.videoCon).height() + $(this.$refs.bts).height() + "px";
    },
    next() {
      console.log("next");
      this.end(0);
    },
    prev() {
      this.end(1);
    },
    end(reverse) {
      this.scroll(true);

      bus.$emit("end", this.videoId, reverse, this.videoIndex);
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
    initVideo(url) {
      this.videoUrl = url;
      let videoUrl = url;

      let q = 234;
      try {
        if (!this.show) {
          videoUrl =
            url.substring(0, url.lastIndexOf("/")) + "/media-1/stream.m3u8";
          let selector = this.player.hlsQualitySelector;

          selector.setQuality(q);
          q = selector.getCurrentQuality();
        }
      } catch (e) {
        console.error(e);
      }
      this.player.src([
        {
          src: videoUrl,
          type: "application/x-mpegURL",
        },
      ]);
      this.url = url;
      setTimeout(() => {
        try {
          let selector = this.player.hlsQualitySelector;

          selector.setQuality(selector.getCurrentQuality());
        } catch (e) {
          // console.error(e);
        }
      }, 1000);
      this.player.play();

      // Get all text tracks for the current player.

      this.scrollFunc();
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

    initVideoPlayer() {
      var self = this;
      if (!this.player) {
        $(this.$refs.top).scroll(function () {
          self.scrollFunc();
        });

        this.player = this.$video(
          this.$refs.videoPlayer,
          this.options,
          function () {
            this.hlsQualitySelector({
              displayCurrentQuality: true,
            });
          }
        );

        window.player = this.player;

        this.player.on("ended", () => {
          this.end();
        });
        this.player.on("error", () => {
          this.end();
        });

        this.player.on("pause", () => {
          clearInterval(this.scrollTimer);
          this.scroll(true);
          this.playing = 0;
        });

        /*this.player.on("texttrackchange", () => {
          let tracks = this.player.textTracks();
          for (var k = 0; k < tracks.length; k++) {
            let track = tracks[k];
            if (track.label == "My") track.mode = "showing";
            else track.mode = "disabled";
          }
        });*/

        //  this.player.one("loadedmetadata", () => {});

        this.player.on("play", () => {
          this.scroll();
          this.playing = 1;
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
    async loadVideo(videoId) {
      var url =
        VideoIOBaseUrl +
        "/v1/video?id=" +
        videoId +
        "&customer=cnn&edition=international&env=prod";
      this.text = ""; // r.toLowerCase();

      let resp = await fetch(url).then((resp) => resp.json());
      var mediumId = resp.mediumId;
      let raw = "";
      if (resp.closedCaptions && resp.closedCaptions.types) {
        var webvtt = resp.closedCaptions.types.filter(
          (e) => e.format == "webvtt" && e.track && e.track.url
        )[0].track.url;
        let r = await fetch(webvtt).then((r) => r.text());
        raw = r;
        if (r.match(/[A-Z]/g).length / r.replace(/[^a-z]/gi, "").length > 0.4) {
          let arr = r.split(/\n/g);
          raw = arr.shift() + "\n" + arr.join("\n").toLowerCase();
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
          var aa = r.split(/\n+/).filter((e) => e.indexOf(":") != 2);
          aa.shift();
          r = aa.join("\n");
        }

        r = r.replace(/\.[\s]+/g, ".\n");
        this.markNewWords(r);
      }

      //var subtitle = "V0VCVlRUDQoNCjENCjAwOjAwOjI4Ljg5NSAtLT4g...";
      //subtitle = window.atob(subtitle);
      raw = htmlTrans(this.words, raw, false);
      raw = $("<div>" + raw + "</div>").text();
      console.log(raw);
      var subBlob = new Blob([raw]);
      var subURL = URL.createObjectURL(subBlob);
      //subURL = "data:image/png;base64, V0VCVlRUCgogICAgICAxCiAgICAgIDAwOjAwOjAyLjUwMCAtLT4gMDA6MDA6MDUuMjUwCiAgICAgIEluc3RlYWQgb2YgbG9hZGluZyBhbiBleHRlcm5hbCAudnR0IGZpbGUsCiAgICAgIAogICAgICAyCiAgICAgIDAwOjAwOjA1LjI1MCAtLT4gMDA6MDA6MDkuNzUwCiAgICAgIFRoZSB3b3JrYXJvdW5kIGlzIHRvIGVtYmVkIGl0IGluc2lkZSBhIHNjcmlwdCB0YWcsCiAgICAgIAogICAgICAzCiAgICAgIDAwOjAwOjEwLjAwMSAtLT4gMDA6MDA6MTUuMDAwCiAgICAgIEFuZCB0aGVuIHBhcnNlIGl0IHVzaW5nIEphdmFTY3JpcHQKICAgICAgYW5kIGR5bmFtaWNhbGx5IGFkZCBpdCBhcyBhIG5ldyBUZXh0VHJhY2su";

      /**            id="subtitle"
            kind="subtitles"
            srclang="en"
            default
            label="English"
            ref="subtitle" */
      //this.player.reset();
      let tracks = this.player.textTracks();
      for (var d = 0; d < tracks.length; d++) {
        if (tracks[d].label == "My")
          this.player.removeRemoteTextTrack(tracks[d]);
      }
      this.player.addRemoteTextTrack(
        {
          kind: "captions",
          label: "My",
          mode: "showing",
          srclang: "zh",
          default: "true",
          src: subURL,
        },
        true
      );

      this.player.cache_.selectedLanguage = {
        enabled: true,
        language: "zh",
        kind: "captions",
      };

      var m3u8 =
        mediaBaseUrl +
        mediumId +
        "?appId=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6ImNubi1jbm4td2ViLTk1am96MCIsIm5ldHdvcmsiOiJjbm4iLCJwbGF0Zm9ybSI6IndlYiIsInByb2R1Y3QiOiJjbm4iLCJpYXQiOjE1MjQ2ODQwMzB9.Uw8riFJwARLjeE35ffMwSa-37RNxCcQUEp2pqwG9TvM";
      let r = await fetch(m3u8).then((r) => r.json());

      console.log(r);
      let deviceType = "";
      let agent = navigator.userAgent;
      deviceType = /ipad|tablet/i.test(agent)
        ? "tablet"
        : /mobile/i.test(agent)
        ? "phone"
        : "desktop";
      console.log(deviceType);
      this.initVideo(r.media[deviceType].unprotected.secureUrl);
    },
  },
  mounted() {
    this.initVideoPlayer();
    bus.$on("videoId", (mediaType, videoId, alias, click, index) => {
      if (click) this.show = 1;
      this.videoId = videoId;
      this.title = alias;
      this.videoIndex = index;
      this.mediaType = mediaType;
      console.error(this.mediaType);
      if (this.mediaType == 1) {
        this.$refs.audio.pause();
        this.loadVideo(this.videoId).catch(() => {
          this.end();
        });
      } else if (this.mediaType == 2) {
        if (this.player) this.player.pause();
        this.url = this.$refs.audio.src = videoId;
        this.title = alias;
        this.$refs.audio.play();
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

    let self = this;
    $(window).on("resize", function () {
      self.scrollFunc();
    });
  },

  watch: {
    isAutoScroll() {
      this.scroll();
    },
    show(n) {
      if (!n)
        if (this.mediaType == 1)
          setTimeout(() => {
            try {
              if (this.videoUrl) {
                let min = "/media-1/stream.m3u8";
                let url =
                  this.videoUrl.substring(0, this.videoUrl.lastIndexOf("/")) +
                  min;
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

              let selector = this.player.hlsQualitySelector;
              selector.setQuality(234);
            } catch (e) {
              //console.error(e);
            }
          }, 1000);
    },
  },
};
</script>

<style scoped>
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
