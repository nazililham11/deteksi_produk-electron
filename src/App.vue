<template>
    <div class="container-fluid">
        <!-- Predicted Result (Hidden Instances) -->
        <canvas id="temp-canvas" v-show="false"></canvas>

        <!-- File Input Instances (Hidden Instances) -->
        <input
            type="file"
            v-show="false"
            name="image_input"
            ref="ref_image_input"
            id="image_input"
            @change="_fileInputChanged"
            accept="image/jpg, image/jpeg, image/png"
        />

        <div class="card m-3 shadow">
            <div class="row g-0 card-root" style="min-height: 35rem">
                <div class="col-md-6 col-12 bg-dark img-container">
                    <!-- Image -->
                    <img
                        id="predict-image"
                        alt="Image"
                        v-show="isImageLoaded"
                        class="img-fluid"
                        :src="imageUrl"
                    />

                    <!-- Bounding Boxes -->
                    <img
                        :src="item.bbox_data"
                        :alt="index"
                        :key="index"
                        v-for="(item, index) in boundingBoxes"
                        v-show="item.isVisible"
                    />

                    <!-- Image Input Button -->
                    <div class="image-input" v-if="!isImageLoaded">
                        <i class="material-icons text-white my-2">
                            add_a_photo
                        </i>
                        <label for="image_input">
                            <a class="btn btn-success">
                                <i class="material-icons me-2">add</i>
                                Input Gambar
                            </a>
                        </label>
                    </div>

                    <!-- Class Detected -->
                    <ClassDetected
                        :detectedClasses="detectedClasses"
                        @itemPressed="_toggleVisiblityPressed"
                    />

                    <!-- Loading -->
                    <div class="loading-mask" v-if="isPredicting">
                        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <span class="text-white">
                            Memproses
                        </span>
                    </div>
                </div>

                <div class="col-md-6 col-12 d-flex flex-column p-3">
                    <!-- Model Status -->
                    <ModelStatus :isLoadingModel="isLoadingModel" />

                    <!-- Total -->
                    <span class="text-end">Total</span>
                    <h1 class="text-end">
                        {{ PriceFormat(invoiceDetails.total, 2) }}-
                    </h1>

                    <hr />

                    <!-- Invoice Table -->
                    <InvoiceTable :tableData="invoice" />

                    <!-- Buttons -->
                    <div class="d-flex flex-row align-items-center">
                        <!-- Detect Button -->
                        <button
                            class="btn btn-primary me-2"
                            @click="_detectBtnPressed"
                            :class="{ disabled: !isImageLoaded || isPredicted }"
                        >
                            <i class="material-icons me-2"
                                >filter_center_focus</i
                            >
                            Deteksi
                        </button>

                        <!-- Reset Button -->
                        <button
                            class="btn btn-danger me-2"
                            @click="_resetBtnPressed"
                            :class="{ disabled: !isImageLoaded }"
                        >
                            <i class="material-icons me-2">cached</i>
                            Reset
                        </button>

                        <!-- Detection Time -->
                        <i class="flex-fill text-end" v-if="detectionTime">
                            <i class="material-icons me-2">timer</i>
                            <span class="fs-6">{{ detectionTime }} ms</span>
                        </i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const BASE_URL = "./";

import InvoiceTable from "./components/InvoiceTable.vue";
import ModelStatus from "./components/ModelStatus.vue";
import ClassDetected from "./components/ClassDetected.vue";

import { CreateBBoxUrlData, PriceFormat } from "./plugins/Helper";
import ObjectDetection from "./plugins/ObjectDetection";
import DetectionResult from "./plugins/DetectionResult";

export default {
    name: "App",
    components: {
        InvoiceTable,
        ModelStatus,
        ClassDetected,
    },
    data() {
        return {
            objDetect: null,
            detectResult: null,
            boundingBoxes: [],
            classes: [],
            detectedClasses: [],

            imageUrl: "",
            imageSize: { width: 0, height: 0 },

            isImageLoaded: false,
            isLoadingModel: false,
            isPredicting: false,
            isPredicted: false,

            detectionTime: 0,
        };
    },
    methods: {
        CreateBBoxUrlData,
        PriceFormat,

        _fileInputChanged(event) {
            const file = event.target.files[0];
            this.imageUrl = URL.createObjectURL(file);
            if (this.imageUrl != "") this.isImageLoaded = true;
        },
        async _detectBtnPressed() {
            const timeStart = Date.now();
            const image = document.getElementById("predict-image");

            this.isPredicting = true;
            this.isPredicted = false;

            this.detectResult = new DetectionResult(
                await this.objDetect.detect(image, 0.5)
            );

            if (this.detectResult?.length > 0) {
                this.renderBoundingBox();
                this.isPredicted = true;

                const timeEnd = Date.now();
                this.detectionTime = timeEnd - timeStart;
                console.log("Time", this.detectionTime);
            } else {
                alert("Tidak terdeteksi produk");
            }
            this.isPredicting = false;
        },
        _resetBtnPressed() {
            this.$refs.ref_image_input.value = null;
            this.boundingBoxes = [];
            this.detectedClasses = [];
            this.detectResult = null;
            this.imageUrl = "";
            this.isImageLoaded = false;
            this.isPredicted = false;
            this.detectionTime = 0;
        },
        _toggleVisiblityPressed(index) {
            const class_id = this.detectedClasses[index].id;
            const isVisible = this.detectedClasses[index].isVisible;
            this.detectedClasses[index].isVisible = !isVisible;
            this.boundingBoxes.forEach((bbox, i) => {
                if (bbox.class_id == class_id) {
                    this.boundingBoxes[i].isVisible = !isVisible;
                }
            });
        },
        renderBoundingBox() {
            this.boundingBoxes = [];

            if (this.detectResult.length < 1) {
                return;
            }
            const image = document.getElementById("predict-image");
            this.detectedClasses = this.groupedInvoice.map((item) => ({
                ...item,
                isVisible: true,
            }));

            this.detectResult.invoice.forEach((item) => {
                const bbox_data = this.CreateBBoxUrlData(
                    "temp-canvas",
                    item,
                    image
                );

                this.boundingBoxes.push({
                    class_id: item.class.id,
                    bbox_data,
                    isVisible: true,
                });
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

        this.objDetect = new ObjectDetection({
            model_url: BASE_URL + "model/model.json",
            classes_url: BASE_URL + "product_data.json",
        });

        this.isLoadingModel = true;

        this.classes = await this.objDetect.loadClasses();
        await this.objDetect.loadModel();
        
        this.isLoadingModel = false;
    },
};
</script>

<style>
@import "./style.css";
</style>