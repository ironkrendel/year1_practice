<script lang="ts" setup>
import Button from "primevue/button";
import { toggleDarkMode, getDarkModeIcon } from '/src/components/darkmodeToggle.vue';
import 'primeicons/primeicons.css'

const model = defineModel();
model.value = getDarkModeIcon();

function update() {
    toggleDarkMode();
    model.value = getDarkModeIcon();
}
</script>

<template>
<Button v-ripple @click="update" :icon="model"></Button>
</template>