<script lang="ts" setup>
import Button from "primevue/button";
import Menubar from 'primevue/menubar';
import { ref } from "vue";
import VueCookies from 'vue-cookies';
import { toggleDarkMode } from '/src/components/darkmodeToggle.vue';
import DarkModeBtn from "/src/components/darkmodeBtn.vue";

if (localStorage.getItem('dark-mode') == "true") {
  toggleDarkMode();
}
</script>

<template>
  <Menubar style="position: sticky;top: 0px;z-index: 100;">
    <template #start>
      <DarkModeBtn></DarkModeBtn>
      <Button as="a" label="Back" href="/"></Button>
    </template>
  </Menubar>
  <br>
  <div>
    <img v-for="item in items" :src="item.img">
  </div>
</template>

<style scoped>
  Button {
    margin: 10px;
  }
</style>

<script lang="ts">
let items = ref([]);
for (let i = 0;i < 10000;i++) {
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
  }
}
</script>