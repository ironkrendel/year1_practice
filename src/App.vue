<script lang="ts" setup>
import Button from "primevue/button";
import Menubar from 'primevue/menubar';
import { ref } from "vue";

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark_mode_flag');
  if (document.documentElement.classList.contains('dark_mode_flag')) {
    localStorage.setItem('dark-mode', "true");
  }
  else {
    localStorage.setItem('dark-mode', "false");
  }
}

if (localStorage.getItem('dark-mode') == "true") {
  toggleDarkMode();
}

const items = ref([
  {
    label: 'Top',
    href: '#Top',
  },
  {
    label: 'Miku',
    href: '#Miku',
  },
  {
    label: 'Pearto',
    href: '#Pearto',
  },
  {
    label: "teto???",
    href: '/teto/',
  },
]);
</script>

<template>
  <div id="Top" style="position: absolute;top: 0px;"></div>
  <Menubar :model="items" style="position: sticky;top: 0px;z-index: 100;">
    <template #start>
      <Button label="Toggle Dark Mode" @click="toggleDarkMode()"></Button>
    </template>
    <template #item="{ item, props, hasSubmenu }" s>
      <a v-ripple :href="item.href" v-bind="props.action">
          <span>{{ item.label }}</span>
      </a>
    </template>
  </Menubar>
  <h1 style="margin-top: 2500px;padding: 30px;font-size: 100px;padding-top: 10vh;" id="Miku">Miku</h1>
  <h1 style="margin-top: 2500px;padding: 30px;font-size: 100px;" id="Pearto">Pearto</h1>
</template>