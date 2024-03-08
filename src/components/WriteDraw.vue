<template>
  <div>
    <div id="container">
      <canvas id="canvasbg"></canvas>
      <canvas id="maskCanvas"></canvas>
      <canvas id="nextCanvas"></canvas>
      <canvas id="canvas" style="z-index: 1;"></canvas>
    </div>

    <div id="bts" style="width:100%;">
      <div style="    display: flex;
  justify-content: space-between;
  width: 100%;">
        <button id="playBtn">Play</button>
        <button id="maskBtn" @click="isMask=!isMask" :class="{selected:isMask}">Mask</button>
        <button id="grid">Grid</button>
        <button id="clearBtn">Clear</button>
      </div>
      <div id="topbts">
        <div style="    display: flex;
justify-content: space-between;
width: 100%;">
          <input type="range" id="lineWidthSlider" min="1" max="10" step="1" value="5">

          <input type="color" id="colorPicker" name="colorPicker">
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return { isMask:0 };
  },
  created() { },
  methods: {


  },
  mounted() {

    const canvas = document.getElementById("canvas");
    const canvasbg = document.getElementById("canvasbg");
    const maskCanvas = document.getElementById("maskCanvas");
    const nextCanvas = document.getElementById("nextCanvas");
    
    const playBtn = document.getElementById("playBtn");
    const maskBtn = document.getElementById("maskBtn");
    const clearBtn = document.getElementById("clearBtn");
    const ctx = canvas.getContext("2d");
    const ctxbg = canvasbg.getContext("2d");
    const colorPicker = document.getElementById("colorPicker");
    const container = document.getElementById("container");


    let isRecording = false;
    let isPlaying = false;
    let recordedData = [];
    let isDrawing = false;
    let lastDrawTime = 0;
    let maskDatas=[];
    let  recordedDatas = [];

    playBtn.addEventListener("click", playAnimation);
    maskBtn.addEventListener("click", mask);
    clearBtn.addEventListener("click", reset);
    canvas.addEventListener("touchstart", startDrawing);
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("touchend", stopDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("touchmove", draw);
    colorPicker.addEventListener("change", (e) => {
      const color = e.target.value;
      ctx.strokeStyle = color;
    });


    function resizeCanvas() {
      nextCanvas.width=maskCanvas.width=canvasbg.width = canvas.width = container.offsetWidth;
      nextCanvas.height=maskCanvas.height=canvasbg.height = canvas.height = container.offsetHeight;
      
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

    function mask(){

      maskDatas = recordedDatas.slice();
      console.log(maskDatas)
      clearCanvas(maskCanvas);
      drawPaths(maskCanvas,maskDatas,0,"#ddd")
      reset();
    }
    async function animationNextPath(){
      clearCanvas(nextCanvas);
      if(maskDatas.length && recordedDatas.length<maskDatas.length){
        await drawPaths(nextCanvas,[maskDatas[recordedDatas.length]],true,0,2);
      }
      await sleep(500);
      await animationNextPath();

    }
    animationNextPath();
    function playAnimation() {
      if (recordedDatas.length === 0) {
        return;
      }
      isPlaying = true;
      clearCanvas(canvas);
      if (!isPlaying) {
        return;
      }
      drawPaths(canvas,recordedDatas,true);
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
      recordedDatas.push(recordedData);
      recordedData = [];
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
        width: ctx.lineWidth,
      });
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

      for(let r=0;r<recordedDatas.length;r++)
      for (let i = 0,paths=recordedDatas[r]; i < paths.length; i++) {
        const { x, y, t, color, width } = paths[i];
        console.log(x, y, t);

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

    const slider = document.getElementById("lineWidthSlider");
    slider.addEventListener("input", handleLineWidthChange);

    function handleLineWidthChange() {
      const lineWidth = slider.value;
      ctx.lineWidth = lineWidth;
    }

    // Set default line width
    ctx.lineWidth = slider.value;

    const gridBtn = document.getElementById("grid");

    gridBtn.addEventListener("click", toggleGrid);


    let enableGrid = true;
    function toggleGrid() {
      console.log(enableGrid)
      enableGrid = !enableGrid;
      canvasbg.style.display = enableGrid ? '' : 'none';
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

  },
};
</script>

<style scoped>
button {
  font-size: 200%;
}

#topbts {
  position: fixed;
  top: 0;
  width: 100%;
  left: 0;
  right: 0;
  height: 20px;
}

#container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
}

canvas {
  height: 100%;
  width: 100%;
  display: block;
  box-sizing: border-box;
  position: absolute;
}

* {
  user-select: none;
}

#bts {
  position: fixed;
  bottom: 0;
  z-index: 1;
  left: 0;
}
.selected{background-color: blue;}
</style>
