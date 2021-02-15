self.importScripts('../libs/ffmpeg.js')

onmessage = function (e) {
  ffmpeg({
    arguments: ['-codecs'],
    onExit() {
      postMessage(true);
    }
  });
}