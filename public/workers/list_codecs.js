self.importScripts('../libs/ffmpeg.js')

onmessage = function (e) {
    const {MEMFS, arguments} = e.data;

    ffmpeg_run({
        // MEMFS: MEMFS,
        arguments: ['-codecs'],
        // stdout: function(data) { console.log('stdout: ', data); },
        // stdin: function(data) { console.log('stdin: ', data); },
        print: function(data) { console.log('print: ', data); },
        printErr: function(data) { console.log('printErr: ', data); },
        onExit: function(code) {
            console.log("Process exited with code " + code);
        },
    }, (res) => {
        console.log(res);
    });
}