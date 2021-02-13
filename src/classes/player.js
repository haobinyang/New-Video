import { ElementType } from '../constants/common.js';
import { Video } from './video.js';
import { Image } from './image.js';
import { Text } from './text.js';
import { Audio } from './audio.js';
import { Transition } from './transition.js';
import { Svg } from './svg.js';
import Painter from './painter.js';

function createElement(config, player) {
  switch (config.type) {
    case ElementType.VIDEO:
      return new Video(config, player);
    case ElementType.IMAGE:
      return new Image(config, player);
    case ElementType.TRANSITION:
      return new Transition(config, player);
    case ElementType.TEXT:
      return new Text(config, player);
    case ElementType.AUDIO:
      return new Audio(config, player);
    case ElementType.SVG:
      return new Svg(config, player);
  }
}

/**
 * 需要知道element在上一帧是否播放，才能精准调用pause，也就是要知道element的start和end事件，并且只调用一次
 * 视频或者音频只要在有效范围内都正常播放，转场只是隐藏sprite(不渲染)
 */

export default class Player {
  currentTime = 0;
  duration = 0;
  elements = [];
  playing = false;
  width = 0;
  height = 0;

  // 自动播放相关
  tickTime = -1; // 用于启动自动播放
  tickReq = 0;
  tickFun;

  onCurrentTimeChange;
  onEnd;

  constructor({ elements, width, height, onCurrentTimeChange, onEnd }) {
    this.width = width;
    this.height = height;
    this.painter = new Painter(width, height);
    this.tickFun = this.tick.bind(this);
    this.elements = (elements || []).map((element) => {
      return createElement(element, this);
    });
    this.updateDuration();
    this.onCurrentTimeChange = onCurrentTimeChange;
    this.onEnd = onEnd;
  }

  updateDuration() {
    this.elements.forEach(({ endTime }) => {
      if (endTime > this.duration) {
        this.duration = endTime;
      }
    });
  }

  isInRange(element) {
    const { startTime, endTime } = element;
    return startTime <= this.currentTime && endTime >= this.currentTime;
  }

  getElementById(id) {
    return this.elements.find(element => element.id === id);
  }

  addElement(element) {
    this.elements.push(createElement(element, this));
    this.updateDuration();
    this.pause();
  }

  removeElement(id) {
    const element = this.getElementById(id);
    element.removeFromPainter();
    this.elements.splice(this.elements.indexOf(element), 1);
    this.updateDuration();
    this.pause();
  }

  updateZIndex(id, zIndex) {
    const element = this.getElementById(id);
    element.updateZIndex(zIndex);
  }

  updateTimes(id, startTime, endTime) {
    const element = this.getElementById(id);
    element.startTime = startTime;
    element.endTime = endTime;
  }

  play() {
    if (!this.playing) {
      this.playing = true;
      this.req = requestAnimationFrame(this.tickFun);
    }
    this.renderFrame(false);
    this.tickTime = performance.now();
  }

  tick(time) {
    const interval = Math.ceil(time - this.tickTime);
    if (this.currentTime + interval >= this.duration) {
      this.currentTime = this.duration;
      this.renderFrame(false);
      this.pause();
      this.onEnd?.();
    } else {
      this.currentTime += interval;
      this.renderFrame(false);
      this.tickTime = time;
      this.tickReq = requestAnimationFrame(this.tickFun);
    }
  }

  pause() {
    this.tickTime = -1;
    this.playing = false;
    cancelAnimationFrame(this.tickReq);
    this.elements.forEach(element => {
      element.pause();
    });
  }

  // 点击进度条调用此方法
  setCurrentTime(currentTime) {
    this.pause();
    this.currentTime = currentTime;
    this.renderFrame(true);
  }

  // 渲染对应currentTime的帧
  async renderFrame(isManual) {
    const elements = this.elements;
    elements.sort((a, b) => {
      return b.zIndex - a.zIndex;
    });
    const len = this.elements.length;
    for (let i = 0; i < len; i++) {
      await elements[i].onCurrentTimeChange(isManual);
    }
    this.painter.render();
    this.onCurrentTimeChange?.(this.currentTime);
  }

  destroy() {
    this.elements.length = 0;
    this.elements = [];
  }

  attachTo(element) {
    element.appendChild(this.painter.getDomElement());
  }
}