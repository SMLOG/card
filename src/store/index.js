import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

let store = localStorage;
export default new Vuex.Store({
  state: {

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
