<script setup>
import BitByBitComponent from "./BitByBitComponent.vue"
</script>
<template>
    <ClientOnly fallback-tag="span" fallback="Loading bitbybit...">
        <BitByBitComponent />
    </ClientOnly>
</template>

<style>
html, body {
    margin: 0;
    padding: 0;
    overflow: hidden;
}
</style>

