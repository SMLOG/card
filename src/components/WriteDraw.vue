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
        <input type="color" v-model="penColor">
      </div>
    </div>
    <div style="flex-grow: 1;">
      <div id="container" ref="container">
        <div v-if="word && maskWord && false" class="spell">
          <div v-html="fmtWords()"></div>
        </div>
        <canvas ref="canvasbg"></canvas>
        <canvas id="maskCanvas"></canvas>
        <canvas id="nextCanvas"></canvas>
        <canvas ref="canvas" id="canvas" style="z-index: 1;"></canvas>
      </div>
    </div>

    <div id="bts" style="width:100%;">
      <div style="    display: flex;
  justify-content: space-between;
  width: 100%;">
        <a id="playBtn" @click="clickPaly()" :class="{ selected: loopPlay == 2 }">
          <font-awesome-icon :icon="['fas', 'play']" fixed-width />
        </a>

        <a ref="maskBtn" @click="isMask = !isMask, loopPlay = 0" :class="{ selected: isMask }">
          <font-awesome-icon :icon="['fas', 'mask']" fixed-width />
        </a>
        <input v-model="inputText" ref="inputText" @focus="inputText = ''" style="width: 2rem;" @blur="drawGrid" @keyup.enter="$refs.inputText.blur()" />
        <a id="clearBtn" @click="loopPlay = 0">
          <font-awesome-icon :icon="['fas', 'eraser']" fixed-width />
        </a>
      </div>

    </div>

  </div>
</template>

<script>
import { createWorker } from 'tesseract.js';

let canvas = document.getElementById("canvas");
let maskCanvas = document.getElementById("maskCanvas");
let nextCanvas = document.getElementById("nextCanvas");

let playBtn = document.getElementById("playBtn");
let clearBtn = document.getElementById("clearBtn");
let ctx = null;
let container = document.getElementById("container");


let isRecording = false;
let isPlaying = false;
let recordedData = [];
let isDrawing = false;
let lastDrawTime = 0;
let maskDatas = [];
let recordedDatas = [];

let disableTouchMove = function (event) {
      event.preventDefault();
    }

