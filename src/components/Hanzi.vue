<template>
  <div>
    <svg ref="svg" viewBox="0 0 207 207" style="width:207px;height:207px;" v-show="false"></svg>
    <svg ref="svg1" viewBox="0 0 207 207" style="width:207px;height:207px;"></svg>
  </div>
</template>
<script>
import * as OpenCC from 'opencc-js';
const converter = OpenCC.Converter({ from: 'cn', to: 'hk' });
import { initStroke } from './stroke';
export default {
  props: ['hanzi'],
  data() {
    return { bingo: 0 };
  },
  mounted() {
    this.loadHanzi();

  },
  methods: {
    loadHanzi() {

      this.bingo = 0;
      if (this.hanzi) {

        const traditionalText = converter(this.hanzi);
        initStroke(window.$,traditionalText, this.success,this.$refs.svg,this.$refs.svg1);
      }

    },

    success(value) {
      this.$emit('success',value);
    },

  },
  watch: {
    hanzi: {
      deep: true,
      handler(value) {
        console.log(value)
        this.loadHanzi();

      }
    }

  },

};
</script>

<style scoped>
#svg1 {
  cursor: url(/cursor_brush.png) 14 59, crosshair;
}
</style>
