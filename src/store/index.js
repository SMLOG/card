import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

let store = localStorage;
export default new Vuex.Store({
  state: {
    local:Object.assign({
      mode:1,
      lock:0,
      pass:''

    },store.local ? JSON.parse(store.local) : {}),
    config: Object.assign({
      url: "https://smlog.github.io/data/dict.js",
      enable: {},
      gameTime1: 0,
      gameTime2: 0,
      sound: 1,
    }, store.config ? JSON.parse(store.config) : {}),
    items: store.items ? JSON.parse(store.items) : []
  },
  mutations: {
    local(state, local) {
      state.local = Object.assign(state.local, local);
      store.local = JSON.stringify(state.local)
      console.log(local)
    },
    config(state, config) {
      state.config = Object.assign(state.config, config);
      store.config = JSON.stringify(state.config);
    },
    items(state, items) {
      state.items.length = 0;
      state.items.push(...items);
      store.items = JSON.stringify(state.items);
    },

  },
  actions: {},
  modules: {},
  getters: {
  },
});
