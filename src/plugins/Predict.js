import * as tf from "@tensorflow/tfjs";

tf.setBackend("webgl");

export const loadModel = async (model_url) => {
    return await tf.loadGraphModel(model_url);
}

export const preprocessImg = async (image) => {
    const tfimg = tf.browser.fromPixels(image).toInt();
    const expandedimg = tfimg.transpose([0, 1, 2]).expandDims();
    return expandedimg;
}

export const buildDetectedObjects = ({ scores, threshold, boxes, classes, classesDir, frame }) => {
    const detectionObjects = [];

    scores[0].forEach((score, i) => {
        if (score > threshold) {
            const bbox = [];
            const minY = boxes[0][i][0] * frame.offsetHeight;
            const minX = boxes[0][i][1] * frame.offsetWidth;
            const maxY = boxes[0][i][2] * frame.offsetHeight;
            const maxX = boxes[0][i][3] * frame.offsetWidth;

            bbox[0] = minX;
            bbox[1] = minY;
            bbox[2] = maxX - minX;
            bbox[3] = maxY - minY;

            detectionObjects.push({
                class: classesDir[classes[i]],
                score: score.toFixed(4),
                bbox: bbox,
            });
        }
    });
    return detectionObjects;
}

export const renderPredictions = (detection, canvas, image) => {
    canvas.width = image.offsetWidth;
    canvas.height = image.offsetHeight;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    console.log('image.size',{w:image.width, h: image.height})
    ctx.drawImage(image,0,0,image.naturalWidth,image.naturalHeight,0,0,canvas.width,canvas.height);

    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";

    detection.forEach((item) => {
        const x = item.bbox[0];
        const y = item.bbox[1];
        const width = item.bbox[2];
        const height = item.bbox[3];
        const score = (100 * item.score).toFixed(2);
        const label = `${item.class.name} ${score}%`;

        // Draw the bounding box.
        ctx.strokeStyle = item.class.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y + 1, width, height);

        // Draw the label background.
        ctx.fillStyle = item.class.color;
        const textWidth = ctx.measureText(label).width;
        const textHeight = parseInt(font, 7); // base 10
        ctx.fillRect(x, y, textWidth + 5, textHeight + 5);

        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, x + 2, y + 2);
    });
}

export const getDetectionObjects = (predictions, threshold, classes, frame) => {
    return buildDetectedObjects({
        classes: predictions[0].dataSync(),
        scores: predictions[1].arraySync(),
        boxes: predictions[5].arraySync(),
        classesDir: classes,
        threshold,
        frame,
    });
}