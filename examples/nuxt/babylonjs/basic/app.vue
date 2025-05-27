<script setup>
import BitByBitComponent from "./BitByBitComponent.vue"
</script>
<template>
    <div>
        <ClientOnly fallback-tag="span" fallback="Loading bitbybit...">
            <BitByBitComponent />
        </ClientOnly>
    </div>
</template>

