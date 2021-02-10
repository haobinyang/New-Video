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

async function getImageData(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      const arrayBuffer = await blob.arrayBuffer();
      resolve(arrayBuffer);
    }, 'image/jpeg', 1.0);
  });
}

/**
 * 将player导出为h264视频文件
 * @param {*} player 
 */
export async function exportAsVideo(player, fileName = 'export.mp4', fps = 30) {
  const interval = 1000 / fps;
  const frames = [];
  let currentTime = 0;
  while (currentTime < player.duration) {
    player.setCurrentTime(currentTime);
    const imageData = await getImageData(player.painter.getDomElement());
    frames.push(imageData);
    await sleep(interval);
    currentTime += interval;
  }
  player.setCurrentTime(player.duration);
  const imageData = await getImageData(player.painter.getDomElement());
  frames.push(imageData);

  // 调用ffmpeg生成视频文件
  const worker = new Worker('./workers/export_video.js');
  worker.postMessage({ frames, fileName, fps });
  worker.onmessage = function(e) {
    // 清空数据
    frames.length = 0;
    frames = [];
    $('#video').src = URL.createObjectURL(e.data);
  }
}

/* Helper function */
// function download_file(fileURL, fileName) {
//   // for non-IE
//   if (!window.ActiveXObject) {
//       var save = document.createElement('a');
//       save.href = fileURL;
//       save.target = '_blank';
//       var filename = fileURL.substring(fileURL.lastIndexOf('/')+1);
//       save.download = fileName || filename;
//        if ( navigator.userAgent.toLowerCase().match(/(ipad|iphone|safari)/) && navigator.userAgent.search("Chrome") < 0) {
//       document.location = save.href; 
// // window event not working here
//     }else{
//           var evt = new MouseEvent('click', {
//               'view': window,
//               'bubbles': true,
//               'cancelable': false
//           });
//           save.dispatchEvent(evt);
//           (window.URL || window.webkitURL).revokeObjectURL(save.href);
//     }	
//   }

//   // for IE < 11
//   else if ( !! window.ActiveXObject && document.execCommand)     {
//       var _window = window.open(fileURL, '_blank');
//       _window.document.close();
//       _window.document.execCommand('SaveAs', true, fileName || fileURL)
//       _window.close();
//   }
// }
