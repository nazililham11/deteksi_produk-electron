<template>
<div class="right-align grey-text text-darken-3 invoice-total">
    <h6>Total</h6>
    <h3>{{ PriceFormat(price, 2) }}-</h3>
</div>
</template>

<script>
import { PriceFormat } from './../plugins/Helper'

export default {
    props: {
        price: Number 
    },
    methods: {
        PriceFormat
    }
}
</script>

<style>

</style>