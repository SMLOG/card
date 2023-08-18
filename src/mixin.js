
const mixin = {
  data() {
    return {

    };
  },
  methods: {
    saveConfig(config) {
      this.$store.commit('config', config)
    },
    saveItems(items) {
      this.$store.commit('items', items)
    }
  },
  computed: {

    config() {
      return this.$store.state.config;
    },
    items() {
      return this.$store.state.items;
    }
  }

};
export default mixin;
