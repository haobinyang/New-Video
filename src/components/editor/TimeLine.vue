<template>
  <div class="container">
    <div class="drop-zone-list">
      <div v-for="(item, index) in displayList" 
        :key="item ? item.id : index"
        class="drop-zone"
      >
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from '../../utils/event-bus';

const DRAG_STATUS = {
  UNKNOWN: -1,
  DRAGGING: 0,
  DRAG_OVER: 1
};

export default {
  data() {
    return {
      list: [], // 实际存储的数据
      overIndex: -1,
      status: DRAG_STATUS.UNKNOWN
    };
  },
  computed: {
    displayList() {
      const list = this.list;
      if (!list?.length) {
        return [undefined];
      }
      return [undefined].concat(Array(list.length + 1).fill(undefined)).map((item, index) => {
        if (index % 2 === 1) {
          return list[index % 2 - 1];
        }
        return item;
      });
    }
  },
  methods: {
    mouseOver(index) { // 拖拽的元素经过drop-zone时触发
      return index;
    },
    findOverElementIndex(element) {
      const dropZones = Array.from(document.querySelectorAll('.drop-zone'));
      return dropZones.indexOf(element);
    }
  },
  mounted() {
    EventBus.$on('dragOver', (element) => {
      this.status = DRAG_STATUS.DRAG_OVER;
      this.overIndex = this.findOverElementIndex(element);
    });
    EventBus.$on('dragging', () => {
      this.status = DRAG_STATUS.DRAGGING;
    });
  }
}
</script>

<style scoped>
.container {
  background-color: #17171e;
  padding: 35px 18px 15px;
  height: 450px;
  box-sizing: border-box;
}
.drop-zone-list {
}
.drop-zone {
  border-radius: 5px;
  /* overflow: hidden; */
  border: none;
  transition: all 0.5s;
  margin: 4px 0;
  position: relative;
}
.drop-zone:nth-child(even) { /* 奇数 */
  height: 30px;
  background-color: #1c1d26;
}
.drop-zone:nth-child(odd) { /* 偶数 */
  height: 0;
}
.drop-zone:hover {
  background-color: #1c1d26;
  height: 30px;
}
.drop-zone:first-child {
  height: 10px;
}
.drop-zone:last-child {
  height: 10px;
}
.drop-zone:only-child {
  border: 2px dashed rgb(60, 60, 72);
  height: 60px;
}
.drop-zone .draggable {
  height: 100px;
  display: inline-block;
  margin: 0;
  line-height: 30px;
  transition: all 0.5s;
}
.drop-zone .element {
  border-radius: 5px;
  position: absolute;
  top: 0;
  border: none;
  background-color: rgb(118, 106, 246);
  height: 30px;
  line-height: 30px;
  padding-left: 15px;
  color: white;
  overflow: hidden;
  transition: width 0.3s, background-color 0.3s, box-shadow 0.3s;
  user-select: none;
  -webkit-user-select: none;
  cursor: default;
}
.drop-zone .element:hover {
  background-color: rgb(141, 127, 246);
}
.drop-zone .element.active {
  box-shadow: rgb(69 211 174) 0px 0px 0px 2px inset;
  cursor: move;
}
</style>