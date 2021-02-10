import { Element } from './element.js';
import { Shader } from './shader.js';
import effects from '../effects/index.js';

export class Image extends Element {
  originEffect = 0;

  constructor(config, player) {
    super(config, player);
    this.initRender();
  }

  initRender() {
    const { 
      width: imageWidth, 
      height: imageHeight,
      effect,
      texture,
      fitType,
      player: { width, height }
    } = this;
    const { uniforms, fragment } = effects(effect);
    this.originEffect = effect;
    this.geometry = new THREE.PlaneGeometry(width, height);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tex: { value: texture },
        ratio: { value: width / height },
        ...uniforms
      },
      vertexShader: Shader.GetVertex(),
      fragmentShader: Shader.GetEffectFragment({
        elementRatio: imageWidth / imageHeight,
        fitType: fitType,
        effect: fragment()
      }),
      uniformsNeedUpdate: true
    });
    this.material.transparent = true;
    this.sprite = new THREE.Mesh(this.geometry, this.material);
  }

  show() {
    this.sprite.visible = true;
  }

  hide() {
    this.sprite.visible = false;
  }

  onCurrentTimeChange() {
    if (this.player.isInRange(this)) { // 在有效的播放范围内
      this.addToPainter();
      this.render();
    } else {
      this.removeFromPainter();
    }
  }

  updateShader() {
    if (this.originEffect !== this.effect) { // 需要更新着色器
    }
  }

  render() {
    this.updateShader();
    this.sprite.position.z = this.zIndex;
  }
}