export default {
  props: ['word', 'lan'],
  data() {
    return { isMask: 0, penWidth: 5, loopPlay: 0, inputText: '' };
  },
  created() { },
  methods: {
    resizeCanvas() {
      Array.from(container.querySelectorAll('canvas')).map(e => {
        e.width = container.offsetWidth;
        e.height = container.offsetHeight
        console.log('container', container.offsetWidth, container.offsetHeight);

      });

      if (this.local.grid)
        this.drawGrid();
    },

    drawGrid() {
      let canvasbg = this.$refs.canvasbg;
      let ctxbg = this.$refs.canvasbg.getContext('2d');
      ctxbg.strokeStyle = "#ddd";
      ctxbg.lineWidth = 1;

      ctxbg.clearRect(0, 0, canvasbg.width, canvasbg.height);

      const lineSpacing = 40 * (1 + this.scale * 0.1); // 调整每行的间距
      console.log('lineSpacing', lineSpacing)
      ctxbg.setLineDash([10, 10]);

      let cy = canvasbg.height / 2;
      /*ctxbg.beginPath();
      ctxbg.moveTo(0, cy);
      ctxbg.lineTo(canvasbg.width, cy);
      ctxbg.stroke();*/




      cy -= 1.5 * lineSpacing;


      let nums = parseInt(cy / (3 * lineSpacing)) * 2 + 1;

      let start = cy -= parseInt(cy / (3 * lineSpacing)) * 3 * lineSpacing;
      let offsetLeft = 20;

      if(nums==1){
       
        nums = parseInt((canvasbg.height-2*offsetLeft)/(3*lineSpacing));
        start = (canvasbg.height - (3*lineSpacing) * nums)/2;
        cy = start;
      }

      for (let i = 0; i < nums; i++) {
        ctxbg.beginPath();
        ctxbg.setLineDash([]);
        //cy+=lineSpacing;
        ctxbg.moveTo(0, cy);
        ctxbg.lineTo(canvasbg.width, cy);
        ctxbg.stroke();

        cy += lineSpacing;
        ctxbg.beginPath();
        ctxbg.setLineDash([10, 10]);
        ctxbg.moveTo(0, cy);
        ctxbg.lineTo(canvasbg.width, cy);
        ctxbg.stroke();

        cy += lineSpacing;
        ctxbg.moveTo(0, cy);
        ctxbg.lineTo(canvasbg.width, cy);
        ctxbg.stroke();

        ctxbg.beginPath();
        ctxbg.setLineDash([]);
        cy += lineSpacing;
        ctxbg.moveTo(0, cy);
        ctxbg.lineTo(canvasbg.width, cy);
        ctxbg.stroke();
      }



      ctxbg.fillStyle = 'black';
      //ctxbg.lineWidth = 2;
      ctxbg.font = 2 * lineSpacing + 'px Arial';
      ctxbg.textBaseline = 'middle';
      //ctxbg.textAlign = 'center';
      ctxbg.fillStyle = "#ddd";
      let text = this.inputText || this.word&&this.word[this.lan];
      if(text){
        let chs=text.split('');
        console.log(chs);
        let lineNum=0;
        for(let i=1,npos=0;i<=chs.length;i++){
          let sub = text.substring(npos,i);
          if(ctxbg.measureText(sub).width+2*offsetLeft>canvasbg.width ){
            if(this.lan=='en'){
             sub = text.substring(npos,i-1)+"-";
              if(ctxbg.measureText(sub).width+2*offsetLeft<canvasbg.width){
                npos=i-1;
              }else{
                sub = text.substring(npos,i-2)+"-";
                npos=i-2;
              }


            }
            else  {
              sub = text.substring(npos,i-1);
              npos=i-1;
            }
            ctxbg.fillText(sub, offsetLeft, lineNum*3*lineSpacing +start + 1.5 * lineSpacing);

            lineNum++;
            i=npos;
            continue;
          }
          if(i==chs.length){
            ctxbg.fillText(text.substring(npos,i), offsetLeft,lineNum*3*lineSpacing+ start + 1.5 * lineSpacing);
          }

        }
      }

    },
    fmtWords() {
      let lan = this.lan;
      let word = this.word;
      return (lan == 'en' ? word[lan].split(/[^a-z]/gi) : word[lan].split('')).join('<br />');
    },
    clickPaly() {
      this.loopPlay++;
      if (this.loopPlay > 2) this.loopPlay = 0;
    },
    async recognize() {
      const worker = await createWorker('chi_tra');
      const ret = await worker.recognize(this.$refs.canvas.toDataURL());
      console.log(ret.data.text);
      await worker.terminate();
    },
    valid(){
      return recordedDatas.length!=0;
    }
  },
  watch: {
    "$store.state.local.grid": {
      handler(value) {
        this.$refs.canvasbg.style.display = value ? "" : "none";
      },
    },
    scale: {
      handler(value) {
        console.log(value);
        this.drawGrid();
      }
    },
    word: {
      deep: true,
      handler(value) {
        console.log(value)
        this.inputText='';
        recordedDatas.length=0;
        maskDatas.length=0;
        this.resizeCanvas();
      }
    }

  },
  beforeDestroy(){
    document.removeEventListener('touchmove', disableTouchMove);
  },
  mounted() {

    canvas = document.getElementById("canvas");
    maskCanvas = document.getElementById("maskCanvas");
    nextCanvas = document.getElementById("nextCanvas");

    playBtn = document.getElementById("playBtn");
    clearBtn = document.getElementById("clearBtn");
    ctx = canvas.getContext("2d");
    container = document.getElementById("container");
    let vue = this;

    document.addEventListener('touchmove', disableTouchMove, { passive: false });

    playBtn.addEventListener("click", playAnimation);
    this.$refs.maskBtn.addEventListener("click", mask);
    clearBtn.addEventListener("click", reset);
    canvas.addEventListener("touchstart", startDrawing);
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("touchend", stopDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("touchmove", draw);

    window.addEventListener("resize", this.resizeCanvas);
    // Initial resizing
    this.resizeCanvas();

    function reset() {
      recordedData.length = 0;
      clearCanvas(canvas);
      recordedDatas.length = 0;
    }

    async function mask() {

      maskDatas = recordedDatas.slice();
      console.log(maskDatas)
      clearCanvas(maskCanvas);
      await drawPaths(maskCanvas, maskDatas, 0, vue.local.maskColor)
      reset();
    }
    async function animationNextPath() {
      clearCanvas(nextCanvas);
      if (maskDatas.length && recordedDatas.length < maskDatas.length) {
        await drawPaths(nextCanvas, [maskDatas[recordedDatas.length]], true, 0, vue.local.nextSpeed);
      }

      await sleep(500);
      await animationNextPath();

    }
    animationNextPath();
    async function playAnimation() {
      do {

        if (recordedDatas.length === 0) {
          return;
        }
        isPlaying = true;
        clearCanvas(canvas);
        if (!isPlaying) {
          return;
        }
        let r = await drawPaths(canvas, recordedDatas, true, 0, vue.local.nextSpeed);
        if (r) return;
        await sleep(1000);
      } while (vue.loopPlay == 2);
      vue.loopPlay = 0;
    }

    function getOffset(e) {
      if (e.touches) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0] || e.changedTouches[0];
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;
        return { offsetX, offsetY };
      } else {
        let { offsetX, offsetY } = e;
        return { offsetX, offsetY };
      }

    }
    function startDrawing(event) {
      console.log("down");
      isRecording = true;
      if (!isRecording) {
        return;
      }
      isDrawing = true;
      lastDrawTime = new Date();

      ctx.beginPath();

      let { offsetX, offsetY } = getOffset(event);

      ctx.moveTo(offsetX, offsetY);
      recordedData.push({ x: offsetX, y: offsetY, t: -1 });
    }

    function stopDrawing() {
      isDrawing = false;
      console.log("stop");
      if (recordedData.length > 1)
        recordedDatas.push(recordedData);
      recordedData = [];

      if (vue.isMask && recordedDatas.length == maskDatas.length) {
        if (maskDatas.length == recordedDatas.length) {
          vue.recognize();
        }
      }
    }

    function draw(event) {
      console.log("draw");

      if (!isRecording || !isDrawing) {
        return;
      }
      let { offsetX, offsetY } = getOffset(event);
      recordedData.push({
        x: offsetX,
        y: offsetY,
        t: new Date().getTime() - lastDrawTime.getTime(),
        color: ctx.strokeStyle,
        width: vue.penWidth,
      });
      ctx.strokeStyle = vue.penColor;
      ctx.lineWidth = vue.penWidth;
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
      lastDrawTime = new Date();
    }

    function clearCanvas(canvas) {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }

    async function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async function drawPaths(canvas, recordedDatas, anim, color2, speech = 1) {
      let ctx = canvas.getContext('2d');
      ctx.beginPath();
      let startId = canvas.startId = new Date().getTime();

      for (let r = 0; r < recordedDatas.length; r++)
        for (let i = 0, paths = recordedDatas[r]; i < paths.length; i++) {
          const { x, y, t, color, width } = paths[i];
          console.log(x, y, t);
          if (canvas.startId != startId) return startId

          if (t < 0) {
            ctx.beginPath();

            ctx.moveTo(x, y);
          } else {
            ctx.lineWidth = width;

            ctx.strokeStyle = color2 || color;
            ctx.lineTo(x, y);
            ctx.stroke();
          }
          if (anim)
            await sleep(t * speech);
        }
    }



    // Function to draw the grid



  },
  computed: {
    penColor: {
      get() {
        return this.$store.state.local.penColor;
      },
      set(newValue) {
        this.saveLocal({ penColor: newValue });
      },



    }

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

#bts a{
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
</style>
