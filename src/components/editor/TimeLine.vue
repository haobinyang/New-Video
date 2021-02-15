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
            <template v-for="(subItem, index2) in item">
              <div 
                :key="subItem.id" 
                :class="getElementClasses(subItem)"
                :style="getElementStyle(subItem)"
                @click="elementClick(subItem.id)"
              >
                {{subItem.name}}
              </div>
              <div v-if="isAdjacent(item, index2)"
                :class="getTransitionClasses('transition_' + subItem.id)"
                :key="'transition_' + subItem.id"
                :data-id="'transition_' + subItem.id"
                :style="getTransitionStyle(subItem)"
              >
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from '../../utils/event-bus';
import { WidthPerSecond, DRAG_STATUS, ElementType } from '../../constants/common';
import { 
  geneElementInfo, 
  getDuration, 
  solveTimeConfict, 
  getInsertIndex,
  geneTransitionInfo
} from '../../utils/common';
import Anchor from './Anchor';

export default {
  components: { Anchor },
  data() {
    return {
      list: [[]], // 实际存储的数据
      overIndex: -1,
      status: DRAG_STATUS.UNKNOWN,

      transitionId: '',

      // 放置位置
      offsetX: 0,
      offsetY: 0,

      currentTime: 0,

      activeId: null
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
    getTransitionClasses(transitionId) {
      const { status } = this;
      const result = ['transition-drop-zone'];
      if (status === DRAG_STATUS.TRANSITION_DRAGGING) {
        result.push('prepare');
      } else if (status === DRAG_STATUS.TRANSITION_DRAG_OVER && 
        transitionId === this.transitionId) {
        result.push('hover');
      }
      return result;
    },
    getTransitionStyle(element) {
      return { left: element.endTime / 1000 * WidthPerSecond + 'px' };
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
        const insertIndex = getInsertIndex(item, x);
        item.splice(insertIndex, 0, element);
        solveTimeConfict(item);
      }
      this.activeId = element.id;
      EventBus.$emit('addElement', list, element);
    },
    addTransition(data) {
      const { list, transitionId } = this;
      const element1Id = transitionId.replace('transition_', '');
      let element1, element2;
      for (let i = 0; i < list.length; i++) {
        const items = list[i];
        for (let j = 0; j < items.length; j++) {
          if (items[j].id === element1Id) {
            element1 = items[j];
            element2 = items[j + 1];
            const transition = geneTransitionInfo(data, element1, element2);
            items.splice(j + 1, 0, transition);
            EventBus.$emit('addElement', list, transition);
            this.activeId = transition.id;
            return;
          }
        }
      }
    },
    remove() {
      const { list } = this;
      for (let i = 0; i < list.length; i++) {
        const elements = list[i];
        for (let j = 0; j < elements.length; j++) {
          const element = elements[j];
          if (element.id === this.activeId) {
            if (elements[j + 1]?.type === ElementType.TRANSITION) {
              elements.splice(j, 2);
            } else if (elements[j - 1]?.type === ElementType.TRANSITION) {
              elements.splice(j - 1, 2);
            } else {
              elements.splice(j, 1);
            }
            if (!elements.length && list.length !== 1) {
              list.splice(i, 2);
            }
          }
        }
      }
    },
    dropZoneMouseOver(e) {
      const { offsetX, offsetY } = e;
      this.offsetX = offsetX;
      this.offsetY = offsetY;
    },
    getElementClasses(element) {
      const { activeId } = this;
      const result = ['element'];
      if (activeId === element.id) {
        result.push('active');
      }
      if (element.type === ElementType.TRANSITION) {
        result.push('transition');
      }
      return result;
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
    },
    isAdjacent(elements, index) {
      const element1 = elements[index];
      const element2 = elements[index + 1];
      if (
        element1 && 
        element2 &&
        [ElementType.VIDEO, ElementType.IMAGE].includes(element1.type) &&
        [ElementType.VIDEO, ElementType.IMAGE].includes(element2.type)
      ) {
        if (Math.abs(element1.endTime - element2.startTime) <= 10e-6) {
          return true;
        }
      }
      return false;
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
      }, 100);
    });

    // transition 
    EventBus.$on('transitionDragging', () => {
      this.status = DRAG_STATUS.TRANSITION_DRAGGING;
    });
    EventBus.$on('transitionDragOver', (element) => {
      this.status = DRAG_STATUS.TRANSITION_DRAG_OVER;
      this.transitionId = element.getAttribute('data-id');
    });
    EventBus.$on('transitionDragCancelled', () => {
      this.status = DRAG_STATUS.UNKNOWN;
    });
    EventBus.$on('transitionDragged', ({ data, position }) => {
      window.setTimeout(() => {
        this.addTransition(data);
        this.status = DRAG_STATUS.UNKNOWN;
      }, 100);
    });

    EventBus.$on('setCurrentTimeToTimeLine', (currentTime) => {
      this.currentTime = currentTime;
    });
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Backspace' && this.activeId) {
        EventBus.$emit('removeElement', this.activeId);
        this.remove();
      }
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
.drop-zone .element.transition {
  background: rgba(47, 166, 143, 1);
  opacity: 0.5;
  z-index: 3;
}

.transition-drop-zone {
  position: absolute;
  top: 0;
  height: 30px;
  transition: all 0.3s;
  box-sizing: border-box;
  z-index: 5;
  transform-origin: center center;
  width: 100px;
  transform: translateX(-50%);
  opacity: 0;
  background: rgba(47, 166, 143, 1);
  box-sizing: border-box;
}
.transition-drop-zone.prepare {
  opacity: 0.5;
}
.transition-drop-zone.hover {
  opacity: 1;
}
</style>