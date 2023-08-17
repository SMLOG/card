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
        <input
          type="checkbox"
          v-model="config.enable[lan]"
          @change="saveConfig()"
        />
      </div>
    </div>

    <div>
      <a @click="openGame(config.gameTime1, 1)" style="cursor: pointer"
        >Change password</a
      >
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },

  mounted() {},
  methods: {
    toggleSound() {
      this.config.sound = this.config.sound ? "" : "YD";
      this.saveConfig();
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
    openGame(minus, changepw) {
      this.$emit("openGame", minus, changepw);
    },
  },

  computed: {},
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
