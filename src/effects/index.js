import { EffectType } from '../constants/common.js';
import { noEffect } from './no_effect.js';
import { gray } from './gray.js';

const effectMap = Object.freeze({
  [EffectType.NO_EFFECT]: noEffect,
  [EffectType.GRAY]: gray
});

export default function effects(type) {
  return effectMap[type]();
}