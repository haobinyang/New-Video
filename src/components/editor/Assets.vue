<template>
  <div class="container">
    <div class="card">
      <div class="frame">
        <div class="element" @mousedown="mouseDown" @mouseup="mouseUp">A</div>
      </div>
      <div class="title">This is title.</div>
    </div>
    <div class="card">
      <div class="frame">
        <div class="element" @mousedown="mouseDown" @mouseup="mouseUp">B</div>
      </div>
      <div class="title">This is title.</div>
    </div>
    <div class="card">
      <div class="frame">
        <div class="element" @mousedown="mouseDown" @mouseup="mouseUp">C</div>
      </div>
      <div class="title">This is title.</div>
    </div>
    <div class="card">
      <div class="frame">
        <div class="element" @mousedown="mouseDown" @mouseup="mouseUp">C</div>
      </div>
      <div class="title">This is title.</div>
    </div>
    <div class="card">
      <div class="frame">
        <div class="element" @mousedown="mouseDown" @mouseup="mouseUp">C</div>
      </div>
      <div class="title">This is title.</div>
    </div>
  </div>
</template>

<script>
import { EventBus } from '../../utils/event-bus';

export default {
  data() {
    return {
      element: null,
      shiftX: 0,
      shiftY: 0
    };
  },
  methods: {
    mouseDown(e) {
      const { target, pageX, pageY, clientX, clientY } = e;
      this.element = target;
      this.shiftX = clientX - this.element.getBoundingClientRect().left;
      this.shiftY = clientY - this.element.getBoundingClientRect().top;
      this.element.style.position = 'absolute';
      this.element.style.zIndex = 1000;
      this.moveAt(pageX, pageY);
      document.addEventListener('mousemove', this.mouseMove);
    },
    moveAt(pageX, pageY) {
      const { element, shiftX, shiftY } = this;
      element.style.left = pageX - shiftX + 'px';
      element.style.top = pageY - shiftY + 'px';
    },
    mouseMove(e) {
      this.moveAt(e.pageX, e.pageY);
      this.element.hidden = true;
      let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
      this.element.hidden = false;
      if (elemBelow) {
        if (elemBelow.closest('.drop-zone')) {
          EventBus.$emit('dragOver', elemBelow);
        } else {
          EventBus.$emit('dragging', elemBelow);
        }
      }
    },
    mouseUp() {
      const { element, mouseMove } = this;
      element.style.position = '';
      document.removeEventListener('mousemove', mouseMove);
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 24px;
  max-width: 40%;
  align-content: flex-start;
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
  width: 100%;
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
}
</style>