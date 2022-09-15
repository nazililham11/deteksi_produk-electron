<template>
    <div
        class="table-responsive flex-fill"
        style="max-height: 35rem; overflow-y: auto"
    >
        <table class="table table-striped">
            <thead>
                <tr>
                    <th class="col-num"><span class="text"></span></th>
                    <th class="col-title">
                        <span class="text">Nama Item</span>
                    </th>
                    <th class="col-accuracy">
                        <span class="text">Akurasi</span>
                    </th>
                    <th class="col-price"><span class="text">Harga</span></th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="!tableData.length">
                    <td colspan="5" style="box-shadow: none">
                        <div class="d-flex flex-column align-items-center my-5">
                            <i
                                class="text-secondary material-icons"
                                style="font-size: 3rem"
                            >
                                production_quantity_limits
                            </i>
                            <h5
                                class="text-secondary"
                                style="font-size: 1.5rem"
                            >
                                Tidak ada barang
                            </h5>
                        </div>
                    </td>
                </tr>
                <tr v-else v-for="(item, index) in tableData" :key="index">
                    <td class="col-num">{{ index + 1 }}</td>
                    <td class="col-title">{{ item.class.name }}</td>
                    <td class="col-accuracy">
                        {{ AccuracyFormat(item.score) }}
                    </td>
                    <td class="col-price">
                        {{ PriceFormat(item.class.price) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { AccuracyFormat, PriceFormat } from "./../plugins/Helper";

export default {
    props: {
        tableData: Array,
    },
    methods: {
        AccuracyFormat,
        PriceFormat,
    },
};
</script>

<style>
td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.col-num {
    min-width: 10%;
}

.col-title {
    min-width: 55%;
}

.col-price {
    min-width: 25%;
}

.col-accuracy {
    min-width: 10%;
}

.col-total {
    min-width: 0%;
}
</style>