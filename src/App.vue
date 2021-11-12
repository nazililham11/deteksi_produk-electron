<template>
    <div class="container-fluid p-2">
        <div class="row p-2">
            <!-- Photo -->
            <div class="col-lg-6 col-12 p-2">
                <div class="card p-2">
                    <div class="card-body">
                        <h5 class="card-title">Object Detection</h5>

                        <!-- Buttons -->
                        <div class="d-flex flex-row justify-content-between">
                            <div
                                class="btn-group"
                                role="group"
                                aria-label="Basic example"
                            >
                                <!-- From Camera -->
                                <div
                                    @click="selectDetectionFrom('camera')"
                                    class="btn"
                                    :class="
                                        detectFrom != 'camera'
                                            ? 'btn-outline-primary'
                                            : 'btn-primary'
                                    "
                                >
                                    Camera
                                </div>

                                <!-- From File -->
                                <div
                                    @click="selectDetectionFrom('file')"
                                    class="btn"
                                    :class="
                                        detectFrom != 'file'
                                            ? 'btn-outline-primary'
                                            : 'btn-primary'
                                    "
                                >
                                    File
                                </div>

                                <!-- From URL -->
                                <div
                                    @click="selectDetectionFrom('url')"
                                    class="btn"
                                    :class="
                                        detectFrom != 'url'
                                            ? 'btn-outline-primary'
                                            : 'btn-primary'
                                    "
                                >
                                    URL
                                </div>
                            </div>

                            <div
                                class="btn"
                                :class="{
                                    disabled: !isImageReady,
                                    'btn-success': !isPredicting,
                                    'btn-warning': isPredicting,
                                }"
                                @click="predict"
                            >
                                <span
                                    v-show="isPredicting"
                                    class="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                {{ isPredicting ? "Predicting.." : "Predict" }}
                            </div>
                        </div>

                        <hr />

                        <!-- From URL -->
                        <div v-show="detectFrom == 'url'">
                            <div class="d-flex flex-row mb-2">
                                <input
                                    type="text"
                                    class="form-control"
                                    id="image-url"
                                    placeholder="Image URL"
                                    v-model="imageUrl"
                                />
                                <div @click="getImage" class="btn btn-primary">
                                    Get
                                </div>
                            </div>
                        </div>

                        <!-- From File -->
                        <div v-show="detectFrom == 'file'">
                            <input
                                class="mb-2"
                                type="file"
                                @change="fileChanged"
                            />
                        </div>

                        <!-- From Camera -->
                        <div
                            v-show="detectFrom == 'camera'"
                            class="flex-column justify-content-center"
                        >
                            <div class="d-flex flex-row">
                                <div
                                    @click="toggleCamera"
                                    class="btn"
                                    :class="
                                        isLoading
                                            ? 'btn-warning'
                                            : !isCameraOpen
                                            ? 'btn-primary'
                                            : 'btn-danger'
                                    "
                                >
                                    <span
                                        v-show="isLoading"
                                        class="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                    {{
                                        isLoading
                                            ? "Loading Camera"
                                            : !isCameraOpen
                                            ? "Open Camera"
                                            : "Close Camera"
                                    }}
                                </div>
                                <div
                                    v-show="!isImageReady"
                                    @click="takePhoto"
                                    class="btn btn-success mx-2"
                                    :class="{ disabled: !isCameraOpen }"
                                >
                                    Capture
                                </div>

                                <div
                                    v-show="isImageReady"
                                    @click="resetTakedPhoto"
                                    class="btn btn-warning mx-2"
                                >
                                    Reset
                                </div>
                            </div>

                            <video
                                v-show="isCameraOpen && !isImageReady"
                                id="camera"
                                class="my-2"
                                ref="camera"
                                autoPlay
                                :width="cameraSize.width"
                                :height="cameraSize.height"
                            ></video>
                        </div>

                        <!-- Prediction -->
                        <div style="position: relative">
                            <img
                                style="position: absolute"
                                v-show="isImageReady"
                                @load="imageLoaded"
                                :src="predictImageUrl"
                                alt="image"
                                crossorigin="anonymous"
                                class="img-fluid mt-2"
                                id="predicted-img"
                            />

                            <canvas
                                v-show="isCameraOpen && isImageReady"
                                id="photo-taken"
                                style="position: absolute"
                                class="my-2"
                                ref="canvas"
                                :width="cameraSize.width"
                                :height="cameraSize.height"
                            ></canvas>

                            <canvas
                                v-show="isPredicted"
                                style="position: absolute"
                                id="prediction-result"
                                class="my-2"
                            ></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import * as tf from "@tensorflow/tfjs";

tf.setBackend("webgl");

