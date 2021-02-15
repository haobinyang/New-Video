/**
 * 连结两个视频或者图片
 * 两个视频都设置needRender为false，如果player的currentTime在第一个视频，则调用第一个视频的setCurrentTime，否则调用第二个的，如果是图片则不需要调用
 */
import { Element } from './element.js';
import { Shader } from './shader.js';
import effects from '../effects/index.js';
import transitions from '../transitions/index.js';

export class Transition extends Element {
  constructor(config, player) {
    super(config, player);
    Promise.resolve().then(() => {
      const { player, fromId, toId } = this;
      this.from = player.getElementById(fromId);
      this.to = player.getElementById(toId);
      this.initRender();
    });
  }

  // 由于不知道关联视频或者图片的初始状态，所以需要等到渲染的时候再初始化
  initRender() {
    const { fromId, toId, transition, player } = this;
    const { width, height } = player;
    const {
      width: fromWidth, 
      height: fromHeight,
      effect: fromEffect,
      texture: fromTexture,
      fitType: fromFitType
    } = player.getElementById(fromId);
    const {
      width: toWidth, 
      height: toHeight,
      effect: toEffect,
      texture: toTexture,
      fitType: toFitType
    } = player.getElementById(toId);
    const { uniforms: fromUniforms, fragment: fromFragment } = effects(fromEffect);
    const { uniforms: toUniforms, fragment: toFragment } = effects(toEffect);
    const { uniforms: transitionUniforms, fragment: transitionFragment } = transitions(transition);
    // eslint-disable-next-line no-undef
    this.geometry = new THREE.PlaneGeometry(width, height);
    // eslint-disable-next-line no-undef
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        from: { value: fromTexture },
        to: { value: toTexture },
        progress: { value: 0 },
        ratio: { value: width / height },
        ...fromUniforms,
        ...toUniforms,
        ...transitionUniforms
      },
      vertexShader: Shader.GetVertex(),
      fragmentShader: Shader.GetTransitionFragment({
        fromFitType,
        fromEffect: fromFragment('from', 'fromEffect'),
        fromRatio: fromWidth / fromHeight,
        toFitType,
        toEffect: toFragment('to', 'toEffect'),
        toRatio: toWidth / toHeight,
        transition: transitionFragment
      }),
      uniformsNeedUpdate: true
    });
    this.material.transparent = true;
    // eslint-disable-next-line no-undef
    this.sprite = new THREE.Mesh(this.geometry, this.material);
  }

  onCurrentTimeChange() {
    if (this.player.isInRange(this)) { // 在有效的播放范围内
      this.addToPainter();
      // this.from.hide();
      // this.to.hide();
      this.render();
    } else {
      this.removeFromPainter();
      // this.from.show();
      // this.to.show();
    }
  }

  render() {
    const { startTime, endTime, player: { currentTime }, from } = this;
    const progress = (currentTime - startTime) / (endTime - startTime);
    this.sprite.position.z = from.zIndex + 1;
    this.material.uniforms.progress.value = progress;
  }
 }