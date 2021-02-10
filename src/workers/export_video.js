importScripts('../libs/ffmpeg.js');

onmessage = function(e) {
  const { frames, fileName, fps } = e.data;

  ffmpeg({
    arguments: ['-threads', '1', '-y', '-nostdin', '-r', `${fps}`, '-i', `export_%04d.jpg`,
     '-c:v', 'h264', '-vf', `fps=${fps}`, '-pix_fmt', 'yuv420p', fileName],
    preRun(module, fs) {
      for (let i = 0; i < frames.length; i++) {
        fs.writeFile(`export_${i.toString().padStart(4, '0')}.jpg`, new Uint8Array(frames[i]));
      }
    },
    onFilesChanged(stream) {
      const { path, node: { contents } } = stream;
      if (path.includes(fileName)) {
        postMessage(new Blob([contents], { type: 'video/mp4' }));
      }
      console.log('onFileCreated: ', stream);
    },
    onExit(status) {
      // 清空生成的文件
      console.log('onExit:', status);
    },
    onAbort() {
      console.error('aborted');
    }
  });
};