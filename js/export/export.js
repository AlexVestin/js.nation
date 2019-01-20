

let VideoExporter = new function(){

    let recorder;
    let canvas;
    let ctx; 
    let glCanvas;
    let spectrumCanvas; 

    let chunks = [];
    this.init = (width, height, FPS) => {
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");

        glCanvas        =   document.getElementById("canvas-gl");
        spectrumCanvas  =   document.getElementById("canvas");
        document.body.appendChild(canvas);

        glCanvas.style.display = "none";
        Renderer.updateSize(width, height);

        spectrumCanvas.width  = width;
        spectrumCanvas.height  = height;
        spectrumCanvas.style.display = "none";


        canvas.width  = glCanvas.width;
        canvas.height = glCanvas.height;


        //alert("Recording video from the canvas, don't leave/close the tab")
        let audioDom = document.getElementsByTagName("audio")[0];
        audioDom.currentTime = 0;
        audioDom.play();

        let aStream = Nodes.getAudioStream();
        let cStream = canvas.captureStream(FPS);
        cStream.addTrack(aStream.getAudioTracks()[0]);
        console.log(aStream.getAudioTracks()[0]);

        if(!MediaRecorder){
            alert("Media Recorder not supported in this browser");
            return;
        }

        var mixedStream = 'MediaStream' in window ? 
            new MediaStream([cStream.getVideoTracks()[0], aStream.getAudioTracks()[0]]) :
            cStream;
        recorder = new MediaRecorder(mixedStream);

        recorder.ondataavailable = this.saveChunks;
        recorder.onstop = this.exportVideo;
        recorder.start();
        Callbacks.addCallback(this.drawCallback, Priority.LAST);
    }

    this.drawCallback = () => {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.drawImage(glCanvas, 0,0);
        ctx.drawImage(spectrumCanvas,0,0);
    }

    this.exportVideo = () => {
        console.log("chunks", chunks)
        if(chunks.length) {
            var blob = new Blob(chunks)
            var vidURL = URL.createObjectURL(blob);

            // Hacky way to start a download 
            // https://stackoverflow.com/questions/23451726/saving-binary-data-as-file-using-javascript-from-a-browser
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";

            a.href = vidURL;
            a.download = name;
            a.click();
            window.URL.revokeObjectURL(vidURL);   
        }
    }

    this.saveChunks = (e) => {
        e.data.size && chunks.push(e.data);
    }

    this.stopRecording = () => {
        recorder.stop();
        this.exportVideo();
    }
      
}