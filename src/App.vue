<template>
    <div class="container-fluid p-2" id="container">
        <!-- Header -->
        <div class="row p-2 d-none">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex flex-row align-items-center">
                            <div class="card-title flex-fill">Header</div>
                            <div class="btn btn-outline-primary">Checkout</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row p-2">
            <!-- Left panel -->
            <div class="col-6">
                <!-- Add from image -->
                <div class="card">
                    <div class="card-body">
                        <div class="card-title">Deteksi gambar</div>
                        <hr />

                        <!-- Image -->
                        <div
                            class="
                                d-flex
                                align-items-center
                                justify-content-center
                                m-1
                            "
                        >
                            <img
                                v-show="!isPredicted"
                                class="img-fluid"
                                :src="image_url"
                                id="predict-image"
                                alt="Product Image"
                            />
                            <canvas
                                v-show="isPredicted"
                                class="img-fluid"
                                id="prediction-result"
                            ></canvas>
                        </div>

                        <!-- Buttons -->
                        <div class="d-flex flex-column align-items-start">
                            <input
                                class="flex-fill m-1"
                                type="file"
                                @change="fileChanged"
                            />
                            <buttton
                                class="btn btn-outline-primary m-1"
                                :disabled="isLoading"
                                @click="predict"
                            >
                                Deteksi
                            </buttton>
                        </div>
                    </div>
                </div>

                <!-- Manual add -->
                <div class="card d-none">
                    <div class="card-body">
                        <div class="card-title">Manual</div>
                        <hr />
                    </div>
                </div>
            </div>

            <!-- Right panel -->
            <div class="col-6">
                <table class="table table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Produk</th>
                            <th scope="col">Harga</th>
                            <th scope="col">Banyak</th>
                            <th scope="col">Total</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="!invoice.length">
                            <td class="text-center" colspan="5">
                                ---No item---
                            </td>
                        </tr>
                        <tr v-for="(item, index) in invoice" :key="index">
                            <th scope="row">{{ index + 1 }}</th>
                            <td>{{ item.name }}</td>
                            <td>{{ item.price }}</td>
                            <td>{{ item.quantity }}</td>
                            <td>{{ item.price * item.quantity }}</td>
                            <td class="col-fit">
                                <button
                                    class="btn btn-sm btn-danger mx-1"
                                    @click="deleteInvoice(index)"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th scope="col" colspan="4">Total</th>
                            <th scope="col">
                                {{ invoiceDetails.total }}
                            </th>
                        </tr>
                    </tfoot>
                </table>
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
            image_url: "",
            model: null,
            invoice: [],
            isPredicted: false,
            isLoading: false,
            classes: [],
        };
    },
    methods: {
        async loadModel() {
            this.model = Object.freeze(await Predict.loadModel("/model/model.json"));
        },
        async loadClasses() {
            this.classes = await fetch("/product_data.json").then((r) => {
                return r.json();
            });
        },
        init() {
            this.isPredicted = false;
            this.image_url = "/product.png";
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
            this.isPredicted = false;
        },

        // Prediction
        async predict() {
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
                predictions,
                0.5,
                this.classes,
                image
            );

            if (detectionObjects.length > 0) {
                console.log("object detected", detectionObjects.length);
                this.addInvoiceItems(detectionObjects);
                Predict.renderPredictions(detectionObjects, canvas, image);
                this.isPredicted = true;
            }
            this.isLoading = false
        },
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
#container {
    min-width: 1200px;
    overflow: auto;
}
#predict-image,
#prediction-result {
    max-width: 550px;
    max-height: 450px;
}
.col-fit {
    width: 1%;
    white-space: nowrap;
}
</style>