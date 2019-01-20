
//https://stackoverflow.com/questions/39302814/mediastream-capture-canvas-and-audio-simultaneously
let VideoExporter = new function(){

    let recorder;
    let glCanvas;

    let chunks = [];
    this.start = (width, height, FPS) => {
        glCanvas        =   document.getElementById("canvas-gl");
        
        Renderer.updateSize(width, height);
        Canvas.setSize(width/height);
        Canvas.context.shadowBlur = 15;
        //alert("Recording video from the canvas, don't leave/close the tab")
        let audioDom = document.getElementsByTagName("audio")[0];
        audioDom.currentTime = 0;

        
        //let aStream = Nodes.getAudioStream();
        let aStream = audio.captureStream ? audio.captureStream() : audio.mozCaptureStream() ;
        let cStream = glCanvas.captureStream(FPS);
        cStream.addTrack(aStream.getAudioTracks()[0]);

        if(!MediaRecorder){
            alert("Media Recorder not supported in this browser");
            return;
        }

        var mixedStream = 'MediaStream' in window ? 
            new MediaStream([cStream.getVideoTracks()[0], aStream.getAudioTracks()[0]]) :
            cStream;
        recorder = new MediaRecorder(mixedStream);

        audioDom.play();
        recorder.start();
        recorder.ondataavailable = this.saveChunks;
        recorder.onstop = this.exportVideo;
        
    }   

    this.exportVideo = () => {
        if(chunks.length) {
            saveAs(new Blob(chunks), "vid.mp4");  
        }
    }

    this.saveChunks = (e) => {
        e.data.size && chunks.push(e.data);
    }

    this.stop = () => {
        recorder.stop();
    }
      
}