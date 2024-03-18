<template>
  <div style="display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;">
    <div id="topbts">
      <div style="display: flex;
justify-content: space-between;
width: 100%;">
        <span><font-awesome-icon icon="pen" fixed-width />
          <input type="range" min="1" max="20" step="1" v-model.number="penWidth">
        </span>
        <span><font-awesome-icon icon="magnifying-glass" fixed-width />
          <input type="range" min="1" max="10" step="1" v-model.number="scale">
        </span>
        <input type="color">
      </div>
    </div>
    <div style="flex-grow: 1;">
      <div id="container" ref="container" style="display: flex;overflow: auto;flex-wrap: wrap;">
        <div v-for="(w,i) in words" :key="i">
          <Hanzi :hanzi="w.w" @success="success(i,w)"/>
        </div>

      </div>
    </div>

    <div id="bts" style="width:100%;">
      <div style="    display: flex;
  justify-content: space-between;
  width: 100%;">
        <a id="playBtn" :class="{ selected: loopPlay == 2 }">
          <font-awesome-icon :icon="['fas', 'play']" fixed-width />
        </a>
        <a ref="maskBtn" @click="isMask = !isMask, loopPlay = 0" :class="{ selected: isMask }">
          <font-awesome-icon :icon="['fas', 'mask']" fixed-width />
        </a>
        <input v-model="inputText" ref="inputText" @focus="inputText = ''" style="width: 2rem;"
          @keyup.enter="$refs.inputText.blur()" />
        <a id="clearBtn" @click="loopPlay = 0; clear()">
          <font-awesome-icon :icon="['fas', 'eraser']" fixed-width />
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import Hanzi from './Hanzi.vue';

import * as OpenCC from 'opencc-js';
const converter = OpenCC.Converter({ from: 'cn', to: 'hk' });

/* eslint-disable */
export default {
  props: ['word', 'lan'],
  data() {
    return { isMask: 0, penWidth: 5, loopPlay: 0, inputText: '',bingo:0 ,words:[]};
  },
  components: { Hanzi },

  created() { },
  methods: {
    valid(){
      return this.bingo;
    },
    success(i){
      this.words[i].ok=1;
      if(this.words.filter(e=>!e.ok).length==0)
      {
        this.bingo=1;
        this.$emit('next');
      }

      
    },
    loadWord() {

      this.bingo=0;
      if (this.word) {
        
        const traditionalText = converter(this.word[this.lan]);
        this.words.length=0;
        this.words.push(...traditionalText.split('').map(e=>{return {w:e,ok:0}}));
      }

    },
    clear() {
    }
  },
  watch: {
    word: {
      deep: true,
      handler(value) {
        console.log(value)
        this.loadWord();

      }
    },
    inputText(value){
      if(value){
        const traditionalText = converter(value);
        this.words.length=0;
        this.words.push(...traditionalText.split('').map(e=>{return {w:e,ok:0}}));
      }else this.loadWord();

    }

  },
  beforeDestroy() {
  },
  mounted() {
    this.loadWord();

  },
  computed: {
  },
};
</script>

<style scoped>
button {
  font-size: 150%;
}

#topbts {
  top: 0;
  width: 100%;
  left: 0;
  right: 0;
}

#container {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  flex-grow: 1;
  height: 100%;
  width: 100%;


}

canvas {
  display: block;
  box-sizing: border-box;
  position: absolute;
}

* {
  user-select: none;
}

#bts {
  bottom: 0;
  z-index: 1;
  left: 0;
  background: #ddd;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

#bts a {
  font-size: 200%;
}

.selected {
  background-color: blue;
}

.spell {
  height: 100%;
  width: 100%;
  font-size: calc(min(25vw, 25vh));
  color: #eee;
  z-index: -1;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  word-break: break-all;
  background-color: transparent;
}

.rotate button {
  transform: rotate(-90deg);
  transform-origin: top left;
}

#svg1 {
  cursor: url(/cursor_brush.png) 14 59, crosshair;
}
</style>
