importScripts('../libs/ffmpeg.js');

function extractDuration(field) {
  try {
    const duration = field.split(',')[0].replace('Duration:', '');
    return duration.trim();
  } catch {
    return -1;
  }
}

// Stream #0:0(und): Video: h264 (High) (avc1 / 0x31637661), yuv420p(tv, bt709), 1080x1920, 2317 kb/s, 25 fps, 25 tbr, 25 tbn, 50 tbc (default)
// Stream #0:1(und): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 253 kb/s (default)

function extractVideoInfo(field) {
  try {
    const infoItems = field.split('Video:')[1].replace(/\(.*?\)/gi, '').split(',');
    const resolution = infoItems[2].split('x');
    return {
      compression: infoItems[0].trim(),
      colorSpace: infoItems[1].trim(),
      resolution: {
        width: parseInt(resolution[0].trim()),
        height: parseInt(resolution[1].trim())
      },
      fps: parseInt(infoItems[4].replace('fps', '').trim())
    };
  } catch {
    return {};
  }
}

function extractAudioInfo(field) {
  try {
    const infoItems = field.split('Audio:')[1].replace(/\(.*?\)/gi, '').split(',');
    const resolution = infoItems[2].split('x');
    return {
      compression: infoItems[0].trim(),
      Hz: parseInt(infoItems[1].replace('Hz', '').trim())
    };
  } catch {
    return {};
  }
}

onmessage = function(e) {
  const { file, arrayBuffer } = e.data;
  const mediaInfo = {};

  ffmpeg({
    arguments: ['-threads', '1', '-y', '-nostdin', '-i', file.name],
    preRun(module, fs) {
      fs.writeFile(file.name, new Uint8Array(arrayBuffer));
    },
    printErr(field) {
      if (field.includes('Duration')) {
        mediaInfo.duration = extractDuration(field);
      } else if (field.includes('Stream #0')) { // 视频流或者音频流
        if (field.includes('Video:')) {
          mediaInfo.video = extractVideoInfo(field);
        } else if (field.includes('Audio:')) {
          mediaInfo.audio = extractAudioInfo(field);
        }
      }
    },
    onExit() {
      postMessage(mediaInfo);
    }
  });
}