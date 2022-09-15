<template>
    <span
        class="align-middle"
        :class="isLoadingModel ? 'text-warning' : 'text-success'"
    >
        <div v-if="isLoadingModel" class="spinner-border spinner-border-sm">
            <span class="visually-hidden">Loading...</span>
        </div>

        <i v-else class="material-icons me-2">check_circle </i>
        <span>{{ isLoadingModel ? " Loading Model" : " Models Loaded" }}</span>
    </span>
</template>

<script>
export default {
    props: {
        isLoadingModel: Boolean,
    },
};
</script>

<style>
</style>