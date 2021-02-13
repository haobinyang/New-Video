export function isString(val) {
  return Object.prototype.toString.call(val) === '[object String]';
}

export class CustomError {
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }
}

export async function loadVideo(arrayBuffer) {
  try {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(new Blob([arrayBuffer], { type: 'video/mp4' }));
      video.loop = false;
      // 可播放的时候再resolve
      video.addEventListener('loadeddata', async () => {
        // eslint-disable-next-line no-undef
        const texture = new THREE.VideoTexture(video);
        await texture.setCurrentTime(0); // 需要调用此函数才能确保在webgl渲染时视频有默认图
        resolve({ video, texture });
      });
    });
  } catch (err) {
    console.error(err);
  }
}

export function loadImage(file) {
  return new Promise((resolve) => {
    // eslint-disable-next-line no-undef
    new THREE.TextureLoader().load(URL.createObjectURL(file), function(texture) {
      resolve({ image: texture.image, texture });
    });
  });
}

export async function loadSvg(path) {
  const svg = await fetch(path);
  return svg.text();
}