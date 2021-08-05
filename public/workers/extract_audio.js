importScripts('../libs/ffmpeg.js')

onmessage = function(e) {
  const { file, arrayBuffer } = e.data;
  const resultFileName = 'audio.mp3';
  ffmpeg({
    arguments: ['-threads', '1', '-y', '-nostdin', '-i', file.name, '-f', 'mp3', '-vn', resultFileName],
    preRun(module, fs) {
      fs.writeFile(file.name, new Uint8Array(arrayBuffer));
    },
    onFilesChanged(stream) {
      if (stream.path.includes(resultFileName)) {
        postMessage(stream.node.contents);
      }
    }
  });
}