<script lang="ts" setup>
import Button from "primevue/button";
import { toggleDarkMode, getDarkModeIcon, getDarkModeEnabled } from '/src/components/darkmodeToggle.vue';
import 'primeicons/primeicons.css'
import { watch, ref } from "vue";

const model = defineModel();
model.value = getDarkModeIcon();

const darkModeFlag = ref(getDarkModeEnabled());

function update() {
    toggleDarkMode();
    model.value = getDarkModeIcon();
    darkModeFlag.value = getDarkModeEnabled();
}
</script>

<template>
    <Button v-ripple @click="update" :icon="model"></Button>
</template>