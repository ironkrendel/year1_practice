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
import DatePicker from 'primevue/datepicker';
import { ConfirmationService, IftaLabelStyle, StepItemStyle } from "primevue";
import ProgressSpinner from 'primevue/progressspinner';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Select from 'primevue/select';
import Toast from 'primevue/toast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import dataFieldSelector from "./components/dataFieldSelector.vue";

if (localStorage.getItem('dark-mode') == "true") {
  toggleDarkMode();
}

const items = ref([
  {
    label: "teto???",
    href: '/teto/',
  },
]);
</script>

<template>

  <body>
    <Toast></Toast>
    <Menubar :model="items" style="position: sticky;top: 0px;z-index: 100;width: 100%;" class="h-15">
      <template #item="{ item, props, hasSubmenu }">
        <a v-ripple :href="item.href" v-bind="props.action">
          <span>{{ item.label }}</span>
        </a>
      </template>
      <template #end>
        <div style="display: flex;column-gap: 0.25vw;justify-content: space-between;">
          <DarkModeBtn @update:model-value="updateGraphStyle"></DarkModeBtn>
          <!-- <Button icon="pi pi-cog"></Button> -->
        </div>
      </template>
    </Menubar>
    <ScrollTop></ScrollTop>
    <div class="justify-center">
      <div class="flex justify-center m-2">
        <div class="block w-auto mx-2">
          <DatePicker ref="startDateTime" showSeconds class="mx-1 w-full" :modelValue="defaultStartDT"
            @update:model-value="updateMinEndDT" showTime></DatePicker>
          <div class="m-1.5 w-full flex justify-center">
            <Button label="-5h" class="m-auto w-auto" @click="startDTMinus5"></Button>
            <Button label="-1h" class="m-auto w-auto" @click="startDTMinus1"></Button>
            <Button label="+1h" class="m-auto w-auto" @click="startDTPlus1"></Button>
            <Button label="+5h" class="m-auto w-auto" @click="startDTPlus5"></Button>
          </div>
        </div>
        <div class="block w-auto mx-2">
          <DatePicker ref="endDateTime" showSeconds class="mx-1 w-full" :modelValue="defaultEndDT" showTime
            :minDate="minEndDT">
          </DatePicker>
          <div class="m-1.5 w-full flex justify-center">
            <Button label="-5h" class="m-auto w-auto" @click="endDTMinus5"></Button>
            <Button label="-1h" class="m-auto w-auto" @click="endDTMinus1"></Button>
            <Button label="+1h" class="m-auto w-auto" @click="endDTPlus1"></Button>
            <Button label="+5h" class="m-auto w-auto" @click="endDTPlus5"></Button>
          </div>
        </div>
      </div>
      <div class="flex justify-center m-2">
        <Button label="Get Data" @click="getData"></Button>
      </div>
      <p v-if="dataNames == null" style="text-align: center;font-size: 50px;margin: auto;">No data</p>
      <div v-else-if='dataNames == "loading"' class="flex justify-center m-2">
        <ProgressSpinner></ProgressSpinner>
      </div>
      <div v-else class="flex justify-center m-2">
        <div ref="fieldSelectorsContainer">
          <!-- <div v-for="i in fieldSelectors" style="display: flex;flex-direction: column;">
            <dataFieldSelector :data="data" ref="dataFields" @update:output="testFunc" :id="i" @delete="removeDataset"></dataFieldSelector>
          </div> -->
          <div ref="lastContainer"></div>
        </div>
      </div>
      <div v-if="dataNames != null && dataNames != 'loading'" class="flex justify-center m-2">
        <Button icon="pi pi-plus" @click="addDataSelector"></Button>
      </div>
      <Chart :data="chartData" ref="dataGraph" class="h-[30rem]" :options="chartOptions"
        style="width:70%;margin: auto;">
      </Chart>
      <DataTable style="width:70%;margin: auto;" :value="minMaxData">
        <Column field="title" header="Field"></Column>
        <Column field="min" header="Min"></Column>
        <Column field="max" header="Max"></Column>
      </DataTable>
    </div>
    <div id="Top" style="position: absolute;top: 0px;"></div>
    <!-- <h1 id="Pearto" style="font-size: 150px;margin-top: 5000px;">Pearto</h1> -->
  </body>
