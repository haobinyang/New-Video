self.importScripts('../libs/ffmpeg.js')

onmessage = function(e) {
  const { MEMFS, arguments } = e.data;

  ffmpeg_run({
    MEMFS: MEMFS,
    arguments: arguments,
    onFileCreated: function(stream) {
      if (stream.path.includes('audio.mp3')) {
        const blob = new Blob([stream.node.contents], { type: 'audio/mp3' });
        postMessage(blob);
      }
    }
  }, () => {
    postMessage(null);
  });
}