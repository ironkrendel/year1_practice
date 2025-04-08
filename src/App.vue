<script lang="ts" setup>
import Button from "primevue/button";
import Menubar from 'primevue/menubar';
import Chart from 'primevue/chart';
import ScrollTop from 'primevue/scrolltop';
import { ref, Vue, inject } from "vue";
import VueCookies from 'vue-cookies';
import { toggleDarkMode, getDarkModeIcon } from '/src/components/darkmodeToggle.vue';
import dataset from "/data/test_data.json";
import DarkModeBtn from "./components/darkmodeBtn.vue";
import InputText from 'primevue/inputtext';
import Avatar from 'primevue/avatar';

if (localStorage.getItem('dark-mode') == "true") {
  toggleDarkMode();
}

const items = ref([
  {
    label: "teto???",
    href: '/teto/',
  },
]);

let chartData = [

];

for (let i in dataset) {
  if (dataset[i]['serial'] != "04" || dataset[i]['uName'] != 'Hydra-Lite') {
    continue;
  }
  if (dataset[i]['data']['weather_temp'] != null) {
    chartData.push({ x: dataset[i]['Date'], y: dataset[i]['data']['weather_temp'] });
  }
  else if (dataset[i]['data']['BME280_temp'] != null) {
    chartData.push({ x: dataset[i]['Date'], y: dataset[i]['data']['BME280_temp'] });
  }
}

const data = {
  labels: chartData.map(row => row.x),
  datasets: [
    {
      label: "Temp",
      data: chartData.map(row => row.y),
      lineTension: 0.25,
    },
  ],
};

function updateGraphStyle(e) {
  chartOptions.value = setChartOptions();
}
</script>

<template>

  <body>
    <Menubar :model="items" style="position: sticky;top: 0px;z-index: 100;width: 100%;">
      <template #item="{ item, props, hasSubmenu }">
        <a v-ripple :href="item.href" v-bind="props.action">
          <span>{{ item.label }}</span>
        </a>
      </template>
      <template #end>
        <div style="display: flex;column-gap: 0.25vw;justify-content: space-between;">
          <DarkModeBtn @update:model-value="updateGraphStyle"></DarkModeBtn>
          <Button icon="pi pi-cog"></Button>
        </div>
      </template>
    </Menubar>
    <ScrollTop></ScrollTop>
    <div style="align-items: center;width: 100%;">
      <Chart ref="graphTest" type="line" :data="data" class="h-[30rem]" :options="chartOptions"
        style="width:70%;margin: auto;"></Chart>
    </div>
    <div id="Top" style="position: absolute;top: 0px;"></div>
    <h1 id="Pearto" style="font-size: 150px;margin-top: 5000px;">Pearto</h1>
  </body>
</template>

<script lang="ts">
const chartOptions = ref();

export default {
  created() {
    chartOptions.value = setChartOptions();
    window.addEventListener("resize", this.resizeEvent);
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeEvent);
  },
  methods: {
    resizeEvent(e) {
      this.$refs.graphTest.reinit();
    }
  },
}
const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--p-text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

  return {
    // maintainAspectRatio: false,
    // aspectRatio: 0.6,
    plugins: {
      legend: {
        labels: {
          color: textColor
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      },
      y: {
        ticks: {
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      }
    }
  };
}
</script>