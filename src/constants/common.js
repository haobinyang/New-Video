export const CardWidth = 135;
export const WidthPerSecond = 40;

export const ElementType = Object.freeze({
  VIDEO: 'Video',
  AUDIO: 'Audio',
  IMAGE: 'Image',
  TEXT: 'Text',
  SVG: 'Svg',
  TRANSITION: 'Transition',
  LOTTIE: 'Lottie'
});

export const FitType = Object.freeze({
  FILL: 0, // 铺满整个播放器，不考虑长宽比
  CONTAIN: 1, // 保持长宽比，不会被裁剪，可能没法铺满整个播放器
  COVER: 2 // 铺满整个播放器，同时保持长宽比，可能存在裁剪
});

export const EffectType = Object.freeze({
  NO_EFFECT: 0,
  BLUR: 1,
  GRAY: 2
});

export const TransitionType = Object.freeze({
  MORPH: 0,
  DREAMY: 1,
  FADE: 2,
});

export const OverlayType = Object.freeze({
  PLUNGING: 0
});

export const DRAG_STATUS = Object.freeze({
  UNKNOWN: -1,
  DRAGGING: 0,
  DRAG_OVER: 1,
  TRANSITION_UNKNOWN: 2,
  TRANSITION_DRAGGING: 3,
  TRANSITION_DRAG_OVER: 4
});