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
                                class="btn btn-success"
                                :class="{ disabled: !isImageReady }"
                                @click="predict"
                            >
                                Predict
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

                            <img
                                v-if="currentImageUrl"
                                @load="imageLoaded"
                                :src="currentImageUrl"
                                alt="image"
                                class="img-fluid mt-2"
                            />
                        </div>

                        <!-- From File -->
                        <div v-show="detectFrom == 'file'">
                            <input
                                class="mb-2"
                                type="file"
                                @change="fileChanged"
                            />
                            <img
                                v-if="fileInput"
                                @load="imageLoaded"
                                :src="fileInput"
                                class="img-fluid mt-2"
                                alt="Image"
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

                            <canvas
                                v-show="isCameraOpen && isImageReady"
                                id="photoTaken"
                                class="my-2"
                                ref="canvas"
                                :width="cameraSize.width"
                                :height="cameraSize.height"
                            ></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "App",
    data() {
        return {
            isLoading: false,
            isCameraOpen: false,
            isImageReady: false,
            detectFrom: "camera",
            cameraSize: { width: 500, height: 374 },
            imageUrl: "",
            currentImageUrl: "",
            fileInput: "",
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

            this.fileInput = "";
            this.imageUrl = "";
            this.currentImageUrl = "";
            this.isImageReady = false;

            this.detectFrom = selected;
        },

        getImage() {
            this.currentImageUrl = this.imageUrl;
        },

        fileChanged(event) {
            const file = event.target.files[0];
            this.fileInput = URL.createObjectURL(file);
        },

        imageLoaded() {
            this.isImageReady = true;
        },

        predict() {
            // Prediction stuff
        }

    },
};

// Refrensi script
//
// Vue Webcam Camera Capture
// https://codepen.io/ditarahma08/pen/GRRxZLW?editors=1010
//
// Preview an image before it is uploaded VUEjs
// https://stackoverflow.com/questions/49106045/preview-an-image-before-it-is-uploaded-vuejs
</script>
