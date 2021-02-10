<template>
  <div class="container">
    <div class="menu">
      <div v-for="item in menu" 
        :key="item.value" 
        :class="['menu-item', item.value === currentTab ? 'active' : '']"
        @click="itemClick(item.value)"
      >
        <div class="left"></div>
        <div class="icon" v-html="item.icon"></div>
        <span>{{item.label}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { EventBus } from '../../utils/event-bus'

const addIcon = `<svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" fill="currentColor"></path></svg>`;
const mediaIcon = `<svg width="24" height="24" viewBox="4 2 18 20"><g stroke="currentColor" stroke-width="1.6" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><path d="M12.813 4H7.125C6.228 4 5.5 4.716 5.5 5.6v12.8c0 .884.728 1.6 1.625 1.6h9.75c.897 0 1.625-.716 1.625-1.6V9.6L12.812 4z"></path><path d="M12.813 4v5.6H18.5"></path></g></svg>`;
const transitionIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" d="M0 2.4A2.4 2.4 0 012.4 0h10.8a2.4 2.4 0 012.4 2.4v10.8a2.4 2.4 0 01-2.4 2.4H2.4A2.4 2.4 0 010 13.2V2.4zM13.2 14H8V7.701l-5 3.572V4l5 3.571V1.6h5.2a.8.8 0 01.8.8v10.8a.8.8 0 01-.8.8zM8 7.636L13.09 4v7.273L8 7.636z" fill="currentColor"></path></svg>`;
const overlayIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="1.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></rect><path d="M7 15l7.818-7.772V15H7z" fill="currentColor"></path><path opacity="0.5" d="M1 15L15 1v14H1z" fill="currentColor"></path></svg>`;
const MENU = [
  { label: '添加', value: 'add', icon: addIcon },
  { label: '媒体', value: 'media', icon: mediaIcon },
  { label: '转场', value: 'transitions', icon: transitionIcon },
  { label: '覆盖', value: 'overlays', icon: overlayIcon }
];
export default {
  data() {
    return {
      menu: MENU,
      currentTab: MENU[0].value
    };
  },
  mounted() {
    EventBus.$emit('changeTab', this.currentTab);
    EventBus.$on('changeTab2Media', () => {
      this.currentTab = 'media';
    });
  },
  methods: {
    itemClick(value) {
      this.currentTab = value;
      EventBus.$emit('changeTab', value);
    }
  }
}
</script>

<style scoped>
.container {
  background: rgb(39, 39, 49);
  height: 100%;
  width: 60px;
  display: flex;
  flex-direction: column;
  -webkit-box-align: center;
  align-items: center;
  overflow: hidden;
  flex-shrink: 0;
}
.menu {
  padding-top: 50px;
}
.menu-item .left {
  display: none;
}
.menu-item.active .left {
  display: block;
  height: 100%;
  width: 2px;
  background: rgb(147, 130, 215);
  transition: all 200ms ease-in-out 0s;
  position: absolute;
  left: 0px;
}
.menu-item {
  position: relative;
  height: 60px;
  width: 60px;
  display: flex;
  flex-direction: column;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  border: none;
  background: transparent;
  font-size: 8px;
  transition: background 100ms ease-in-out 0s;
  cursor: pointer;
  padding: 6px 0;
}
.menu-item span {
  color: rgb(192, 192, 205);
  font-size: 12px;
  margin-top: 5px;
}
.menu .icon {
  display: flex;
  flex-direction: row;
  -webkit-box-align: center;
  align-items: center;
  opacity: 1;
  color: white;
  width: 16px;
  height: 16px;
}
.menu-item:hover span, .menu-item.active span {
  color: white;
}
</style>