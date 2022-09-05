<template>
    <!-- File Input Instances -->
    <input type="file" name="image_input" 
        ref="ref_image_input"
        id="image_input" 
        @change="fileChanged" 
        accept="image/jpg, image/jpeg, image/png">

    <div class="card flex-row main-container" >
        <div class="flex-col w-50 grey darken-2">
            <div id="image_wrapper" class="image-wrapper flex-fill">
                                        
                <!-- Image Shown -->
                <img id="predict-image" :src="image_url" alt="Image" v-show="isImageLoaded" @load="ImageLoad">
                <img :src="item" :alt="index" 
                    v-for="(item, index) in detectionBox" :key="index"
                    v-show="isPredicted && (!detection[index].hide)">

                <span class="image-title" v-if="isPredicted">
                    <a class="btn btn-small mr-2" 
                        v-for="(item, index) in groupedItems"
                        :key="index"
                        :style="'background-color: '+item.color"
                        @click="hideDetection(item.id)">

                        <span class="valign-wrapper">
                            <i class="material-icons mr-2">close</i>
                            {{ item.name }} ({{ item.count }})
                        </span>
                    </a>
                </span>

                <!-- Predicted Mask -->
                <div class="predicted-mask" v-show="isPredicted">
                    <canvas id="prediction-result" v-show="false"></canvas>
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
                                    <th class="col-accuracy"><span class="text">Akurasi</span></th>
                                    <th class="col-price"><span class="text">Harga</span></th>
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
                                <tr v-else v-for="(item, index) in detection" :key="index">
                                    <td class="col-num">{{ index+1 }}</td>
                                    <td class="col-title">{{ item.class.name }}</td>
                                    <td class="col-accuracy">{{ parseFloat(item.score*100).toFixed(1) }}%</td>
                                    <td class="col-price">Rp.{{ numFormat(item.class.price, 0, 3) }}</td>
                                    
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
                    :class="{'disabled': !isImageLoaded || isPredicted}">
                    <span class="valign-wrapper">
                        <i class="material-icons mr-2">filter_center_focus</i>
                        Deteksi
                    </span>
                </a>

                <!-- Checkout Button -->
                <a class="btn waves-effect waves-light mx-1" v-show="false" @click="debig">
                    <span class="valign-wrapper">
                        <i class="material-icons mr-2">shopping_cart</i>
                        Checkout
                    </span>
                </a>
                
                <!-- Reset Button -->
                <a class="btn waves-effect waves-light blue mx-1" @click="clearImage"
                    :class="{'disabled': !isImageLoaded}">
                    <span class="valign-wrapper">
                        <i class="material-icons mr-2">cached</i>
                        Reset
                    </span>
                </a>
                
                <span v-if="predictionTime">
                    <i>Waktu Deteksi : {{predictionTime}} ms</i>
                </span>

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
            detection: [],
            detectionBox: [],

            image_url: "",
            imageSize: { width: 0, height: 0 },
            isImageLoaded: false,

            isPredicting: false,
            invoice: [],
            isPredicted: false,
            isLoading: false,
            classes: [],
            base_url: './',
            predictionTime: undefined,
        };
    },
    watch: {
        detection(newVal){
            // console.log('detected',newVal)
            this.detectionBox = []
            for (let i = 0; i < newVal.length || 0; i++){
                const item = newVal[i]
                this.detectionBox.push(this.renderBoundingBox(item))
            }
            // console.log("boxes",this.detectionBox)
        }
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
            const timeStart = Date.now()
            this.isPredicting = true
            this.isPredicted = false;
            this.isLoading = true;
            const image = document.getElementById("predict-image");

            if (!this.isModelLoaded)
                return 

            const predictions = await this.model.executeAsync(
                await Predict.preprocessImg(image)
            );

            const detectionObjects = Predict.getDetectionObjects(
                predictions, 0.5, this.classes, image
            );
            if (detectionObjects.length > 0) {
                console.log("object detected", detectionObjects);
                this.addInvoiceItems(detectionObjects);
                this.detection = detectionObjects
                this.isPredicted = true;
                const timeEnd = Date.now()
                const predict_time = timeEnd - timeStart
                this.predictionTime = predict_time
                console.log({predict_time})
            }
            this.isLoading = false
            this.isPredicting = false
        },
        clearImage(){
            this.detection = []
            this.$refs.ref_image_input.value = null
            this.image_url = ""
            this.isImageLoaded = false
            this.imageSize = { width: 0, height: 0 }
            this.isPredicted = false
            this.invoice = []
            this.predictionTime = undefined
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
        },
        renderBoundingBox(item){
            const canvas  = document.getElementById("prediction-result");
            const image = document.getElementById("predict-image");

            canvas.width = image.offsetWidth;
            canvas.height = image.offsetHeight;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Font options.
            const font = "16px sans-serif";
            ctx.font = font;
            ctx.textBaseline = "top";

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
            return canvas.toDataURL('image/png')
        },
        hideDetection(classId){
            this.detection.forEach(e => {
                if (e.class.id == classId)
                    e.hide = !(e.hide || false)
            })
        }
    },
    computed: {
        invoiceDetails() {
            return {
                items: this.detection.length,
                total: this.groupedItems.reduce(
                    (sum, item) => sum + item.price * item.count,
                    0
                ),
            };
        },
        isModelLoaded() {
            return this.model != null;
        },
        groupedItems(){
            let arr = []
            for (let i = 0; i < this.detection.length; i++){
                let isExists = false
                for (let j = 0; j < arr.length; j++) {
                    if (arr[j].id == this.detection[i].class.id){
                        isExists = true
                        arr[j].count++
                    }
                }
                if (!isExists){
                    arr.push({...this.detection[i].class, count: 1})
                } 
            }
            return arr
        },
    },
    async mounted() {
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