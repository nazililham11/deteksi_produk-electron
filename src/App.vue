<template>
    <!-- File Input Instances -->
    <input type="file" name="image_input" id="image_input" @change="fileChanged" accept="image/jpg, image/jpeg, image/png">

    <div class="card flex-row main-container" >
        <div class="flex-col w-50 grey darken-2">
            <div id="image_wrapper" class="image-wrapper flex-fill">
                                        
                <!-- Image Shown -->
                <img id="predict-image" :src="image_url" alt="Image" v-show="isImageLoaded" @load="ImageLoad">
                <span class="image-title" v-show="false">
                    <a class="btn red" @click="clearImage">
                        <span class="valign-wrapper">
                            <i class="material-icons mr-2">close</i>
                            Reset Gambar
                        </span>
                    </a>
                </span>

                <!-- Predicted Mask -->
                <div class="predicted-mask" v-show="isPredicted">
                    <canvas id="prediction-result"></canvas>
                </div>

                <!-- Loading Mask -->
                <div class="loading-mask white-text" v-show="isPredicting">
                        <div class="preloader-wrapper big active">
                        <div class="spinner-layer spinner-blue-only">
                            <div class="circle-clipper left">
                                <div class="circle"></div>
                            </div><div class="gap-patch">
                                <div class="circle"></div>
                            </div><div class="circle-clipper right">
                                <div class="circle"></div>
                            </div>
                        </div>
                    </div>
                    <h6>Memproses</h6>
                </div>
                
                <!-- Insert Image -->
                <div class="flex-col insert-image" v-show="!isImageLoaded">
                    <i class="material-icons grey-text text-darken-3">add_a_photo</i>

                    <a class="btn waves-effect waves-light">
                        <label class="valign-wrapper white-text" for="image_input" style="font-size: 14px">
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
                    <i class="material-icons mr-2" v-if="!isLoadingModel">check_circle</i>
                    <span class="loader mr-2" v-else></span>
                    <span>{{ isLoadingModel ? "Loading Model" : "Models Loaded" }}</span>
                </h6>

                <!-- Total -->
                <div class="right-align grey-text text-darken-3 invoice-total">
                    <h6>Total</h6>
                    <h3>Rp.{{ numFormat(invoiceDetails.total, 2, 3) }}-</h3>
                </div>

                <div class="divider grey darken-3 my-4"></div>

                <!-- Invaice Table -->
                <div id="table-wrapper">
                    <div id="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th class="col-num"><span class="text"></span></th>
                                    <th class="col-title"><span class="text">Nama Item</span></th>
                                    <th class="col-qty"><span class="text">Qty</span></th>
                                    <th class="col-price"><span class="text">Harga</span></th>
                                    <th class="col-total"><span class="text">Total</span></th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr v-if="!invoice.length">
                                    <td class="center-align grey-text" colspan="5">
                                        <i class="material-icons" style="font-size: 5rem">production_quantity_limits</i>
                                        <h5 style="font-size: 1.64rem">
                                            Tidak ada barang
                                        </h5>
                                    </td>
                                </tr>
                                <tr v-else v-for="(item, index) in invoice" :key="index">
                                    <td class="col-num">{{ index+1 }}</td>
                                    <td class="col-title">{{ item.name }}</td>
                                    <td class="col-qty">{{ item.quantity }}</td>
                                    <td class="col-price">Rp.{{ numFormat(item.price, 0, 3) }}</td>
                                    <td class="col-total">Rp.{{ numFormat(item.quantity * item.price, 0, 3) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>


            </div>

            <div class="card-action">
                
                <!-- Cancel Prediction Button -->
                <a class="btn waves-effect waves-light mx-1 red" v-if="isPredicting">
                    <span class="valign-wrapper">
                        <i class="material-icons mr-2">close</i>
                        Batal
                    </span>
                </a>

                <!-- Prediction Button -->
                <a class="btn waves-effect waves-light mx-1" @click="predict" v-else
                    :class="{'disabled': isPredicting}">
                    <span class="valign-wrapper">
                        <i class="material-icons mr-2">filter_center_focus</i>
                        Deteksi
                    </span>
                </a>

                <!-- Checkout Button -->
                <a class="btn waves-effect waves-light mx-1" v-show="false">
                    <span class="valign-wrapper">
                        <i class="material-icons mr-2">shopping_cart</i>
                        Checkout
                    </span>
                </a>
                
                <!-- Reset Button -->
                <a class="btn waves-effect waves-light blue mx-1" @click="clearImage">
                    <span class="valign-wrapper">
                        <i class="material-icons mr-2">cached</i>
                        Reset
                    </span>
                </a>

            </div>
        </div>
    </div>
</template>

<script>
import * as Predict from "./plugins/Predict.js";

export default {
    name: "App",
    data() {
        return {
            model: null,
            isLoadingModel: false,
            
            image_url: "",
            imageSize: { width: 0, height: 0 },
            isImageLoaded: false,
            isImageValid: false,

            isPredicting: false,
            invoice: [],
            isPredicted: false,
            isLoading: false,
            classes: [],
            base_url: '/',
        };
    },
    methods: {
        async loadModel() {
            this.isLoadingModel = true
            this.model = Object.freeze(await Predict.loadModel(this.base_url+"model/model.json"));
            this.isLoadingModel = false
        },
        async loadClasses() {
            this.classes = await fetch(this.base_url+"product_data.json").then((r) => {
                return r.json();
            });
        },
        init() {
            this.isPredicted = false;
            this.image_url = this.base_url+"product.png";
        },

        addInvoiceItems(items) {
            items.forEach((item) => {
                let itemExist = false;
                for (let index = 0; index < this.invoice.length; index++) {
                    if (item.class.id == this.invoice[index].id) {
                        itemExist = true;
                        this.invoice[index].quantity++;
                        // this.invoice[index].price += item.class.price;
                        break;
                    }
                }
                if (!itemExist) {
                    this.invoice.push({ ...item.class, quantity: 1 });
                }
            });
        },

        deleteInvoice(index) {
            if (this.invoice.length > -1) {
                this.invoice.splice(index, 1);
            }
        },

        // File methods
        fileChanged(event) {
            const file = event.target.files[0];
            this.image_url = URL.createObjectURL(file);
            if (this.image_url != "")
                this.isImageLoaded = true
        },

        // Prediction
        async predict() {
            this.isPredicting = true
            this.isPredicted = false;
            this.isLoading = true;
            const image = document.getElementById("predict-image");
            const canvas = document.getElementById("prediction-result");

            if (!this.isModelLoaded)
                return 

            const predictions = await this.model.executeAsync(
                await Predict.preprocessImg(image)
            );

            const detectionObjects = Predict.getDetectionObjects(
                predictions, 0.5, this.classes, image
            );
            console.log({detectionObjects})
            if (detectionObjects.length > 0) {
                console.log("object detected", detectionObjects.length);
                this.addInvoiceItems(detectionObjects);
                Predict.renderPredictions(detectionObjects, canvas, image);
                this.isPredicted = true;
            }
            this.isLoading = false
            this.isPredicting = false
        },
        clearImage(){
            this.image_url = ""
            this.isImageLoaded = false
            this.isImageValid = false
            this.imageSize = { width: 0, height: 0 }
            this.isPredicted = false
            this.invoice = []
        },
        ImageLoad(e){
            const { width, height } = e.target
            const parent = document.getElementById('image_wrapper').getBoundingClientRect()
            if (width < parent.width && height < parent.height){
                document.getElementById('predict-image').classList.add("h-100");
            }
            this.imageSize
        },
        numFormat(val, n, x){
            if (isNaN(val))
                return '-'
            var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
            return val.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
        }
    },
    computed: {
        invoiceDetails() {
            return {
                items: this.invoice.length,
                total: this.invoice.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                ),
            };
        },
        isModelLoaded() {
            return this.model != null;
        },
    },
    async mounted() {
        console.log(Predict);
        this.init();
        this.isLoading = true;
        await this.loadModel();
        await this.loadClasses();
        this.isLoading = false;
    },
};
</script>

<style>
@import './style.css';
</style>