export default {
    name: "App",
    data() {
        return {
            isLoading: false,
            isCameraOpen: false,
            isImageReady: false,
            isPredicting: false,
            isPredicted: false,
            threshold: 0.6,
            detectFrom: "camera",
            cameraSize: { width: 600, height: 500 }, 
            predictImageUrl: "",
            imageUrl: "",
            model: null,
        };
    },
    methods: {
        toggleCamera() {
            if (this.isCameraOpen) {
                this.isCameraOpen = false;
                this.stopCameraStream();
            } else {
                this.isCameraOpen = true;
                this.createCameraElement();
            }
        },

        createCameraElement() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                this.isLoading = true;

                const constraints = (window.constraints = {
                    audio: false,
                    video: true,
                });

                navigator.mediaDevices
                    .getUserMedia(constraints)
                    .then((stream) => {
                        this.isLoading = false;
                        this.isCameraOpen = true;
                        this.$refs.camera.srcObject = stream;
                    })
                    .catch(() => {
                        this.isLoading = false;
                        alert(
                            "The browser may didn't support or there is some errors."
                        );
                    });
            }
        },

        stopCameraStream() {
            let tracks = this.$refs.camera.srcObject.getTracks();
            tracks.forEach((track) => {
                track.stop();
            });
        },

        takePhoto() {
            const context = this.$refs.canvas.getContext("2d");
            context.drawImage(
                this.$refs.camera,
                0,
                0,
                this.cameraSize.width,
                this.cameraSize.height
            );
            this.isImageReady = true;
        },

        resetTakedPhoto() {
            this.isImageReady = false;
        },

        selectDetectionFrom(selected) {
            if (selected == this.detectFrom) return;

            if (this.detectFrom == "camera" && this.isCameraOpen) {
                this.isCameraOpen = false;
                this.stopCameraStream();
            }

            this.imageUrl = "";
            this.predictImageUrl = "";
            this.isImageReady = false;

            this.detectFrom = selected;
        },

        getImage() {
            if (this.predictImageUrl != this.imageUrl)
                this.predictImageUrl = this.imageUrl;
        },

        fileChanged(event) {
            const file = event.target.files[0];
            this.predictImageUrl = URL.createObjectURL(file);
        },

        imageLoaded() {
            this.isImageReady = true;
        },

        getImageElement() {
            return {
                image:
                    this.detectFrom == "camera"
                        ? document.getElementById("photo-taken")
                        : document.getElementById("predicted-img"),
                canvas: document.getElementById("prediction-result"),
            };
        },

        async predict() {
            if (this.isPredicting || !this.isImageReady) return;
            this.isPredicting = true;

            const { image, canvas } = this.getImageElement();

            if (!this.model) {
                this.model = Object.freeze(await this.loadModel());
            }

            tf.engine().startScope();

            const predictions = await this.model.executeAsync(
                await this.preprocessImg(image)
            );
            const detectionObjects = this.buildDetectedObjects({
                scores: predictions[5].arraySync(),
                threshold: this.threshold,
                boxes: predictions[4].arraySync(),
                classes: predictions[6].dataSync(),
                classesDir: this.getClasses,
                frame: image,
            });
            const imageSize = {
                width: image.offsetWidth,
                height: image.offsetHeight,
            };
            this.renderPredictions(detectionObjects, canvas, imageSize);
            this.isPredicting = false;

            tf.engine().endScope();
        },

        async loadModel() {
            return await tf.loadGraphModel("http://127.0.0.1:8081/model.json");
        },

        async preprocessImg(image) {
            const tfimg = tf.browser.fromPixels(image).toInt();
            const expandedimg = tfimg.transpose([0, 1, 2]).expandDims();
            return expandedimg;
        },

        buildDetectedObjects({
            scores,
            threshold,
            boxes,
            classes,
            classesDir,
            frame,
        }) {
            const detectionObjects = [];

            scores[0].forEach((score, i) => {
                // console.log({height: frame.offsetHeight, width: frame.offsetWidth})
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
                        class: classes[i],
                        label: classesDir[classes[i]].name,
                        score: score.toFixed(4),
                        bbox: bbox,
                    });
                }
            });
            return detectionObjects;
        },

        renderPredictions(detection, canvas, imageSize) {
            canvas.width = imageSize.width;
            canvas.height = imageSize.height;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Font options.
            const font = "16px sans-serif";
            ctx.font = font;
            ctx.textBaseline = "top";

            detection.forEach((item) => {
                const x = item["bbox"][0];
                const y = item["bbox"][1];
                const width = item["bbox"][2];
                const height = item["bbox"][3];
                const label = `${item["label"]} ${(100 * item["score"]).toFixed(
                    2
                )}%`;

                // Draw the bounding box.
                ctx.strokeStyle = "#00FFFF";
                ctx.lineWidth = 4;
                ctx.strokeRect(x, y, width, height);

                // Draw the label background.
                ctx.fillStyle = "#00FFFF";
                const textWidth = ctx.measureText(label).width;
                const textHeight = parseInt(font, 10); // base 10
                ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

                // Draw the text last to ensure it's on top.
                ctx.fillStyle = "#000000";
                ctx.fillText(label, x, y);
            });
        },
    },

    computed: {
        getClasses() {
            return {
                1: { id: 1, name: "product" },
                2: { id: 2, name: "other" },
            };
        },
    },
};

// Refrensi script
//
// Vue Webcam Camera Capture
// https://codepen.io/ditarahma08/pen/GRRxZLW?editors=1010
//
// Preview an image before it is uploaded VUEjs
// https://stackoverflow.com/questions/49106045/preview-an-image-before-it-is-uploaded-vuejs
//
// Real-time object detection in the browser using TensorFlow.js
// https://github.com/hugozanini/TFJS-object-detection
//
// TFJS Demo code
// https://github.com/tensorflow/tfjs/issues/4684#issuecomment-780060126
</script>