</template>

<script lang="ts">
import { useTemplateRef, defineComponent, createApp } from 'vue';
import PrimeVue from "primevue/config";
import ThemePreset from './components/themePreset.vue';
import Ripple from "primevue/ripple";
import { fileURLToPath } from "url";
import { color } from "chart.js/helpers";
import { useToast } from "primevue/usetoast";

let toast = null;

const chartOptions = ref();
const defaultStartDT = ref(new Date(Date.parse("04/01/2025 00:00:00")));
const defaultEndDT = ref(new Date(Date.parse("04/01/2025 00:00:00")));
const minEndDT = ref(new Date(Date.parse("04/01/2025 00:00:00")));

const data = ref(null);
const dataNames = ref(null);
const selectedUName = ref(null);
const dataSerials = ref(null);
const selectedSerial = ref(null);
const dataFields = ref(null);
const selectedField = ref(null);

const chartDatasets = ref([]);
const chartData = ref({});
const minMaxData = ref([]);

const fieldSelectorsContainer = ref(null);
const lastContainer = ref(null);
const fieldSelectors = ref([]);

const associatedDatasets = ref([]);

const minXVal = ref(0);
const maxXVal = ref(1);

// const startDateTime = useTemplateRef('startDateTime');
let startDateTime = ref(null);
// let endDateTime = useTemplateRef('endDateTime');
let endDateTime = ref(null);
let testDataField = ref(null);

let currentID = 0;

