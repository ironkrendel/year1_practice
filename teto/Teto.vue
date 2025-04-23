<script lang="ts" setup>
import Button from "primevue/button";
import Menubar from 'primevue/menubar';
import { ref } from "vue";
import { toggleDarkMode } from '../src/components/darkmodeToggle.vue';
import DarkModeBtn from "../src/components/darkmodeBtn.vue";
import ScrollTop from 'primevue/scrolltop';

if (localStorage.getItem('dark-mode') == "true") {
  toggleDarkMode();
}
</script>

<template>
  <Menubar style="position: sticky;top: 0px;z-index: 100;width: 100%;">
    <template #start>
      <Button as="a" icon="pi pi-chevron-left" href="/"></Button>
    </template>
    <template #end>
      <DarkModeBtn></DarkModeBtn>
    </template>
  </Menubar>
  <ScrollTop></ScrollTop>
  <div class="w-full">
    <img v-for="item in items" :src="item.img" class="inline-block">
  </div>
</template>

<style scoped>
  Button {
    margin: 10px;
  }
</style>

<script lang="ts">
let items = ref([]);
for (let i = 0;i < 1000;i++) {
  items.value.push({
    img: '/favicon.ico',
  });
}

export default {
  created() {
    window.addEventListener("resize", this.resizeEvent);
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeEvent);
  },
  methods: {
    resizeEvent() {
      
    }
  },
}
</script>