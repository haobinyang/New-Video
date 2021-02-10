import { OverlayType } from '../constants/common.js';
import { plunging } from './plunging.js';

const overlayMap = Object.freeze({
  [OverlayType.PLUNGING]: plunging,
});

export default function overlays(type) {
  return overlayMap[type];
}

export function svgToCanvas(svg, canvas, canvasContext) {
  return new Promise((resolve) => {
    const { width, height } = canvas;
    const image = new Image();
    image.width = width;
    image.height = height;
    image.onload = function() {
      canvasContext.clearRect(0, 0, width, height);
      canvasContext.drawImage(image, 0, 0);
      resolve();
    };
    image.src = `data:image/svg+xml,${svg.trim()}`;
  });
}