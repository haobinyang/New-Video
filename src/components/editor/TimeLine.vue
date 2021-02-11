<template>
  <div class="container">
    <div class="inner-container">
      <div :style="{ width: scrollWidth + 'px' }" class="scroll-area" @click.capture="timeLineClick">
        <anchor :currentTime="currentTime"/>
        <div class="time-rule">
          <div v-for="(item, index) in Array(duration)"
            :key="index"
            class="one-second"
          >{{index}}</div>
        </div>
        <div class="drop-zone-list">
          <div v-for="(item, index) in list" 
            :key="item ? item.id : index"
            :class="getClasses(index)"
            @mouseover="dropZoneMouseOver"
          >
            <div v-for="subItem in item" 
              :key="subItem.id" 
              :class="['element', activeId === subItem.id ? 'active' : '']"
              :style="getElementStyle(subItem)"
              @click="elementClick(subItem.id)"
            >
              {{subItem.name}}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from '../../utils/event-bus';
import { WidthPerSecond, DRAG_STATUS } from '../../constants/common';
import { geneElementInfo, getDuration } from '../../utils/common';
import Anchor from './Anchor';

export default {
  components: { Anchor },
  data() {
    return {
      list: [[]], // 实际存储的数据
      overIndex: -1,
      status: DRAG_STATUS.UNKNOWN,

      // 放置位置
      offsetX: 0,
      offsetY: 0,

      currentTime: 0,

      activeId: ''
    };
  },
  computed: {
    duration() {
      return 60;
    },
    scrollWidth() {
      return this.duration * WidthPerSecond + 18 * 2;
    }
  },
  methods: {
    getClasses(itemIndex) {
      const { status, overIndex, list } = this;
      const result = ['drop-zone'];
      if (status === DRAG_STATUS.DRAGGING && !list[itemIndex].length) {
        result.push('prepare');
      } else if (status === DRAG_STATUS.DRAG_OVER) {
        if (overIndex === itemIndex) {
          result.push('hover');
        } else if (!list[itemIndex].length) {
          result.push('prepare');
        }
      }
      return result;
    },
    findOverElementIndex(element) {
      const dropZones = Array.from(document.querySelectorAll('.drop-zone'));
      return dropZones.indexOf(element);
    },
    async add(data, position) {
      const { overIndex, list, offsetX: x, offsetY: y } = this;
      const element = await geneElementInfo(data, position, { x, y });
      const item = list[overIndex];
      if (!item.length) {
        list.splice(overIndex, 1, [], [element], []);
      } else {
        item.push(element);
      }
      EventBus.$emit('addElement', list, element);
    },
    dropZoneMouseOver(e) {
      const { offsetX, offsetY } = e;
      this.offsetX = offsetX;
      this.offsetY = offsetY;
    },
    getElementStyle(element) {
      const { startTime, endTime } = element;
      return { 
        left: `${startTime / 1000 * WidthPerSecond}px`, 
        width: `${(endTime - startTime) / 1000 * WidthPerSecond}px`
      }
    },
    timeLineClick(e) {
      const rect = e.currentTarget.getBoundingClientRect(),
        offsetX = e.clientX - rect.left;
      const currentTime = (offsetX - 18) / WidthPerSecond * 1000;
      const duration = getDuration(this.list);
      this.currentTime = Math.min(Math.max(0, currentTime), duration);
      EventBus.$emit('setCurrentTimeToPlayer', this.currentTime);
    },
    elementClick(id) {
      this.activeId = id;
    }
  },
  mounted() {
    EventBus.$on('dragging', () => {
      this.status = DRAG_STATUS.DRAGGING;
      this.overIndex = -1;
    });
    EventBus.$on('dragOver', (element) => {
      this.status = DRAG_STATUS.DRAG_OVER;
      this.overIndex = this.findOverElementIndex(element);
    });
    EventBus.$on('dragCancelled', () => {
      this.status = DRAG_STATUS.UNKNOWN;
      this.overIndex = -1;
    });
    EventBus.$on('dragged', ({ data, position }) => {
      window.setTimeout(() => {
        this.add(data, position);
        this.status = DRAG_STATUS.UNKNOWN;
        this.overIndex = -1;
      }, 0);
    });
    EventBus.$on('setCurrentTimeToTimeLine', (currentTime) => {
      this.currentTime = currentTime;
    });
  }
}
</script>

<style scoped>
.inner-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: auto;
}
.scroll-area {
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
}
.time-rule {
  position: absolute;
  top: 10px;
  left: 18px;
  right: 18px;
  height: 20px;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
}
.one-second {
  width: 40px;
  height: 20px;
  border-top: 1px solid #30313a;
  border-left: 1px solid #30313a;
  font-size: 12px;
  color: #525257;
  padding: 5px 0 0 5px;
  box-sizing: border-box;
  text-align: left;
}
.one-second:last-child {
  border-right: 1px solid #30313a;
}
</style>

<style scoped>
.container {
  background-color: #17171e;
  padding: 35px 18px 15px;
  height: 450px;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  position: relative;
}
.drop-zone-list {
  flex-grow: 1;
  margin: 0 18px;
}
.drop-zone {
  border-radius: 5px;
  overflow: hidden;
  border: none;
  transition: all 0.5s;
  margin: 4px 0;
  position: relative;
}
.drop-zone:nth-child(even) {
  height: 30px;
  background-color: #1c1d26;
}
.drop-zone.hover {
  background-color: #1c1d26;
  height: 30px;
}
.drop-zone.prepare {
  height: 10px;
  background: transparent;
}
.drop-zone:only-child {
  border: 2px dashed rgb(60, 60, 72);
  height: 60px;
}
.drop-zone .element {
  border-radius: 5px;
  position: absolute;
  top: 0;
  border: none;
  background-color: rgb(118, 106, 246);
  height: 30px;
  line-height: 30px;
  padding: 0 15px;
  text-align: left;
  color: white;
  overflow: hidden;
  transition: width 0.3s, background-color 0.3s, box-shadow 0.3s;
  user-select: none;
  -webkit-user-select: none;
  cursor: default;
  width: 10px;
  text-overflow: ellipsis;
  box-sizing: border-box;
}
.drop-zone .element:hover {
  background-color: rgb(141, 127, 246);
}
.drop-zone .element.active {
  box-shadow: rgb(69 211 174) 0px 0px 0px 2px inset;
  cursor: move;
}
</style>