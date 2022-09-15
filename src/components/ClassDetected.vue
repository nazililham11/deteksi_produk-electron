<template>
    <div class="classes p-3">
        <div
            class="btn btn-sm btn-secondary m-1"
            v-for="(item, index) in detectedClasses"
            @click="itemPressed(index)"
            :key="index"
            :style="
                item.isVisible
                    ? [
                          '--bs-btn-bg:' + item.color,
                          '--bs-btn-color:' + item.font_color,
                          '--bs-btn-border-color:' + item.color,
                      ]
                    : []
            "
        >
            <i class="material-icons me-2" v-if="item.isVisible">visibility</i>
            <i class="material-icons me-2" v-else>visibility_off</i>
            {{ `${item.name} ( ${item.quantity} )` }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        detectedClasses: Array
    },
    methods: {
        itemPressed(index){
             this.$emit('itemPressed', index)
        }
    }
};
</script>

<style>
</style>