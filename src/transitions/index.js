import { TransitionType } from '../constants/common.js';
import { morph } from './morph.js';
import { dreamy } from './dreamy.js';
import { fade } from './fade.js';

const transitionMap = Object.freeze({
  [TransitionType.MORPH]: morph,
  [TransitionType.DREAMY]: dreamy,
  [TransitionType.FADE]: fade
});

export default function transitions(type) {
  return transitionMap[type]();
}