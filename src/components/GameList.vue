<template>
  <div>
    <ul class="figure-list">
      <li v-for="(item, k) in config.games || []" :key="k">
        <div class="itemText">
          <span>{{ k + 1 }}.{{ item.name }}</span>
        </div>
        <figure
          class="animated"
          style="cursor: pointer"
          :class="{ tada: clickIndex == k }"
          @click="select(k, item)"
          :style="{
            backgroundImage: `url(${getImage(item)})`,
          }"
        ></figure>
      </li>
    </ul>
    <div
      v-if="showgame && item"
      style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        background: #fff;
        overflow: hidden;
      "
    >
      <iframe id="gamefr" v-if="showgame && item" :src="getLink(item)"></iframe>
    </div>
  </div>
</template>

<script>
export default {
  props: ["showgame"],
  data: () => {
    return {
      clickIndex: 0,
      item: null,
    };
  },
  mounted: function () {},

  deactivated() {},
  computed: {},
  methods: {
    getLink(item) {
      return item.url
        ? item.url
        : "games/" + (item.path || item.name) + "/index.html";
    },
    getImage(item) {
      if (item.imgUrl && item.imgUrl.indexOf("http") == 0) return item.imgUrl;
      return (
        "games/" + (item.path || item.name) + "/" + (item.imgUrl || "cover.png")
      );
    },
    select(k, item) {
      this.item = item;
      if (item._blank) {
        window.abcWindow = window.open("about:_blank", "abc");
        setTimeout(() => {
          window.abcWindow.location.href = this.getLink(item);
        }, 500);
      }
      this.$emit("select");
    },
  },
  watch: {},
};
</script>

<style scoped>
#gamefr {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 1000;
  left: 0;
  overflow: auto;
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
.figure-list li {
  list-style: none;
  width: calc(25% - 10px);
  margin: 0 5px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}
.figure-list li:last-child {
  margin-right: 0;
}
@media screen and (max-width: 500px) {
  .figure-list li {
    list-style: none;
    width: 48%;
    margin: 0 1% 1% 0;
  }
}
.figure-list figure:hover {
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
  border-radius: 4px;
}
.figure-list figure {
  border: 1px solid #000;
  position: relative;
  width: 100%;
  height: 0;
  overflow: hidden;
  margin: 0;
  padding-bottom: 100%; /* 关键就在这里 */
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  border-radius: 4px;
  margin: 0;
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

@keyframes tada {
  0% {
    transform: scaleX(1);
  }

  10%,
  20% {
    transform: scale3d(0.8, 0.8, 0.8) rotate(-3deg);
  }

  30%,
  50%,
  70%,
  90% {
    transform: scale3d(1.1, 1.1, 1.1) rotate(3deg);
  }

  40%,
  60%,
  80% {
    transform: scale3d(1.1, 1.1, 1.1) rotate(-3deg);
  }

  to {
    transform: scaleX(1);
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
  top: 1px;
  z-index: 1;
  left: 1px;
}
.itemText span {
  display: block;
  float: left;
  background: white;
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
</style>
