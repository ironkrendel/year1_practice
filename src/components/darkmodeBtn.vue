<script lang="ts" setup>
import Button from "primevue/button";
import toggleDarkMode from '/src/components/darkmodeToggle.vue';
import getDarkModeIcon from '/src/components/darkmodeToggle.vue';
import getDarkModeEnabled from '/src/components/darkmodeToggle.vue';
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
    <Button v-ripple @click="update" :icon="model"></Button>
</template>