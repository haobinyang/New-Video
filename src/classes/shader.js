/**
 * 组装transition和effect
 */
import { EffectType, FitType, TransitionType } from '../constants/common.js';

function getColorFunction(fitType, ratio) {
  switch (fitType) {
    case FitType.FILL:
      return 'uv';
    case FitType.CONTAIN:
      return `.5+(uv-.5)*vec2(max(ratio/${ratio},1.),max(${ratio}/ratio,1.))`;
    case FitType.COVER:
      return `.5+(uv-.5)*vec2(min(ratio/${ratio},1.),min(${ratio}/ratio,1.))`;
  }
}

export class Shader {
  static GetVertex() {
    const vertexTemplate = `
      varying vec2 texCoords;
      void main() {
        texCoords = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    return vertexTemplate;
  }

  static GetFragment() {
    const fragTemplate = `
      varying vec2 texCoords;
      uniform sampler2D tex;
      void main() {
        gl_FragColor = texture2D(tex, texCoords);
      }
    `;
    return fragTemplate;
  }

  static GetEffectFragment({ 
    fitType = FitType.CONTAIN, 
    effect,
    elementRatio
  }) {
    const colorFun = getColorFunction(fitType, elementRatio);
    const fragTemplate = `
      varying vec2 texCoords;
      uniform float ratio;
      uniform sampler2D tex;
      ${effect}
      vec4 getColor(vec2 uv) {
        vec2 newUV = ${colorFun};
        vec4 color = effect(newUV);
        if(newUV.x>1. || newUV.x<0. || newUV.y>1. || newUV.y<0.){
          return vec4(0.,0.,0.,0.);
        }
        return color;
      }
      void main() {
        gl_FragColor = getColor(texCoords);
      }
    `;
    return fragTemplate;
  }

  static GetTransitionFragment({
    fromFitType = FitType.CONTAIN,
    fromEffect,
    fromRatio,
    toFitType = FitType.CONTAIN,
    toEffect,
    toRatio,
    transition
  }) {
    const fromColorFun = getColorFunction(fromFitType, fromRatio);
    const toColorFun = getColorFunction(toFitType, toRatio);
    const fragTemplate = `
      varying vec2 texCoords;
      uniform sampler2D from, to;
      uniform float fromRatio, toRatio;
      uniform float progress, ratio;
      ${fromEffect}
      ${toEffect}
      vec4 getFromColor(vec2 uv) {
        vec2 newUV = ${fromColorFun};
        vec4 color = fromEffect(newUV);
        if(newUV.x>1. || newUV.x<0. || newUV.y>1. || newUV.y<0.){
          return vec4(0.,0.,0.,0.);
        }
        return color;
      }
      vec4 getToColor(vec2 uv) {
        vec2 newUV = ${toColorFun};
        vec4 color = toEffect(newUV);
        if(newUV.x>1. || newUV.x<0. || newUV.y>1. || newUV.y<0.){
          return vec4(0.,0.,0.,0.);
        }
        return color;
      }
      ${transition}
      void main() {
        gl_FragColor = transition(texCoords);
      }
    `;
    return fragTemplate;
  }
}