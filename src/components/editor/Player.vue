<template>
  <div class="container">
    <div class="player">
      <div class="video" ref="videoContainer"></div>
      <div class="controls">
        <div class="play-button" @click="playButtonClick">
          <svg v-if="!isPlaying" width="24" height="24" viewBox="0 0 24 24"><path d="M20.6074 11.3193L7.37206 3.13743C7.10118 2.97052 6.75265 2.95415 6.46676 3.09652C6.17912 3.23888 6 3.51624 6 3.81815V20.1818C6 20.4837 6.17912 20.7611 6.46588 20.9035C6.59647 20.9681 6.73941 21 6.88235 21C7.05353 21 7.22471 20.9534 7.37206 20.8625L20.6074 12.6807C20.8526 12.5285 21 12.2733 21 12C21 11.7267 20.8526 11.4714 20.6074 11.3193Z" fill="currentColor"></path></svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24"><rect x="14" y="4" width="6" height="16" rx="1" fill="currentColor"></rect><rect x="4" y="4" width="6" height="16" rx="1" fill="currentColor"></rect></svg>
        </div>
      </div>
    </div>
    <export-dialog v-if="exporting" :player="player" />
  </div>
</template>

<script>
import Player from '../../classes/player.js';
import { EventBus } from '../../utils/event-bus.js';
import ExportDialog from './Export'

export default {
  components: { ExportDialog },
  data() {
    return {
      player: null,
      isPlaying: false,
      exporting: false
    };
  },
  mounted() {
    const playerConfig = {
      width: 614,
      height: 345,
      elements: [],
      onCurrentTimeChange: (currentTime) => {
        EventBus.$emit('setCurrentTimeToTimeLine', currentTime);
      },
      onEnd: () => {
        this.isPlaying = false;
      }
    };
    this.player = new Player(playerConfig);
    this.player.setCurrentTime(0);
    this.player.attachTo(this.$refs['videoContainer']);

    EventBus.$on('addElement', (elements, element) => {
      this.add(element);
      this.update(elements);
      this.player.renderFrame(true);
    });
    EventBus.$on('removeElement', (id) => {
      this.remove(id);
      this.player.renderFrame(true);
    });
    EventBus.$on('setCurrentTimeToPlayer', (currentTime) => {
      this.player.setCurrentTime(currentTime);
    });
    EventBus.$on('exportVideo', () => {
      this.exporting = true;
    });
    EventBus.$on('exportClose', () => {
      this.exporting = false;
    });
  },
  methods: {
    add(element) {
      this.player.addElement(element);
    },
    remove(id) {
      this.player.removeElement(id);
    },
    update(elements) {
      elements.filter((element) => {
        return element.length > 0;
      }).forEach((elements, index) => {
        elements.forEach(({ id, startTime, endTime }) => {
          this.player.updateZIndex(id, index);
          this.player.updateTimes(id, startTime, endTime);
        });
      });
    },
    playButtonClick() {
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.player.play();
      } else {
        this.isPlaying = false;
        this.player.pause();
      }
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
}
.player {
  width: 614px;
  height: 345px;
  position: relative;
  top: -20px;
}
.video {
  width: 100%;
  height: 100%;
}
.controls {
  position: absolute;
  bottom: -50px;
  width: 100%;
  display: flex;
  justify-content: center;
}
.play-button {
  cursor: pointer;
  color: rgb(244, 244, 244);
}
.play-button:hover {
  color: white;
}
.cover {
  width: 100%;
  height: 100%;
}
</style>