export default {
  created() {
    chartOptions.value = setChartOptions();
    window.addEventListener("resize", this.resizeEvent);
    var currentDate = new Date();
    defaultEndDT.value = currentDate;
    defaultStartDT.value = new Date(currentDate - (1 * 60 * 60 * 1000));
    minEndDT.value = defaultStartDT.value;
  },
  destroyed() {
    window.removeEventListener("resize", this.resizeEvent);
  },
  mounted() {
    startDateTime = useTemplateRef('startDateTime');
    endDateTime = useTemplateRef('endDateTime');
    testDataField = useTemplateRef('testDataField');
    toast = useToast();
    // fieldSelectorsContainer = useTemplateRef('fieldSelectorsContainer');
    // chartOptions.value.options = setChartOptions();
  },
  methods: {
    resizeEvent(e) {
      this.$refs.dataGraph.reinit();
    },
    async getData() {
      this.clearAllDataSelectors();
      data.value = null;
      chartData.value = setChartData();
      chartOptions.value = setChartOptions();
      const options = {
        method: "GET",
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      }
      dataSerials.value = null;
      dataFields.value = null;
      let startDate = new Date(Date.parse(this.$refs.startDateTime.d_value));
      let endDate = new Date(Date.parse(this.$refs.endDateTime.d_value));
      let startYear = startDate.getFullYear().toString().padStart(4, "0");
      let startMonth = (startDate.getMonth() + 1).toString().padStart(2, "0");
      let startDay = startDate.getDate().toString().padStart(2, "0");
      let startHours = startDate.getHours().toString().padStart(2, "0");
      let startMinutes = startDate.getMinutes().toString().padStart(2, "0");
      let startSeconds = startDate.getSeconds().toString().padStart(2, "0");
      let endYear = endDate.getFullYear().toString().padStart(4, "0");
      let endMonth = (endDate.getMonth() + 1).toString().padStart(2, "0");
      let endDay = endDate.getDate().toString().padStart(2, "0");
      let endHours = endDate.getHours().toString().padStart(2, "0");
      let endMinutes = endDate.getMinutes().toString().padStart(2, "0");
      let endSeconds = endDate.getSeconds().toString().padStart(2, "0");
      dataNames.value = "loading";
      let serverResponse = await fetch(`/api/calibr/log/${startYear}-${startMonth}-${startDay}%20${startHours}:${startMinutes}:${startSeconds}/${endYear}-${endMonth}-${endDay}%20${endHours}:${endMinutes}:${endSeconds}/`, options);
      if (serverResponse.status != 200) {
        dataNames.value = null;
        toast.add({ severity: 'error', summary: 'Request Error!', detail: `Error requesting data from the server. Server return code: ${serverResponse.status}.`, life: 5000 });
        return;
      }
      let resp = await serverResponse.json();
      // let resp = (await import('/data/test_data.json')).default;
      data.value = resp;
      let tmp_names = new Set();
      for (let i in Object.keys(resp)) {
        if (resp[i]['uName'] == "NONE") continue;
        tmp_names.add(resp[i]['uName']);
      }
      dataNames.value = [];
      let names_arr = Array.from(tmp_names);
      names_arr.sort();
      for (let i in names_arr) {
        dataNames.value.push({
          name: names_arr[i],
        });
      }
    },
    updateMinEndDT(e) {
      minEndDT.value = e;
      if (this.$refs.endDateTime.d_value < this.$refs.startDateTime.d_value) {
        this.$refs.endDateTime.d_value = this.$refs.startDateTime.d_value;
      }
    },
    updateGraphStyle(e) {
      chartOptions.value = setChartOptions();
    },
    // updateDataSerials(e) {
    //   chartData.value = setChartData();
    //   chartOptions.value = setChartOptions();
    // },
    // updateDataFields(e) {
    //   chartData.value = setChartData();
    //   chartOptions.value = setChartOptions();
    // },
    // updateData(e) {
    //   chartData.value = setChartData();
    //   chartOptions.value = setChartOptions();
    // },
    addDataSelector(e) {
      // fieldSelectors.value.push(currentID++);
      // let testClass = defineComponent(dataFieldSelector);
      // fieldSelectors.value.push(new testClass());
      // console.log(fieldSelectors.value);
      const mountPoint = document.createElement("div");
      // fieldSelectorsContainer.value.appendChild(mountPoint);
      fieldSelectorsContainer.value.insertBefore(mountPoint, lastContainer.value);

      let id = currentID++;
      const app = createApp(dataFieldSelector, {
        data: data.value,
        id: id,
        startDateTime: startDateTime.value.d_value,
        endDateTime: endDateTime.value.d_value,

        onDeleteEmit: (e) => {
          this.removeDataSelector(e);
          chartData.value = setChartData();
        },
        onCloneEmit: (e) => {
          this.cloneDataSelector(e);
          chartData.value = setChartData();
        },
        onUpdateOutput: (e) => {
          this.registerDataset(e);
          chartData.value = setChartData();
        },
      });
      app.use(PrimeVue, {
        theme: {
          preset: ThemePreset.data()['Theme'],
          options: {
            prefix: "p",
            darkModeSelector: ".dark_mode_flag",
            cssLayer: false,
          },
        },
        ripple: true,
      });

      app.directive("ripple", Ripple);
      app.mount(mountPoint);
      fieldSelectors.value.push({ app, mountPoint, id, });
    },
    removeDataSelector(e) {
      for (let i = 0; i < fieldSelectors.value.length; i++) {
        if (fieldSelectors.value[i].id == e.id) {
          fieldSelectors.value[i].app.unmount();
          fieldSelectorsContainer.value.removeChild(fieldSelectors.value[i].mountPoint);
          fieldSelectors.value.splice(i, 1);
          this.deregisterDataset(e);
          break;
        }
      }
    },
    cloneDataSelector(e) {
      let orig_app = null;
      let orig_index = null;
      for (let i = 0; i < fieldSelectors.value.length; i++) {
        if (fieldSelectors.value[i].id == e.id) {
          orig_app = fieldSelectors.value[i].app;
          orig_index = i;
          break;
        }
      }
      if (orig_app == null || orig_index == null) return;
      let id = currentID++;
      const mountPoint = document.createElement("div");
      if (orig_index + 1 >= fieldSelectors.value.length) {
        // fieldSelectorsContainer.value.insertBefore(mountPoint, lastContainer.value);
        fieldSelectorsContainer.value.insertBefore(mountPoint, fieldSelectors.value[orig_index].mountPoint);
      }
      else {
        fieldSelectorsContainer.value.insertBefore(mountPoint, fieldSelectors.value[orig_index].mountPoint);
      }
      const copy_app = createApp(dataFieldSelector, {
        data: data.value,
        id: id,
        startDateTime: startDateTime.value.d_value,
        endDateTime: endDateTime.value.d_value,
        state: e.state,

        onDeleteEmit: (e) => {
          this.removeDataSelector(e);
          chartData.value = setChartData();
        },
        onCloneEmit: (e) => {
          this.cloneDataSelector(e);
          chartData.value = setChartData();
        },
        onUpdateOutput: (e) => {
          this.registerDataset(e);
          chartData.value = setChartData();
        },
      });
      copy_app.use(PrimeVue, {
        theme: {
          preset: ThemePreset.data()['Theme'],
          options: {
            prefix: "p",
            darkModeSelector: ".dark_mode_flag",
            cssLayer: false,
          },
        },
        ripple: true,
      });

      copy_app.directive("ripple", Ripple);
      copy_app.mount(mountPoint);
      // fieldSelectors.value.push({ app: copy_app, mountPoint, id, });
      fieldSelectors.value.splice(orig_index, 0, { app: copy_app, mountPoint, id, });
    },
    clearAllDataSelectors() {
      let ids = [];
      for (let i = 0; i < fieldSelectors.value.length; i++) {
        ids.push(fieldSelectors.value[i].id);
      }
      for (let i = 0; i < ids.length; i++) {
        this.removeDataSelector({ id: ids[i] });
      }
    },
    registerDataset(e) {
      for (let i = 0; i < associatedDatasets.value.length; i++) {
        if (associatedDatasets.value[i].id == e.id) {
          associatedDatasets.value[i] = e;
          return;
        }
      }
      associatedDatasets.value.push(e);
    },
    deregisterDataset(e) {
      for (let i = 0; i < associatedDatasets.value.length; i++) {
        if (associatedDatasets.value[i].id == e.id) {
          associatedDatasets.value.splice(i, 1);
          return;
        }
      }
    },
    startDTMinus5(e) {
      let newDT = new Date(startDateTime.value.d_value - 1000 * 60 * 60 * 5);
      startDateTime.value.d_value = newDT;
      startDateTime.value.currentSecond = newDT.getSeconds();
      startDateTime.value.currentMinute = newDT.getMinutes();
      startDateTime.value.currentHour = newDT.getHours();
      this.updateMinEndDT(startDateTime.value.d_value);
    },
    startDTMinus1(e) {
      let newDT = new Date(startDateTime.value.d_value - 1000 * 60 * 60 * 1);
      startDateTime.value.d_value = newDT;
      startDateTime.value.currentSecond = newDT.getSeconds();
      startDateTime.value.currentMinute = newDT.getMinutes();
      startDateTime.value.currentHour = newDT.getHours();
      this.updateMinEndDT(startDateTime.value.d_value);
    },
    startDTPlus1(e) {
      let newDT = new Date(startDateTime.value.d_value.getTime() + 1000 * 60 * 60 * 1);
      startDateTime.value.d_value = newDT;
      startDateTime.value.currentSecond = newDT.getSeconds();
      startDateTime.value.currentMinute = newDT.getMinutes();
      startDateTime.value.currentHour = newDT.getHours();
      this.updateMinEndDT(startDateTime.value.d_value);
    },
    startDTPlus5(e) {
      let newDT = new Date(startDateTime.value.d_value.getTime() + 1000 * 60 * 60 * 5);
      startDateTime.value.d_value = newDT;
      startDateTime.value.currentSecond = newDT.getSeconds();
      startDateTime.value.currentMinute = newDT.getMinutes();
      startDateTime.value.currentHour = newDT.getHours();
      this.updateMinEndDT(startDateTime.value.d_value);
    },
    endDTMinus5(e) {
      if (endDateTime.value.d_value - 1000 * 60 * 60 * 5 < startDateTime.value.d_value) {
        return;
      }
      let newDT = new Date(endDateTime.value.d_value - 1000 * 60 * 60 * 5);
      endDateTime.value.d_value = newDT;
      endDateTime.value.currentSecond = newDT.getSeconds();
      endDateTime.value.currentMinute = newDT.getMinutes();
      endDateTime.value.currentHour = newDT.getHours();
    },
    endDTMinus1(e) {
      if (endDateTime.value.d_value - 1000 * 60 * 60 * 1 < startDateTime.value.d_value) {
        return;
      }
      let newDT = new Date(endDateTime.value.d_value - 1000 * 60 * 60 * 1);
      endDateTime.value.d_value = newDT;
      endDateTime.value.currentSecond = newDT.getSeconds();
      endDateTime.value.currentMinute = newDT.getMinutes();
      endDateTime.value.currentHour = newDT.getHours();
    },
    endDTPlus1(e) {
      let newDT = new Date(endDateTime.value.d_value.getTime() + 1000 * 60 * 60 * 1);
      endDateTime.value.d_value = newDT;
      endDateTime.value.currentSecond = newDT.getSeconds();
      endDateTime.value.currentMinute = newDT.getMinutes();
      endDateTime.value.currentHour = newDT.getHours();
    },
    endDTPlus5(e) {
      let newDT = new Date(endDateTime.value.d_value.getTime() + 1000 * 60 * 60 * 5);
      endDateTime.value.d_value = newDT;
      endDateTime.value.currentSecond = newDT.getSeconds();
      endDateTime.value.currentMinute = newDT.getMinutes();
      endDateTime.value.currentHour = newDT.getHours();
    },
    testFunc(e) {
      console.log(e);
    },
  },
}
let getPointWeight = (x: Number, middle: Number, left: Number, right: Number): Number => {
  if (x == middle) return 1;
  if (x < middle) {
    return Math.max(0, (x - middle) / (middle - left) + 1);
  }
  if (x > middle) {
    return Math.max(0, (x - middle) / (middle - right) + 1);
  }
  return 0;
}
let setChartData = () => {
  let startDate = Date.parse(startDateTime.value.d_value);
  let endDate = Date.parse(endDateTime.value.d_value);
  minXVal.value = startDate;
  maxXVal.value = endDate;
  // minXVal.value = Date.parse("2025-04-05 13:00:00");
  // maxXVal.value = Date.parse("2025-04-05 14:00:00");

  let result = {
    datasets: [

    ],
  };

  minMaxData.value = [];
  let nameSortedDatasets = associatedDatasets.value;
  nameSortedDatasets.sort((a, b) => {
    if (a.label < b.label) {
      return -1;
    }
    if (b.label < a.label) {
      return 1;
    }
    return 0;
  });
  for (let i = 0; i < nameSortedDatasets.length; i++) {
    if (nameSortedDatasets[i].showMinMax) {
      minMaxData.value.push({
        title: nameSortedDatasets[i].label,
        min: nameSortedDatasets[i].min,
        max: nameSortedDatasets[i].max,
      });
    }
  }
  for (let i = 0; i < associatedDatasets.value.length; i++) {
    let processedData = [];
    if (associatedDatasets.value[i].settings.averaging == "Raw") {
      processedData = associatedDatasets.value[i].data;
    }
    else {
      let timestep = 0;
      let startTimePosition = minXVal.value;
      let endTimePosition = maxXVal.value;
      let steps = [];
      if (associatedDatasets.value[i].settings.averaging == "5 Minutes") {
        timestep = 5 * 60 * 1000;
      }
      else if (associatedDatasets.value[i].settings.averaging == "30 Minutes") {
        timestep = 30 * 60 * 1000;
      }
      else if (associatedDatasets.value[i].settings.averaging == "1 Hour") {
        timestep = 1 * 60 * 60 * 1000;
      }
      else if (associatedDatasets.value[i].settings.averaging == "3 Hours") {
        timestep = 3 * 60 * 60 * 1000;
      }
      else if (associatedDatasets.value[i].settings.averaging == "24 Hours") {
        timestep = 24 * 60 * 60 * 1000;
      }

      steps = [];
      for (let k = 0; k <= Math.floor((endTimePosition - startTimePosition) / timestep); k++) {
        steps.push(startTimePosition + timestep * k);
      }
      if (steps.length <= 0) continue;
      if (steps[steps.length - 1] < endTimePosition) {
        steps.push(endTimePosition);
      }

      let new_data = [];
      for (let step_index = 0; step_index < steps.length; step_index++) {
        let weighted_sum = 0;
        let weights = 0;
        for (let data_index = 0; data_index < associatedDatasets.value[i].data.length; data_index++) {
          if (step_index <= 0) {
            weighted_sum += associatedDatasets.value[i].data[data_index].y * getPointWeight(associatedDatasets.value[i].data[data_index].x, steps[step_index], steps[step_index] - 1, steps[step_index] + (steps[step_index + 1] - steps[step_index]) / 2);
            weights += getPointWeight(associatedDatasets.value[i].data[data_index].x, steps[step_index], steps[step_index] - 1, steps[step_index] + (steps[step_index + 1] - steps[step_index]) / 2);
          }
          else if (step_index >= steps.length - 1) {
            weighted_sum += associatedDatasets.value[i].data[data_index].y * getPointWeight(associatedDatasets.value[i].data[data_index].x, steps[step_index], steps[step_index] - (steps[step_index] - steps[step_index - 1]) / 2, steps[step_index] + 1);
            weights += getPointWeight(associatedDatasets.value[i].data[data_index].x, steps[step_index], steps[step_index] - (steps[step_index] - steps[step_index - 1]) / 2, steps[step_index] + 1);
          }
          else {
            weighted_sum += associatedDatasets.value[i].data[data_index].y * getPointWeight(associatedDatasets.value[i].data[data_index].x, steps[step_index], steps[step_index] - (steps[step_index] - steps[step_index - 1]) / 2, steps[step_index] + (steps[step_index + 1] - steps[step_index]) / 2);
            weights += getPointWeight(associatedDatasets.value[i].data[data_index].x, steps[step_index], steps[step_index] - (steps[step_index] - steps[step_index - 1]) / 2, steps[step_index] + (steps[step_index + 1] - steps[step_index]) / 2);
          }
        }
        if (weights != 0) {
          new_data.push({ x: steps[step_index], y: weighted_sum / weights });
        }
      }

      processedData = new_data;
    }

    if (associatedDatasets.value[i].settings.type == 'Line') {
      result.datasets.push({
        type: 'scatter',
        pointRadius: 3,
        showLine: true,
        label: associatedDatasets.value[i].label,
        data: processedData,
        tension: 0.2,
      });
    }
    else if (associatedDatasets.value[i].settings.type == 'Bar') {
      result.datasets.push({
        type: 'scatter',
        pointRadius: 0,
        showLine: false,
        label: "IGNORE",
        data: processedData,
        hidden: true,
      });
      result.datasets.push({
        type: 'bar',
        barPercentage: 0.5,
        barThickness: 6,
        maxBarThickness: 8,
        minBarLength: 2,
        label: associatedDatasets.value[i].label,
        data: processedData,
        tension: 0.2,
      });
    }
    else if (associatedDatasets.value[i].settings.type == 'Scatter') {
      result.datasets.push({
        type: 'scatter',
        showLine: false,
        label: associatedDatasets.value[i].label,
        data: processedData,
        tension: 0.2,
      });
    }
  }

  return result;
}
const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--p-text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

  let result = {
    maintainAspectRatio: false,
    // aspectRatio: 0.6,
    interaction: {
      intersect: false,
      mode: 'x',
    },
    plugins: {
      legend: {
        labels: {
          color: textColor,
          filter: item => item.text !== 'IGNORE'
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';

            if (label) {
              label += ': (';
            }
            if (context.parsed.x !== null) {
              label += (new Date(context.parsed.x)).toLocaleString() + "; ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            label += ")"
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        min: minXVal.value,
        max: maxXVal.value,
        ticks: {
          // stepSize: 100000 / 2,
          // precision: 5,
          autoSkip: false,
          minRotation: 45,
          color: textColorSecondary,
          callback: function (value, index, ticks) {
            return (new Date(value)).toLocaleString();
          }
        },
        grid: {
          color: surfaceBorder
        }
      },
      y: {
        // min: 0,
        // max: 50,
        ticks: {
          precision: 2,
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      }
    },
  };

  return result;
}
</script>