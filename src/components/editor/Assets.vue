<template>
  <div class="container">
    <template v-if="currentTab === 'add'">
      <file-upload accept="video/*, image/png, image/jpeg, image/jpg" @input-file="inputFile">
        <div v-if="isTranscode" class="transcode-tip">
          转码中，请稍候...
        </div>
      </file-upload>
    </template>
    <template v-else>
      <div v-for="item in assets[currentTab]"
        :key="item.name"
        class="card"
      >
        <div class="frame">
          <div class="element" @mousedown="mouseDown($event, item)" @mouseup="mouseUp($event, item)">
            {{item.name}}
          </div>
        </div>
        <div class="title">{{item.name}}</div>
      </div>
    </template>
  </div>
</template>

<script>
import { EventBus } from '../../utils/event-bus';
import VueUploadComponent from 'vue-upload-component';
import { ElementType, TransitionType, OverlayType } from '../../constants/common';
import { getMediaInfo, extractVideoInMP4 } from '../../utils/media';

export default {
  components: { FileUpload: VueUploadComponent },
  data() {
    return {
      // 拖拽功能相关
      element: null,
      shiftX: 0,
      shiftY: 0,
      selectedAsset: null,

      isTranscode: false,

      // 资源展示相关
      assets: {
        media: [],
        transitions: [
          { name: 'Morph', value: TransitionType.MORPH, type: ElementType.TRANSITION, duration: 2000 },
          { name: 'Dreamy', value: TransitionType.DREAMY, type: ElementType.TRANSITION, duration: 2000 },
          { name: 'Fade', value: TransitionType.FADE, type: ElementType.TRANSITION, duration: 2000 }
        ],
        overlays: [
          { name: 'Plunging', value: OverlayType.PLUNGING, type: ElementType.SVG, duration: 2000 }
        ]
      },
      currentTab: 'add'
    };
  },
  mounted() {
    EventBus.$on('changeTab', (value) => {
      this.currentTab = value;
    });
  },
  methods: {
    async inputFile(file) {
      if (file) {
        const type = file.type.indexOf('image') > -1 ? ElementType.IMAGE : ElementType.VIDEO;
        let value;
        if (type === ElementType.VIDEO) {
          value = await file.file.arrayBuffer();
          const mediaInfo = await getMediaInfo(file, value);
          if (mediaInfo?.video?.compression !== 'h264') { // 视频需要转换为h264
            this.isTranscode = true;
            value = await extractVideoInMP4(file, value);
            this.isTranscode = false;
          }
        } else {
          value = file.file;
        }
        this.assets.media.push({
          name: file.name,
          value: value,
          type: type
        });
        this.currentTab = 'media';
        EventBus.$emit('changeTab2Media', 'media');
      }
    },
    mouseDown(e, element) {
      const { target, pageX, pageY, clientX, clientY } = e;
      this.element = target;
      this.shiftX = clientX - this.element.getBoundingClientRect().left;
      this.shiftY = clientY - this.element.getBoundingClientRect().top;
      this.element.style.position = 'absolute';
      this.element.style.zIndex = 1000;
      this.moveAt(pageX, pageY);
      this.selectedAsset = element;
      document.addEventListener('mousemove', this.mouseMove);
    },
    moveAt(pageX, pageY) {
      const { element, shiftX, shiftY } = this;
      element.style.left = pageX - shiftX + 'px';
      element.style.top = pageY - shiftY + 'px';
    },
    mouseMove(e) {
      const { pageX, pageY, clientX, clientY } = e;
      this.moveAt(pageX, pageY);
      this.element.hidden = true;
      const elemBelow = document.elementFromPoint(clientX, clientY);
      this.element.hidden = false;
      if (elemBelow) {
        if (this.selectedAsset.type === ElementType.TRANSITION) {
          if (elemBelow.closest('.transition-drop-zone')) {
            EventBus.$emit('transitionDragOver', elemBelow);
          } else {
            EventBus.$emit('transitionDragging', elemBelow);
          }
        } else {
          if (elemBelow.closest('.drop-zone')) {
            EventBus.$emit('dragOver', elemBelow);
          } else {
            EventBus.$emit('dragging', elemBelow);
          }
        }
      }
    },
    mouseUp(e, item) {
      const { element, mouseMove } = this;
      const { clientX, clientY, offsetX, offsetY } = e;
      this.element.hidden = true;
      const elemBelow = document.elementFromPoint(clientX, clientY);
      this.element.hidden = false;
      if (this.selectedAsset.type === ElementType.TRANSITION) {
        if (elemBelow && elemBelow.closest('.transition-drop-zone')) {
          EventBus.$emit('transitionDragged', {
            data: item,
            position: { x: offsetX, y: offsetY }
          });
        } else {
          EventBus.$emit('transitionDragCancelled');
        }
      } else {
        if (elemBelow && elemBelow.closest('.drop-zone')) {
          EventBus.$emit('dragged', {
            data: item,
            position: { x: offsetX, y: offsetY }
          });
        } else {
          EventBus.$emit('dragCancelled');
        }
      }
      element.style.position = '';
      document.removeEventListener('mousemove', mouseMove);
    }
  }
}
</script>

<style>
.file-uploads {
  width: 100px;
  height: 100px;
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  background: rgb(244, 244, 244);
  border-radius: 100%;
  overflow: visible !important;
}
.transcode-tip {
  position: absolute;
  width: 200px;
  color: white;
  text-align: center;
  top: 110px;
  left: -50px;
}
.file-uploads::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 4px;
  background: #1c1d26;
  border-radius: 2px;
}
.file-uploads::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 50px;
  width: 4px;
  background: #1c1d26;
  border-radius: 2px;
}
.file-uploads label {
  cursor: pointer;
}
.file-uploads:hover {
  background: white;
}
</style>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 24px;
  max-width: 40%;
  align-content: flex-start;
  min-width: 513px;
  box-sizing: border-box;
}
.card {
  width: 135px;
  max-width: 100%;
  margin-right: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  height: 95px;
}
.frame {
  width: 135px;
  height: 75px;
}
.title {
  color: #e5e6f1;
  font-size: .75rem;
  opacity: .5;
  padding: 4px 0;
  font-kerning: auto;
  text-rendering: optimizeLegibility;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}
.element {
  width: 135px;
  height: 75px;
  line-height: 75px;
  border-radius: 5px;
  background-color: #000;
  color: #fff;
  font-size: 18px;
  cursor: move;
  user-select: none;
  overflow: hidden;
}
</style>