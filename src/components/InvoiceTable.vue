<template>
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
                
                <tr v-if="!tableData.length">
                    <td class="center-align grey-text" colspan="5">
                        <i class="material-icons" style="font-size: 5rem">
                            production_quantity_limits
                        </i>
                        <h5 style="font-size: 1.64rem">
                            Tidak ada barang
                        </h5>
                    </td>
                </tr>

                <tr v-else v-for="(item, index) in tableData" :key="index">
                    <td class="col-num">{{ index+1 }}</td>
                    <td class="col-title">{{ item.class.name }}</td>
                    <td class="col-accuracy">{{ AccuracyFormat(item.score) }}</td>
                    <td class="col-price">{{ PriceFormat(item.class.price) }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
</template>

<script>
import { AccuracyFormat, PriceFormat } from './../plugins/Helper'

export default {
    props: {
        tableData: Array
    },
    methods: {
        AccuracyFormat,
        PriceFormat,
    }
}
</script>

<style>

</style>