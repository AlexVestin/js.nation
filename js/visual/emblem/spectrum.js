let Spectrum = new function() {

    const spectrumCount = 8;
    const exponents = [1, 1.04, 1.06, 1.08, 1.10, 1.12, 1.14, 1.16];
    const smoothMargins = [0, 1, 1, 2, 2, 2, 3, 3];
    //               white      yellow      red        pink      indigo    blue        lightblue  green
    const colors = ["#FFFFFF", "#FFFF00", "#FF0000", "#FF66FF", "#333399", "#0000FF", "#33CCFF", "#00FF00"];
    const delays = [0, 1, 2, 3, 4, 5, 6, 7];
    const maxBufferSize = Math.max.apply(null, delays);

    let spectrumCache = Array();

    let jqWindow;

    this.setUp = function() {
        Callbacks.addCallback(drawCallback, Priority.EARLY);
        jqWindow = $(window);
    }

    let drawCallback = function(spectrum, multiplier) {
        if (!Config.drawSpectrum) {
            return;
        }

        if (spectrumCache.length >= maxBufferSize) {
            spectrumCache.shift();
        }
        spectrumCache.push(spectrum);

        let curRad = Emblem.calcRadius(multiplier);

        for (let s = spectrumCount - 1; s >= 0; s--) {
            let curSpectrum = smooth(spectrumCache[Math.max(spectrumCache.length - delays[s] - 1, 0)], smoothMargins[s]);

            let points = [];

            Canvas.context.fillStyle = colors[s];
            Canvas.context.shadowColor = colors[s];

            let len = curSpectrum.length;
            for (let i = 0; i < len; i++) {
                t = Math.PI * (i / (len - 1)) - MathConstants.HALF_PI;
                r = curRad + Math.pow(curSpectrum[i] * Config.spectrumHeightScalar * Util.getResolutionMultiplier(), exponents[s]);
                x = r * Math.cos(t);
                y = r * Math.sin(t);
                points.push({x: x, y: y});
            }

            drawPoints(points, false);
            drawPoints(points, true);
        }
    }

    let drawPoints = function(points, neg) {
        if (points.length == 0) {
            return;
        }

        Canvas.context.beginPath();

        let halfWidth = jqWindow.width() / 2;
        let halfHeight = jqWindow.height() / 2;

        let xMult = neg ? -1 : 1;

        // the "+neg" is kind of a band-aid because the positioning is imperfect and I don't feel like fixing the underlying issue
        Canvas.context.moveTo(halfWidth + neg, points[0].y + halfHeight);

        let len = points.length;
        for (let i = 1; i < len - 2; i++) {
            let c = xMult * (points[i].x + points[i + 1].x) / 2 + halfWidth;
            let d = (points[i].y + points[i + 1].y) / 2 + halfHeight;
            Canvas.context.quadraticCurveTo(xMult * points[i].x + halfWidth, points[i].y + halfHeight, c, d);
        }
        Canvas.context.quadraticCurveTo(xMult * points[len - 2].x + halfWidth + neg * 2, points[len - 2].y + halfHeight,
                xMult * points[len - 1].x + halfWidth, points[len - 1].y + halfHeight);
        Canvas.context.fill();
        Canvas.context.closePath();
    }

    //TODO: memoize me
    let smooth = function(points, margin) {
        if (margin == 0) {
            return points;
        }

        let newArr = Array();
        for (let i = 0; i < points.length; i++) {
            let sum = 0;
            let denom = 0;
            for (let j = 0; j <= margin; j++) {
                if (i - j < 0 || i + j > points.length - 1) {
                    break;
                }
                sum += points[i - j] + points[i + j];
                denom += (margin - j + 1) * 2;
            }
            newArr[i] = sum / denom;
        }
        return newArr;
    }

}
