importScripts('../libs/ffmpeg.js')

onmessage = function(e) {
  const { file, arrayBuffer } = e.data;
  ffmpeg({
    arguments: ['-threads', '1', '-y', '-nostdin', '-i', file.name, '-c:v', 'h264', '-preset', 'ultrafast', '-an', 'video.mp4'],
    preRun(module, fs) {
      fs.writeFile(file.name, new Uint8Array(arrayBuffer));
    },
    onFilesChanged(stream) {
      if (stream.path.includes('video.mp4')) {
        postMessage(stream.node.contents);
      }
    }
  });
}