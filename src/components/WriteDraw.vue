<template>
  <div  style="display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;">
        <div id="topbts" >
        <div style="display: flex;
justify-content: space-between;
width: 100%;">
          <input type="range" min="1" max="20" step="1"  v-model="penWidth">
          <input type="color"   v-model="penColor">
        </div>
      </div>
    <div id="container">
      <div v-if="word&&maskWord&&false" class="spell">
        <div v-html="fmtWords()"></div>
      </div>
      <canvas id="canvasbg"></canvas>
      <canvas id="maskCanvas"></canvas>
      <canvas id="nextCanvas"></canvas>
      <canvas ref="canvas" id="canvas" style="z-index: 1;"></canvas>
    </div>

    <div id="bts" style="width:100%;">
      <div style="    display: flex;
  justify-content: space-between;
  width: 100%;">
        <button id="playBtn" @click="clickPaly()" :class="{selected:loopPlay==2}">Play</button>
        <button ref="maskBtn" @click="isMask=!isMask" :class="{selected:isMask}">Mask</button>
        <button id="clearBtn">Clear</button>
      </div>

    </div>

  </div>
</template>

<script>
import { createWorker } from 'tesseract.js';
export default {
  props: ['word', 'lan'],
  data() {
    return { isMask:0,penWidth:5,loopPlay:0 };
  },
  created() { },
  methods: {
    fmtWords(){
      let lan=this.lan;
      let word = this.word;
    return (lan == 'en' ? word[lan].split( /[^a-z]/gi):word[lan].split('')).join('<br />');
    },
    clickPaly(){
      this.loopPlay++;
      if(this.loopPlay>2)this.loopPlay=0;
    },
    async recognize(){
        const worker = await createWorker('chi_tra');
        const ret = await worker.recognize(this.$refs.canvas.toDataURL());
        console.log(ret.data.text);
        await worker.terminate();
    }
  },
  watch:{
    "$store.state.local.grid": {
      handler(value) {
        const canvasbg = document.getElementById("canvasbg");
        canvasbg.style.display=value?"":"none";
      },
    },

    
  },
  mounted() {

    const canvas = document.getElementById("canvas");
    const canvasbg = document.getElementById("canvasbg");
    const maskCanvas = document.getElementById("maskCanvas");
    const nextCanvas = document.getElementById("nextCanvas");
    
    const playBtn = document.getElementById("playBtn");
    const clearBtn = document.getElementById("clearBtn");
    const ctx = canvas.getContext("2d");
    const ctxbg = canvasbg.getContext("2d");
    const container = document.getElementById("container");


    let isRecording = false;
    let isPlaying = false;
    let recordedData = [];
    let isDrawing = false;
    let lastDrawTime = 0;
    let maskDatas=[];
    let  recordedDatas = [];

    let vue=this;

    document.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, { passive: false });

    playBtn.addEventListener("click", playAnimation);
    this.$refs.maskBtn.addEventListener("click", mask);
    clearBtn.addEventListener("click", reset);
    canvas.addEventListener("touchstart", startDrawing);
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("touchend", stopDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("touchmove", draw);



    function resizeCanvas() {
      nextCanvas.width=maskCanvas.width=canvasbg.width = canvas.width = container.offsetWidth;
      nextCanvas.height=maskCanvas.height=canvasbg.height = canvas.height = container.offsetHeight;
      
      if(vue.local.grid)
      drawGrid();
    }

    window.addEventListener("resize", resizeCanvas);

    // Initial resizing
    resizeCanvas();

    function reset() {
      recordedData.length = 0;
      clearCanvas(canvas);
      recordedDatas.length = 0;
    }

    async function mask(){

      maskDatas = recordedDatas.slice();
      console.log(maskDatas)
      clearCanvas(maskCanvas);
      await drawPaths(maskCanvas,maskDatas,0,vue.local.maskColor)
      reset();
    }
    async function animationNextPath(){
      clearCanvas(nextCanvas);
      if(maskDatas.length && recordedDatas.length<maskDatas.length){
        await drawPaths(nextCanvas,[maskDatas[recordedDatas.length]],true,0,vue.local.nextSpeed);
      }

      await sleep(500);
      await animationNextPath();

    }
    animationNextPath();
    async function playAnimation() {
      do{
    
      if (recordedDatas.length === 0) {
        return;
      }
      isPlaying = true;
      clearCanvas(canvas);
      if (!isPlaying) {
        return;
      }
    let r = await drawPaths(canvas,recordedDatas,true,0,vue.local.nextSpeed);
    if(r)return;
     await sleep(1000);
    }while(vue.loopPlay==2);
    vue.loopPlay=0;
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
      if(recordedData.length>1)
         recordedDatas.push(recordedData);
      recordedData = [];

      if(vue.isMask && recordedDatas.length == maskDatas.length){
        if(maskDatas.length==recordedDatas.length){
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
    async function drawPaths(canvas,recordedDatas,anim,color2,speech=1) {
      let ctx = canvas.getContext('2d');
      ctx.beginPath();
      let startId = canvas.startId = new Date().getTime();

      for(let r=0;r<recordedDatas.length;r++)
      for (let i = 0,paths=recordedDatas[r]; i < paths.length; i++) {
        const { x, y, t, color, width } = paths[i];
        console.log(x, y, t);
        if(canvas.startId!=startId)return startId

        if (t < 0) {
          ctx.beginPath();

          ctx.moveTo(x, y);
        } else {
          ctx.lineWidth = width;

          ctx.strokeStyle = color2 || color;
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        if(anim)
          await sleep(t*speech);
      }
    }



    // Function to draw the grid
    function drawGrid() {

      ctxbg.strokeStyle = "#aaa";
      ctxbg.lineWidth = 1;
      const lineSpacing = 40; // 调整每行的间距


      ctx.lineWidth = 1;

      let cyh = lineSpacing;
      let cd = 1;
      while (cd) {

        for (let i = 1; i <= 4; i++) {

          cyh += lineSpacing;
          if (cyh > canvasbg.height) return;
          ctxbg.beginPath();
          ctxbg.moveTo(0, cyh);
          ctxbg.lineTo(canvasbg.width, cyh);
          ctxbg.stroke();

        }
        cyh += lineSpacing;
      }

    }


  },
  computed: {
    penColor:{
      get() {
        return  this.$store.state.local.penColor;
      },
      set(newValue) {
        this.saveLocal({penColor:newValue});
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
}
.selected{background-color: blue;}
.spell{
  height: 100%;
     width: 100%; 
    font-size: calc(min(25vw, 25vh));
    color:#eee;
    z-index:-1;
    position: absolute;
    display: flex;
    align-items: center;
  justify-content: center;
  text-align: center;
  word-break: break-all;
  background-color: transparent;
}
.rotate button{
  transform: rotate(-90deg);
    transform-origin: top left;
}
</style>
