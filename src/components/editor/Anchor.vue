<template>
  <div class="anchor" :style="{ left: left }">
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 1.16667V7.67376C0 7.98888 0.127471 8.2906 0.353409 8.51026L5.18674 13.2093C5.63955 13.6496 6.36045 13.6496 6.81326 13.2093L11.6466 8.51026C11.8725 8.2906 12 7.98888 12 7.67376V1.16667C12 0.522335 11.4777 0 10.8333 0H1.16667C0.522335 0 0 0.522334 0 1.16667Z" fill="white"></path></svg>
  </div>
</template>

<script>
import { WidthPerSecond } from '../../constants/common';
export default {
  props: ['currentTime'],
  computed: {
    left() {
      return `${this.currentTime / 1000 * WidthPerSecond + 18}px`;
    }
  }
}
</script>

<style scoped>
.anchor {
  position: absolute;
  top: 10px;
  bottom: 10px;
  width: 2px;
  pointer-events: none;
  z-index: 4;
}
.anchor svg {
  transform: translateX(-5px);
}
.anchor::after {
  position: absolute;
  top: 17px;
  bottom: 0px;
  content: "";
  width: 2px;
  transform: translateX(-50%);
  background: rgb(255, 255, 255);
  box-shadow: rgb(28 28 40 / 50%) 0px 5px 15px, rgb(28 28 40 / 20%) 0px 5px 35px, rgb(28 28 40 / 10%) 0px 5px 45px;
}
</style>