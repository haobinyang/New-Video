<template>
  <div class="container">
    <!-- <div @click="close" class="close-btn">关闭</div> -->
    <div class="player" ref="videoContainer"></div>
    <div style="position: absolute; left: 0; top: 0; z-index: 99;">
      <canvas id="canvas" width="640" height="360" style="width: 640px; height: 360px;"/>
    </div>
    <div class="tip">视频导出中...<br />根据视频的长度，导出时间可能需要几分钟或更长</div>
  </div>
</template>

<script>
import Player from '../../classes/player.js';
import { EventBus } from '../../utils/event-bus.js';
import { exportAsVideo } from '../../utils/media';
export default {
  props: ['player'],
  async mounted() {
    const playerConfig = {
      width: Math.ceil(640),
      height: Math.ceil(360),
      elements: this.player.elements
    };
    const player = new Player(playerConfig);
    player.setCurrentTime(0);
    player.attachTo(this.$refs['videoContainer']);
    await exportAsVideo(player);
    EventBus.$emit('exportClose');
  },
  methods: {
    close() {
      EventBus.$emit('exportClose');
    }
  }
}
</script>

<style scoped>
.container {
  background: #1c1d26;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
}
.player {
  width: 640px;
  height: 360px;
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
}
.tip {
  color: white;
  line-height: 24px;
  font-size: 14px;
  position: absolute;
  width: 640px;
  left: 50%;
  top: calc(40% + 190px);
  transform: translateX(-50%);
  text-align: left;
}
.close-btn {
  position: absolute;
  right: 20px;
  top: 20px;
  font-size: 14px;
  color: white;
}
</style>