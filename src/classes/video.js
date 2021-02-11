/**
 * 视频不能通过设置currentTime实现播放
 * 存在视频已播完，但是下一个currentTime仍在有效范围内，会再次播放的bug
 */
import { Element } from './element.js';
import { Shader } from './shader.js';
import effects from '../effects/index.js';

export class Video extends Element {
  originEffect = 0;

  constructor(config, player) {
    super(config, player);
    this.initRender();
    this.setPlaybackRate();   
  }

  initRender() {
    const { 
      width: videoWidth, 
      height: videoHeight,
      effect,
      texture,
      fitType,
      player: { width, height }
    } = this;
    const { uniforms, fragment } = effects(effect);
    this.originEffect = effect;
    // eslint-disable-next-line no-undef
    this.geometry = new THREE.PlaneGeometry(width, height);
    // eslint-disable-next-line no-undef
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tex: { value: texture },
        ratio: { value: width / height },
        ...uniforms
      },
      vertexShader: Shader.GetVertex(),
      fragmentShader: Shader.GetEffectFragment({
        elementRatio: videoWidth / videoHeight,
        fitType: fitType,
        effect: fragment()
      }),
      uniformsNeedUpdate: true
    });
    this.material.transparent = true;
    // eslint-disable-next-line no-undef
    this.sprite = new THREE.Mesh(this.geometry, this.material);
  }

  getPlaybackRate() {
    // duration 原始视频时长
    const { startTime, endTime, duration } = this;
    const customDuration = endTime - startTime;
    return duration / customDuration;
  }

  setPlaybackRate() {
    const video = this.video;
    const newPlaybackRate = this.getPlaybackRate();
    if (Math.abs(video.playbackRate - newPlaybackRate) >= 10e-6) {
      video.playbackRate = newPlaybackRate;
    }
  }

  play() {
    const video = this.video;
    if (video.paused) {
      video.play();
    }
  }

  pause() {
    super.pause();
    const video = this.video;
    if (!video.paused) {
      video.pause();
    }
  }

  show() {
    this.sprite.visible = true;
  }

  hide() {
    this.sprite.visible = false;
  }

  // 根据player的currentTime校正video的currentTime
  async correctVideoCurrentTime() {
    const { startTime, texture, player: { currentTime } } = this;
    const playbackRate = this.getPlaybackRate();
    const newCurrentTime = (currentTime - startTime) * playbackRate / 1000;
    await texture.setCurrentTime(newCurrentTime);
  }

  async onCurrentTimeChange(isManual) {
    if (this.player.isInRange(this)) { // 在有效的播放范围内
      if (isManual) {
        this.pause();
        await this.correctVideoCurrentTime();
      } else {
        this.play();
      }
      this.isStart = true;
      this.addToPainter();
      this.render();
    } else {
      if (this.isStart) { // 上一帧在播放
        this.isStart = false;
        this.pause();
        this.removeFromPainter();
      }
    }
  }

  updateShader() {
    if (this.originEffect !== this.effect) { // 需要更新着色器
      // console.log( 'update material');

      // // generate shaders on-demand!
      // let fs = new ShadersFragment(this._uniforms);
      // let vs = new ShadersVertex();
  
      // this._material.vertexShader = vs.compute();
      // this._material.fragmentShader = fs.compute();
      // this._material.needsUpdate = true;
    }
  }

  render() {
    this.updateShader();
    this.sprite.position.z = this.zIndex;
  }
}