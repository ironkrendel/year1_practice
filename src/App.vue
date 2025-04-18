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
          <DatePicker ref="startDateTime" showSeconds class="mx-1 w-full" :modelValue="defaultStartDT" @update:model-value="updateMinEndDT" showTime></DatePicker>
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
        <!-- <InputGroup style="width: 15%;" class="mx-2">
          <InputGroupAddon>
            <i class="pi pi-database"></i>
          </InputGroupAddon>
          <Select ref="uNameSelector" :options="dataNames" optionLabel="name" placeholder="uName"
            @update:model-value="updateDataSerials"></Select>
        </InputGroup>
        <InputGroup v-if='dataSerials != null' style="width: 15%;" class="mx-2">
          <InputGroupAddon>
            <i class="pi pi-database"></i>
          </InputGroupAddon>
          <Select ref="serialSelector" :options="dataSerials" optionLabel="serial" placeholder="Serial"
            @update:model-value="updateDataFields"></Select>
        </InputGroup>
        <InputGroup v-if='dataFields != null' style="width: 15%;" class="mx-2">
          <InputGroupAddon>
            <i class="pi pi-database"></i>
          </InputGroupAddon>
          <Select ref="fieldSelector" :options="dataFields" optionLabel="field" placeholder="DataField"
            @update:model-value="updateData"></Select>
        </InputGroup>
        <Button v-if="selectedUName != null" icon="pi pi-times"></Button> -->
        <div ref="fieldSelectorsContainer">
          <!-- <div v-for="i in fieldSelectors" style="display: flex;flex-direction: column;">
            <dataFieldSelector :data="data" ref="dataFields" @update:output="testFunc" :id="i" @delete="removeDataset"></dataFieldSelector>
          </div> -->
        </div>
      </div>
      <div v-if="dataNames != null && dataNames != 'loading'" class="flex justify-center m-2">
        <Button icon="pi pi-plus" @click="addDataSelector"></Button>
      </div>
      <Chart :data="chartData" ref="dataGraph" class="h-[30rem]" :options="chartOptions"
        style="width:70%;margin: auto;">
      </Chart>
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

const fieldSelectorsContainer = ref(null);
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
      fieldSelectorsContainer.value.appendChild(mountPoint);

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
          associatedDatasets.value[i].data = e.data;
          associatedDatasets.value[i].label = e.label;
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
let setChartData = () => {
  // if (data.value != null && selectedSerial.value != null && selectedField.value != null) {
  //   let startDate = Date.parse(startDateTime.value.d_value);
  //   let endDate = Date.parse(endDateTime.value.d_value);
  //   let new_data = [];
  //   minXVal.value = startDate;
  //   maxXVal.value = endDate;
  //   for (let i in Object.keys(data.value)) {
  //     if (data.value[i]['uName'] != selectedUName.value || data.value[i]['serial'] != selectedSerial.value) continue;
  //     if (typeof (data.value[i]['data'][selectedField.value]) != "number") {
  //       new_data.push({ x: Date.parse(data.value[i]['Date']), y: parseFloat(data.value[i]['data'][selectedField.value]) });
  //     }
  //     else {
  //       new_data.push({ x: Date.parse(data.value[i]['Date']), y: data.value[i]['data'][selectedField.value] });
  //     }
  //   }
  //   new_data.sort((a, b) => {
  //     if (a.x < b.x) {
  //       return -1;
  //     }
  //     if (b.x < a.x) {
  //       return 1;
  //     }
  //     return 0;
  //   });
  //   chartDatasets.value = [new_data];
  // }
  // else {
  //   chartDatasets.value = [];
  // }

  // let result = {
  //   datasets: [

  //   ],
  // };
  // for (let i in chartDatasets.value) {
  //   if (selectedField.value == null || chartDatasets.value == null) break;
  //   result.datasets.push({
  //     type: 'scatter',
  //     showLine: true,
  //     label: selectedField.value.toString(),
  //     data: chartDatasets.value[i],
  //     tension: 0.2,
  //   });
  // }
  // return result;
  let startDate = Date.parse(startDateTime.value.d_value);
  let endDate = Date.parse(endDateTime.value.d_value);
  minXVal.value = startDate;
  maxXVal.value = endDate;

  let result = {
    datasets: [

    ],
  };

  for (let i = 0; i < associatedDatasets.value.length; i++) {
    result.datasets.push({
      type: 'scatter',
      showLine: true,
      label: associatedDatasets.value[i].label,
      data: associatedDatasets.value[i].data,
      tension: 0.2,
    });
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
    plugins: {
      legend: {
        labels: {
          color: textColor
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
          autoSkip: true,
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