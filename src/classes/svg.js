import { svgToCanvas } from "../svgs/index.js";
import { Element } from "./element.js";

export class Svg extends Element {
  constructor(config, player) {
    super(config, player);
    this.initCanvas();
    this.initRender();
  }

  initCanvas() {
    const { player: { width, height } } = this;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d');
  }

  initRender() {
    const { player: { width, height } } = this;
    this.geometry = new THREE.PlaneGeometry(width, height);
    this.material = new THREE.MeshBasicMaterial();
    this.material.map = new THREE.CanvasTexture(this.canvas);
    this.material.transparent = true;
    this.sprite = new THREE.Mesh(this.geometry, this.material);
  }

  async onCurrentTimeChange() {
    if (this.player.isInRange(this)) { // 在有效的播放范围内
      this.addToPainter();
      await this.render();
    } else {
      this.removeFromPainter();
    }
  }

  async render() {
    const { player: { width, height, currentTime }, func, startTime, endTime } = this;
    const svg = func({ startTime, endTime, currentTime, width, height });
    await svgToCanvas(svg, this.canvas, this.context);
    this.material.map.needsUpdate = true;
    this.sprite.position.z = this.zIndex;
  }
}