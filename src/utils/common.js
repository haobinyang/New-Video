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
          fitType: FitType.CONTAIN
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
          fitType: FitType.CONTAIN,
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
  }
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