
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
    }
  }

};
export default mixin;
