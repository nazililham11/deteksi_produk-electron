<template>
    <!-- Predicted Result (Hidden Instances) -->
    <canvas id="temp-canvas" v-show="false"></canvas>

    <!-- File Input Instances (Hidden Instances) -->
    <input
        type="file"
        name="image_input"
        ref="ref_image_input"
        id="image_input"
        @change="_fileInputChanged"
        accept="image/jpg, image/jpeg, image/png"
    />

    <div class="card flex-row main-container">
        <div class="flex-col w-50 grey darken-2">
            <div id="image_wrapper" class="image-wrapper flex-fill">
                <!-- Image -->
                <img
                    id="predict-image"
                    :src="imageUrl"
                    alt="Image"
                    v-show="isImageLoaded"
                    @load="_imageLoaded"
                />

                <!-- Bounding Boxes -->
                <img
                    :src="item.bbox_data"
                    :alt="index"
                    v-for="(item, index) in boundingBoxes"
                    :key="index"
                    v-show="isPredicted || item.isVisible"
                />

                <!-- Hide/Show Buttons -->
                <span class="image-title" v-if="isPredicted">
                    <a
                        class="btn btn-small mr-2"
                        v-for="(item, index) in groupedInvoice"
                        :key="index"
                        :style="'background-color: ' + item.color"
                        @click="_toggleVisiblityPressed(index)"
                    >
                        <span class="valign-wrapper">
                            <i class="material-icons mr-2">close</i>
                            {{ item.name }} ({{ item.quantity }})
                        </span>
                    </a>
                </span>

                <!-- Loading Mask -->
                <div class="loading-mask white-text" v-show="isPredicting">
                    <span class="loader loader-lg mr-2 blue-text"></span>
                    <h6>Memproses</h6>
                </div>

                <!-- Insert Image Button -->
                <div class="flex-col insert-image" v-show="!isImageLoaded">
                    <i class="material-icons grey-text text-darken-3"
                        >add_a_photo</i
                    >

                    <a class="btn waves-effect waves-light">
                        <label
                            class="valign-wrapper white-text"
                            for="image_input"
                            style="font-size: 14px"
                        >
                            <i class="material-icons mr-2">add</i>
                            Input gambar
                        </label>
                    </a>
                </div>
            </div>
        </div>
        <div class="flex-col w-50">
            <div class="card-content flex-fill">
                <!-- Model Status -->
                <h6 class="green-text valign-wrapper" style="height: 2rem">
                    <i class="material-icons mr-2" v-if="!isLoadingModel"
                        >check_circle</i
                    >
                    <span class="loader mr-2" v-else></span>
                    <span>{{
                        isLoadingModel ? "Loading Model" : "Models Loaded"
                    }}</span>
                </h6>

                <!-- Total -->
                <InvoiceTotal :price="invoiceDetails.total"></InvoiceTotal>

                <div class="divider grey darken-3 my-4"></div>

                <!-- Invoice Table -->
                <InvoiceTable :tableData="invoice"></InvoiceTable>
            </div>

            <div class="card-action">
                <!-- Prediction Button -->
                <a
                    class="btn waves-effect waves-light mx-1"
                    @click="_detectBtnPressed"
                    :class="{ disabled: !isImageLoaded || isPredicted }"
                >
                    <span class="valign-wrapper">
                        <i class="material-icons mr-2">filter_center_focus</i>
                        Deteksi
                    </span>
                </a>

                <!-- Reset Button -->
                <a
                    class="btn waves-effect waves-light blue mx-1"
                    @click="_resetBtnPressed"
                    :class="{ disabled: !isImageLoaded }"
                >
                    <span class="valign-wrapper">
                        <i class="material-icons mr-2">cached</i>
                        Reset
                    </span>
                </a>

                <!-- Detection Time -->
                <span v-if="detectionTime">
                    <i>Waktu Deteksi : {{ detectionTime }} ms</i>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
const BASE_URL = "./";

