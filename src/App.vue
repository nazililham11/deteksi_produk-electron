<template>
    <div class="container py-4">

        <div class="row my-2 py-2">
            <div class="col-12">
                <div class="card p-2">
                    <div class="d-flex flex-row">

                        <!-- Camera Button -->
                        <div
                            @click="toggleCamera"
                            class="btn m-2"
                            :class="isLoading ? 'btn-warning' : !isCameraOpen ? 'btn-primary' : 'btn-danger'"
                        >
                            <span
                                v-show="isLoading"
                                class="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                            ></span>
                            {{ isLoading ? "Loading Camera" : !isCameraOpen ? "Open Camera" : "Close Camera" }}
                        </div>

                        <!-- Capture Button -->
                        <div v-show="isCameraOpen" @click="takePhoto" class="btn btn-success m-2">
                            Capture
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div class="row my-2">

            <!-- Camera -->
            <div class="col-md-6 col-12">
                <div class="card p-2">
                    <div class="card-body">
                        <div class="d-flex flex-column align-items-center">
                            <h5 class="card-title">Camera</h5>

                            <video
                                v-show="isCameraOpen"
                                id="camera"
                                class="m-2"
                                ref="camera"
                                autoPlay
                                width="500"
                                height="374"
                            ></video>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Photo -->
            <div class="col-md-6 col-12">
                <div class="card p-2">
                    <div class="card-body">
                        <div class="d-flex flex-column align-items-center">
                            <h5 class="card-title">Photo</h5>
                            
                            <canvas
                                v-show="isPhotoTaken"
                                id="photo-taken"
                                ref="canvas"
                                width="500"
                                height="374"
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
            isPhotoTaken: false,
        };
    },
    methods: {
        toggleCamera() {
            if (this.isCameraOpen) {
                this.isCameraOpen = false
                this.stopCameraStream()
            } else {
                this.isCameraOpen = true
                this.createCameraElement()
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
            this.isPhotoTaken = true;
            const context = this.$refs.canvas.getContext("2d");
            context.drawImage(this.$refs.camera, 0, 0, 500, 374);
        },
    },
};

// Refrensi script
//
// Vue Webcam Camera Capture
// https://codepen.io/ditarahma08/pen/GRRxZLW?editors=1010

</script>
