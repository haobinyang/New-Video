import { Element } from "./element.js";

export class Lottie extends Element {
  constructor(config, player) {
    super(config, player);
    this.initRender();
  }

  initRender() {
    const { player: { width, height } } = this;
    // eslint-disable-next-line no-undef
    this.geometry = new THREE.PlaneGeometry(width, height);
    // eslint-disable-next-line no-undef
    this.material = new THREE.MeshBasicMaterial();
    // eslint-disable-next-line no-undef
    const texture = new THREE.CanvasTexture();
    texture.animation = this.lottie;
    texture.image = this.lottie.container;
    // eslint-disable-next-line no-undef
    this.material.map = texture;
    this.material.transparent = true;
    // eslint-disable-next-line no-undef
    this.sprite = new THREE.Mesh(this.geometry, this.material);
  }

  async onCurrentTimeChange() {
    if (this.player.isInRange(this)) { // 在有效的播放范围内
      this.addToPainter();
      this.render();
    } else {
      this.removeFromPainter();
    }
  }

  async render() {
    const { player: { currentTime }, startTime } = this;
    this.lottie.goToAndStop(currentTime - startTime);
    this.material.map.needsUpdate = true;
    this.sprite.position.z = this.zIndex;
  }
}