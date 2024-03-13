
const mixin = {
  data() {
    return {

    };
  },
  methods: {
    saveConfig(config) {
      console.error(config)
        this.$store.commit('config', config)
    },
    saveItems(items) {
      this.$store.commit('items', items)
    },
    saveLocal(config) {
      console.error(config)
        this.$store.commit('local', config)
    },

  },
  computed: {
    mode:{
      get() {
        return  this.$store.state.local.mode;
      },
      set(newValue) {
        this.saveLocal({mode:newValue})
      },

      
    },
    local(){
      return  this.$store.state.local;
    },
    config() {
      return this.$store.state.config;
    },
    items() {
      return this.$store.state.items;
    },
    maskColor:{
      get() {
        return  this.$store.state.local.maskColor;
      },
      set(newValue) {
        this.saveLocal({maskColor:newValue})
      },
    },
    nextSpeed:{
      get() {
        return  this.$store.state.local.nextSpeed;
      },
      set(newValue) {
        this.saveLocal({nextSpeed:newValue})
      },
    }   , maskWord:{
      get() {
        return  this.$store.state.local.maskWord;
      },
      set(newValue) {
        this.saveLocal({maskWord:newValue})
      },
    }
     
  }

};
export default mixin;
