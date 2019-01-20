let Canvas = new function() {

    this.canvas;
    this.context;

    const WAVE_DURATION = Math.PI / 8;
    let waveFrameX = 0;
    let waveFrameY = 0;
    let waveSpeedX = 1;
    let waveSpeedY = 1;
    let waveAmplitudeX = 1;
    let waveAmplitudeY = 1;
    let trigX = Math.round(Math.random());
    let trigY = Math.round(Math.random());

    let glow = Util.getCookie("glow") !== "false";

    let edge = window.navigator.userAgent.indexOf("Edge") > -1;

    this.setUp = function() {
        this.canvas = $("#canvas").get()[0]
        this.context = canvas.getContext("2d");

        this.setStyling();

        Callbacks.addCallback(clearCallback, Priority.FIRST);
        Callbacks.addCallback(shakeCallback, Priority.FIRST);
        Callbacks.addCallback(postCallback, Priority.LAST);

        this.canvas.height = 700;
        this.canvas.width = ("width", $(window).width()) / ("width", $(window).height())* this.canvas.height;
        
        Canvas.context.shadowBlur = 12;
    }

    this.setSize = function(size, aspectRatio) {
        this.canvas.height = size;
        if(!aspectRatio) {
            this.canvas.width = ("width", $(window).width()) / ("width", $(window).height())* size;
        }else {
            this.canvas.width = size * aspectRatio;
        }
    }
    
    this.setStyling = function() {
        let w = $(window).width();
        let h = $(window).height();

        this.setSize(700);
        CanvasTexture.setSize(w*h);
        Canvas.context.fillStyle = "#FFFFFF";
        Canvas.context.shadowBlur = glow && !edge ? Config.glowRadius * Util.getResolutionMultiplier() : 0;
    }

    this.toggleGlow = function() {
        glow = !glow;
        Util.setCookie("glow", glow);
        this.setStyling();
    }

    let clearCallback = function() {
        Canvas.context.clearRect(0, 0, Canvas.canvas.width, Canvas.canvas.height);
    }

    let shakeCallback = function(_, multiplier) {
        Canvas.context.save();

        let step = Config.maxShakeIntensity * multiplier;
        waveFrameX += step * waveSpeedX;
        if (waveFrameX > WAVE_DURATION) {
            waveFrameX = 0;
            waveAmplitudeX = Util.random(Config.minShakeScalar, Config.maxShakeScalar);
            waveSpeedX = Util.random(Config.minShakeScalar, Config.maxShakeScalar) * (Math.random() < 0.5 ? -1 : 1);
            trigX = Math.round(Math.random());
        }
        waveFrameY += step * waveSpeedY;
        if (waveFrameY > WAVE_DURATION) {
            waveFrameY = 0;
            waveAmplitudeY = Util.random(Config.minShakeScalar, Config.maxShakeScalar);
            waveSpeedY = Util.random(Config.minShakeScalar, Config.maxShakeScalar) * (Math.random() < 0.5 ? -1 : 1);
            trigY = Math.round(Math.random());
        }

        let trigFuncX = trigX == 0 ? Math.cos : Math.sin;
        let trigFuncY = trigY == 0 ? Math.cos : Math.sin;

        let dx = trigFuncX(waveFrameX) * Config.maxShakeDisplacement * waveAmplitudeX * multiplier;
        let dy = trigFuncY(waveFrameY) * Config.maxShakeDisplacement * waveAmplitudeY * multiplier;

        Canvas.context.translate(dx, dy);
    }

    let postCallback = function() {
        Canvas.context.restore();
    }

}
