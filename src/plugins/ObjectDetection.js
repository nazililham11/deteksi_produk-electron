import * as tf from "@tensorflow/tfjs";

tf.setBackend("webgl");

export default class ObjectDetection {

    constructor({
        model_url,
        classes_url,
    }) {
        this.model = null
        this.classes = null

        this.model_url = model_url
        this.classes_url = classes_url
    }

    isModelLoaded = () => {
        return this.model !== null
    }
    isClassesLoaded = () => {
        return this.classes !== null
    }

    loadModel = async () => {
        this.model = await Object.freeze(
            tf.loadGraphModel(this.model_url)
        );
    }
    loadClasses = async () => {
        this.classes = await fetch(this.classes_url)
            .then((r) => r.json())
        return this.classes

    }

    detect = async (image, detection_threshold = 0.5) => {
        if (!this.isModelLoaded()) {
            console.error('Model not yet loaded')
            return undefined
        }
        if (!this.isClassesLoaded()) {
            console.error('Classes are empty')
            return undefined
        }

        const detection = await this.model.executeAsync(
            await this._preprocessImg(image)
        );

        const detectionObjects = this._buildDetectedObjects({
            classes: detection[0].dataSync(),
            scores: detection[1].arraySync(),
            boxes: detection[5].arraySync(),
            classesDir: this.classes,
            threshold: detection_threshold,
            frame: image
        });

        return detectionObjects
    }

    _preprocessImg = async (image) => {
        const tfimg = tf.browser.fromPixels(image).toInt();
        const expandedimg = tfimg.transpose([0, 1, 2]).expandDims();
        return expandedimg;
    }

    _buildDetectedObjects = ({ scores, threshold, boxes, classes, classesDir, frame }) => {
        const detectionObjects = [];

        scores[0].forEach((score, i) => {
            if (score > threshold) {
                const bbox = [];
                const minY = boxes[0][i][0] * frame.naturalHeight;
                const minX = boxes[0][i][1] * frame.naturalWidth;
                const maxY = boxes[0][i][2] * frame.naturalHeight;
                const maxX = boxes[0][i][3] * frame.naturalWidth;

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
}