import InvoiceTable from "./components/InvoiceTable.vue";
import InvoiceTotal from "./components/InvoiceTotal.vue";

import { CreateBBoxUrlData } from "./plugins/Helper";
import ObjectDetection from "./plugins/ObjectDetection";
import DetectionResult from "./plugins/DetectionResult";

export default {
    name: "App",
    components: {
        InvoiceTable,
        InvoiceTotal,
    },
    data() {
        return {
            objDetect: null,
            detectResult: null,
            boundingBoxes: [],
            classes: [],

            imageUrl: "",
            imageSize: { width: 0, height: 0 },

            isImageLoaded: false,
            isLoadingModel: false,
            isPredicting: false,
            isPredicted: false,
            isLoading: false,

            detectionTime: 0,
        };
    },
    methods: {
        CreateBBoxUrlData,

        _fileInputChanged(event) {
            const file = event.target.files[0];
            this.imageUrl = URL.createObjectURL(file);
            if (this.imageUrl != "") this.isImageLoaded = true;
        },
        async _detectBtnPressed() {
            const timeStart = Date.now();
            this.isPredicting = true;
            this.isPredicted = false;
            this.isLoading = true;
            const image = document.getElementById("predict-image");

            this.detectResult = new DetectionResult(
                await this.objDetect.detect(image, 0.5)
            );

            if (this.detectResult?.length > 0) {
                this.renderBoundingBox();
                this.isPredicted = true;
                const timeEnd = Date.now();
                this.detectionTime = timeEnd - timeStart;
                console.log("Time", this.detectionTime);
            }
            this.isLoading = false;
            this.isPredicting = false;
        },
        _resetBtnPressed() {
            this.$refs.ref_image_input.value = null;
            this.boundingBoxes = [];
            this.detectResult = null;
            this.imageUrl = "";
            this.isImageLoaded = false;
            this.isPredicted = false;
            this.detectionTime = 0;
        },
        _imageLoaded(e) {
            const { width, height } = e.target;
            const parent = document
                .getElementById("image_wrapper")
                .getBoundingClientRect();

            if (width < parent.width && height < parent.height) {
                document.getElementById("predict-image").classList.add("h-100");
            }
            const image = document.getElementById("predict-image");
            this.imageSize = {
                width: image.naturalWidth,
                height: image.naturalHeight,
            };
        },
        _toggleVisiblityPressed(index) {
            const isVisible = this.boundingBoxes[index].isVisible;
            this.boundingBoxes[index].isVisible = !isVisible;
        },
        renderBoundingBox() {
            this.boundingBoxes = [];

            if (this.detectResult.length < 1) {
                return;
            }
            this.detectResult.invoice.forEach((e) => {
                const bbox_data = this.CreateBBoxUrlData(
                    "temp-canvas",
                    e,
                    this.imageSize
                );
                this.boundingBoxes.push({ bbox_data, isVisible: true });
            });
        },
    },
    computed: {
        invoice() {
            if (!this.detectResult) return [];

            return this.detectResult.invoice;
        },
        invoiceDetails() {
            if (!this.detectResult) return { items: 0, total: 0 };

            return {
                items: this.detectResult.length,
                total: this.detectResult.invoiceTotal,
            };
        },
        groupedInvoice() {
            if (!this.detectResult) return [];

            return this.detectResult.groupedInvoice;
        },
    },
    async mounted() {
        this.isPredicted = false;
        this.isLoading = true;

        this.objDetect = new ObjectDetection({
            model_url: BASE_URL + "model/model.json",
            classes_url: BASE_URL + "product_data.json",
            detection_threshold: 0.5,
        });

        // Loading Classes
        this.classes = await this.objDetect.loadClasses();

        // Loading Model
        this.isLoadingModel = true;
        await this.objDetect.loadModel();

        this.isLoadingModel = false;
        this.isLoading = false;
    },
};
</script>

<style>
@import "./style.css";
</style>