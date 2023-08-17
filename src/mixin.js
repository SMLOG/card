
const mixin = {
  data() {
    return {

    };
  },
  methods: {
    saveConfig() {
      this.$store.commit('config', {})
    }
  },
  computed: {

    config() {
      return this.$store.state.config;
    },
  }

};
export default mixin;
