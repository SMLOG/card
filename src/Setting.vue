<template>
  <div>
    <div>
      <a style="cursor: pointer" @click="refreshCache()">Refresh Cache</a>
    </div>

    <div>
      <span
        >Sound YD:<a style="cursor: pointer" @click="toggleSound()">{{
          config.sound ? "ON" : "OFF"
        }}</a></span
      >
    </div>

    <div>
      <div>Enable Language:</div>
      <div v-for="lan in config.langs || []" :key="lan">
          {{ lan }}
        <input :disabled="local.lock"
          type="checkbox"
          v-model="config.enable[lan]"
          @change="save()" 
        />

      </div>
    </div>
    <div>passNum:<input v-model.number="config._passNum" min="1" @blur="save(config)"  :disabled="local.lock" /></div>
    <div>

      <span>Estimate Url:</span>
      <input v-model="config._estUrl"   @change="save()" />
    </div>

    <div>
      <a @click="openGame(config.gameTime1, 1)" style="cursor: pointer"
        >Skip Test</a
      >
    </div>
    <div>
      <a @click="updatePass()" style="cursor: pointer"
        >Update Pass</a
      >
    </div>
    <div>
      <a @click="toggleLock">Locked:</a>{{ local.lock?"Y":"N" }}
    </div>
    <div>
      <a @click="saveLocal({grid:!local.grid})">Grid:</a>{{ local.grid?"Y":"N" }}
    </div>
    <div>
      <a @click="saveLocal({maskWord:!local.maskWord})">maskWord:</a>{{ local.maskWord?"Y":"N" }}
    </div>
    
    <div>
      Mask Color:<input type="color"  v-model="maskColor">
    </div>
    <div>
      Next Speed: <input type="range" min="1" max="5" step="1"  v-model.number="nextSpeed"> {{ nextSpeed }}
    </div>
  </div>
</template>
<script>

export default {
  data() {
    return {
    };
  },

  mounted() {},
  methods: {
    save(config){
      if(!this.lock)
      this.saveConfig(config);
    },
    toggleLock(){
      if(!this.local.pass || prompt("Current password") == this.local.pass){
        this.saveLocal({lock:!this.local.lock})
      }
    },
    updatePass(){
      if(!this.local.pass || prompt("Current password") == this.local.pass){
        this.saveLocal({pass:prompt("New password")})

        alert('ok')
      }
      
    },
    toggleSound() {
      this.config.sound = this.config.sound ? "" : "YD";
      this.save();
    },

    refreshCache() {
      if ("serviceWorker" in navigator) {
        caches.keys().then(function (cacheNames) {
          cacheNames.forEach(function (cacheName) {
            if (confirm("delete cache " + cacheName)) caches.delete(cacheName);
          });
        });
      }
    },
    openGame(minus, uisngpwd) {
      this.$emit("openGame", minus, uisngpwd);
    },
  },

  computed: {

  },
  watch: {},
};
</script>
<style lang="scss" scoped>
.tools {
  text-align: left;
  user-select: none;
}
.tools > * {
  margin: 3px;
  color: white;
}
.tools > span {
  display: inline-block;
  cursor: pointer;
}
.red {
  color: red;
}
.green {
  color: lightgreen;
}
label {
  display: inline-block;
  border-bottom: 1px solid white;
  margin-right: 5px;
}
</style>
