import { EffectType, ElementType, FitType } from '../constants/common';
import { loadVideo, loadImage, loadSvg } from '../utils/tool';
import overlays from '../svgs/index';
import { WidthPerSecond, CardWidth } from '../constants/common';

export function uniqId() {
  return Math.random().toString(36).substr(2, 9);
}

export function sleep(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

export async function assetToElementData(data) {
  const { type, value, name, duration } = data;
  switch (type) {
    case ElementType.VIDEO:
      {
        const { video, texture } = await loadVideo(value);
        return {
          type: type,
          texture: texture,
          video: video,
          name: name,
          duration: video.duration * 1000,
          effect: EffectType.NO_EFFECT,
          width: video.videoWidth,
          height: video.videoHeight,
          fitType: FitType.COVER
        };
      }
    case ElementType.IMAGE:
      {
        const { image, texture } = await loadImage(value);
        return {
          type: type,
          texture: texture,
          width: image.naturalWidth,
          height: image.naturalHeight,
          effect: EffectType.NO_EFFECT,
          fitType: FitType.COVER,
          name: name,
          duration: 2000
        };
      }
    case ElementType.TRANSITION:
      return {
        type: type,
        transition: value,
        name: name,
        duration: duration
      };
    case ElementType.SVG:
      return {
        type: type,
        func: overlays(value),
        name: name,
        duration: duration
      };
    case ElementType.LOTTIE:
      return {
        type: type,
        name: name,
        lottie: value,
        duration: duration,
      };
  }
}

export function geneTransitionInfo(data, element1, element2) {
  const halfDuration = data.duration / 2;
  return {
    type: ElementType.TRANSITION,
    transition: data.value,
    id: uniqId(),
    fromId: element1.id,
    toId: element2.id,
    startTime: element1.endTime - halfDuration,
    endTime: element1.endTime + halfDuration,
    duration: data.duration,
    name: data.name
  };
}

export async function geneElementInfo(data, offsetInDragElement, offsetInDropZone) {
  const elementData = await assetToElementData(data);
  const duration = elementData.duration;
  const width = duration / 1000 * WidthPerSecond;
  const leftWidth = width * (offsetInDragElement.x / CardWidth);
  const startTime = Math.max(0, (offsetInDropZone.x - leftWidth) / WidthPerSecond * 1000);
  return {
    id: uniqId(),
    startTime: startTime,
    endTime: startTime + duration,
    ...elementData
  };
}

export function xToTime(x) {
  return x / WidthPerSecond * 1000;
}

export function getInsertIndex(elements, x) {
  const time = xToTime(x);
  if (time <= elements[0].startTime) {
    return 0;
  }
  for (let i = 1; i < elements.length - 1; i++) {
    if (time > elements[i].endTime && time < elements[i + 1].startTime) {
      return i + 1;
    }
  }
  if (time >= elements[elements.length - 1].endTime) {
    return elements.length;
  }
}

export function isIntersect(element1, element2) {
  const { startTime: s1, endTime: e1 } = element1;
  const { startTime: s2, endTime: e2 } = element2;
  if (s1 > s2) { // s2在s1左边
    return (e1 - s2) < (e1 - s1 + e2 - s2);
  } else {
    return (e2 - s1) < (e1 - s1 + e2 - s2);
  }
}

// 
export function solveTimeConfict(elements) {
  const len = elements.length;
  for (let i = 0; i < len - 1; i++) {
    const e1 = elements[i];
    const e2 = elements[i + 1];
    if (isIntersect(e1, e2)) {
      e2.startTime = e1.endTime;
      e2.endTime = e2.startTime + e2.duration;
    }
  }
}

export function timeLineElementsToPlayerElements(elements) {
  return elements.filter((element) => {
    return element.length > 0;
  }).flat();
}

export function getDuration(elements) {
  const playerElements = timeLineElementsToPlayerElements(elements);
  let duration = 0;
  playerElements.forEach(({ endTime }) => {
    if (endTime > duration) {
      duration = endTime;
    }
  });
  return duration;
}

export function msToTime(ms) {
  const leftMs = ms % 1000;
  const s = Math.floor(ms / 1000);
  const leftS = s % 60;
  const m = Math.floor(s / 60);
  const leftM = m % 60;
  const h = Math.floor(m / 60);
  return `${h.toString().padStart(2, '0')}:${leftM.toString().padStart(2, '0')}:${leftS.toString().padStart(2, '0')}.${leftMs.toString().padStart(3, '0')}`;
}