/**
 * 获取媒体信息
 * @param {*} file 
 * @param {*} arrayBuffer 
 */
const mediaInfoWorker = new Worker('./workers/media_info.js');
export function getMediaInfo(file) {
  return new Promise((resolve) => {
    mediaInfoWorker.postMessage({ file });
    mediaInfoWorker.onmessage = function(e) {
      resolve({...e.data, size: file.size});
    }
  });
}

export function extractAudioInMP3(file, arrayBuffer) {
  return new Promise((resolve) => {
    const worker = new Worker('./workers/extract_audio.js');

    worker.postMessage({
      arguments: ['-i', file.name, '-f', 'mp3', '-vn', 'audio.mp3'],
      MEMFS: [{name: file.name, data: arrayBuffer}]
    });

    worker.onmessage = function(e) {
      resolve(e.data);
    }
  });
}

/**
 * 提取为h264
 */
export function extractVideoInMP4(file, arrayBuffer) {
  return new Promise((resolve) => {
    const worker = new Worker('./workers/extract_video.js');

    worker.postMessage({
      arguments: ['-threads', '1', '-y', '-nostdin', '-i', file.name, '-c:v', 'h264', '-preset', 'ultrafast', '-an', 'video.mp4'],
      MEMFS: [{name: file.name, data: arrayBuffer}]
    });

    worker.onmessage = function(e) {
      resolve(e.data);
    }
  });
}

export function listCodecs() {
  return new Promise((resolve) => {
    const worker = new Worker('./workers/list_codecs.js');

    worker.postMessage({
      arguments: ['-version'],
    });

    worker.onmessage = function(e) {
      debugger
      resolve(e.data);
    }
  });
}

export function playAudio(blob) {
  blob.arrayBuffer().then((buffer) => {
    const context = new AudioContext();
    context.decodeAudioData(buffer, (audioBuffer) => {
      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);
      source.start();
    });
  });
}

export function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function drawImageToCanvas(canvas, ctx, image) {
  const { width, height } = canvas;
  return new Promise((resolve) => {
    // const img = new Image();
    // img.onload = function() {
      // debugger
      // ctx.clearRect( 0, 0, width, height );
      // ctx.scale(1, 1);
      ctx.drawImage(image, 0, 0, width * 2, height * 2, 0, 0, width, height);
      // ctx.scale(0.5, 0.5);
      canvas.toBlob(async (blob) => {
        const arrayBuffer = await blob.arrayBuffer();
        resolve(arrayBuffer);
      }, 'image/jpeg', 1.0);
    // };
    // img.src = image; //URL.createObjectURL(image);
  });
}

async function getImageData(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      // const arrayBuffer = await blob.arrayBuffer();
      resolve(blob);
    }, 'image/jpeg', 1.0);
  });
}

/**
 * 将player导出为h264视频文件
 * @param {*} player 
 */
export async function exportAsVideo(player, fileName = 'export.mp4', fps = 30) {
  const interval = 1000 / fps;
  let frames = [];
  let currentTime = 0;
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  // ctx.mozImageSmoothingEnabled = false;
  // ctx.imageSmoothingEnabled = false;
  // ctx.scale(0.5, 0.5);
  while (currentTime < player.duration) {
    player.setCurrentTime(currentTime);
    // const imageData1 = await getImageData(player.painter.getDomElement());
    const imageData = await drawImageToCanvas(canvas, ctx, player.painter.getDomElement());
    frames.push(imageData);
    await sleep(interval);
    currentTime += interval;
  }
  // player.setCurrentTime(player.duration);
  // const imageData = await getImageData(player.painter.getDomElement());
  // frames.push(imageData);

  // 调用ffmpeg生成视频文件
  // const worker = new Worker('./workers/export_video.js');
  // worker.postMessage({ frames, fileName, fps });
  // worker.onmessage = function(e) {
  //   // 清空数据
  //   frames.length = 0;
  //   frames = [];
  //   downloadFile(URL.createObjectURL(e.data), fileName);
  // }
}

/* Helper function */
function downloadFile(fileURL, fileName) {
  if (!window.ActiveXObject) { // for non-IE
    const save = document.createElement('a');
    save.href = fileURL;
    save.target = '_blank';
    save.download = fileName;
    if (navigator.userAgent.toLowerCase().match(/(ipad|iphone|safari)/) && navigator.userAgent.search("Chrome") < 0) {
      document.location = save.href;
    } else { // window event not working here
      const evt = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': false
      });
      save.dispatchEvent(evt);
      (window.URL || window.webkitURL).revokeObjectURL(save.href);
    }	
  } else if ( !! window.ActiveXObject && document.execCommand) { // for IE < 11
    const newWindow = window.open(fileURL, '_blank');
    newWindow.document.close();
    newWindow.document.execCommand('SaveAs', true, fileName || fileURL);
    newWindow.close();
  }
}
