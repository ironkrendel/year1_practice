<script lang="ts" setup>
import Button from "primevue/button";
import { toggleDarkMode } from './darkmodeToggle.vue';
import { getDarkModeIcon } from './darkmodeToggle.vue';
import { getDarkModeEnabled } from './darkmodeToggle.vue';
import 'primeicons/primeicons.css'
import { ref } from "vue";

const model: any = defineModel();
model.value = getDarkModeIcon();

const darkModeFlag = ref(getDarkModeEnabled());

function update() {
    toggleDarkMode();
    model.value = getDarkModeIcon();
    darkModeFlag.value = getDarkModeEnabled();
}
</script>

<template>
    <Button @click="update" :icon="model"></Button>
</template>