<template>
  <div class="editor">
    <side-menu />
    <div class="right">
      <div class="toolbar-container">
        <div class="toolbar">
          <div class="left"></div>
          <button class="export-button" @click="exportClick">
            导出
          </button>
        </div>
      </div>
      <div class="top">
        <assets />
        <player />
      </div>
      <time-line />
    </div>
  </div>
</template>

<script>
import SideMenu from './SideMenu';
import Player from './Player';
import TimeLine from './TimeLine';
import Assets from './Assets';
import { EventBus } from '../../utils/event-bus';

export default {
  components: {
    SideMenu, Player, TimeLine, Assets
  },
  methods: {
    exportClick() {
      EventBus.$emit('exportVideo');
    }
  }
}
</script>

<style>
body {
  overscroll-behavior-x: none;
}
* {
  user-select: none;
  -webkit-user-select: none;
}
::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}
::-webkit-scrollbar-corner {
  background-color: rgb(23, 23, 30);
}
::-webkit-scrollbar-thumb {
  background-color: rgb(60, 60, 72);
  box-shadow: none;
  border-radius: 95px;
}
::-webkit-scrollbar-track {
  background-color: rgb(28, 28, 38);
  box-shadow: none;
  content: "";
}
</style>

<style scoped>
.editor {
  height: 100vh;
  display: flex;
}
.top {
  display: flex;
  flex-direction: row;
}
.toolbar-container {
  height: 64px;
  padding: 24px 24px 0 24px;
}
.toolbar {
  display: flex;
}
.toolbar .left {
  flex: 1 1 0%;
}
.export-button {
  text-align: inherit;
  border: none;
  font-variant: inherit;
  font-stretch: inherit;
  line-height: inherit;
  font-family: inherit;
  cursor: pointer;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  color: white;
  background: rgb(102, 93, 195);
  border-radius: 20px;
  padding: 10px 30px;
  height: 40px;
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  transition: all 100ms ease-in-out 0s;
  outline: none;
}
.export-button:hover {
  background: rgb(125, 111, 205);
}
.right {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
}
</style>