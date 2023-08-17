import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {

    config: Object.assign({
      enable: {},
      gameTime1: 0,
      gameTime2: 0,
      sound: 1,
    }, localStorage.config ? JSON.parse(localStorage.config) : {}),

  },
  mutations: {

    config(state, config) {
      state.config = Object.assign(state.config, config);
      localStorage.config = JSON.stringify(state.config);
    },

  },
  actions: {},
  modules: {},
  getters: {
  },
});
