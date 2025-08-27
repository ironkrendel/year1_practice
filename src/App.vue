<script lang="ts" setup>
import Button from "primevue/button";
import Menubar from 'primevue/menubar';
import Chart from 'primevue/chart';
import ScrollTop from 'primevue/scrolltop';
import { ref } from "vue";
import { toggleDarkMode } from './components/darkmodeToggle.vue';
import DarkModeBtn from "./components/darkmodeBtn.vue";
import DatePicker from 'primevue/datepicker';
import ProgressSpinner from 'primevue/progressspinner';
import Popover from 'primevue/popover';
import ToggleButton from 'primevue/togglebutton';
import Toast from 'primevue/toast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import dataFieldSelector from "./components/dataFieldSelector.vue";
import Slider from "primevue/slider";

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
    <Toast position="bottom-right"></Toast>
    <Menubar :model="items" style="position: sticky;top: 0px;z-index: 100;width: 100%;" class="h-15">
      <template #item="{ item, props }">
        <a v-ripple :href="item.href" v-bind="props.action">
          <span>{{ item.label }}</span>
        </a>
      </template>
      <template #end>
        <div style="display: flex;column-gap: 0.25vw;justify-content: space-between;">
          <Button icon="pi pi-cog" @click="toggleSettingsPopover"></Button>
          <Popover ref="settingsPopoverFlag" class="border-2! border-blue-900! my-0.5!">
            <ToggleButton v-ripple ref="testDataToggle" offLabel="Toggle Test Data" onLabel="Toggle Test Data"
              :modelValue="testDataEnable" @update:model-value="updateTestDataEnable"></ToggleButton>
          </Popover>
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
      <div v-if='dataNames == "loading"' class="flex justify-center m-2">
        <p style="text-align: center;font-size: 40px;margin: auto;">{{ dataProcessingStatus }}</p>
      </div>
      <div class="flex justify-center m-2">
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
      <div class="flex">
        <p class="m-auto mr-0 text-center align-middle h-8.5" ref="startTimeLabel">-</p>
        <Slider ref="timeSlider" class="w-60/100 m-auto mb-5 mr-5 ml-5" range :step="0.01" @update:model-value="updateTimeLimits" @slideend="onTimeLimitsRelease" :disabled="dataNames == null || dataNames == 'loading'"></Slider>
        <p class="m-auto ml-0 text-center align-middle h-8.5" ref="endTimeLabel">-</p>
      </div>
      <Chart :data="chartData" ref="dataGraph" class="h-[30rem]" :options="chartOptions"
        style="width:70%;margin: auto;">
      </Chart>
      <DataTable style="width:70%;margin: auto;" :value="minMaxData">
        <Column field="title" header="Field"></Column>
        <Column field="min" header="Min"></Column>
        <Column field="max" header="Max"></Column>
      </DataTable>
      <br>
      <br>
      <br>
      <br>
      <br>
    </div>
    <div id="Top" style="position: absolute;top: 0px;"></div>
    <!-- <h1 id="Pearto" style="font-size: 150px;margin-top: 5000px;">Pearto</h1> -->
  </body>
</template>

<script lang="ts">
import { useTemplateRef, createApp } from 'vue';
import PrimeVue from "primevue/config";
import ThemePreset from './components/themePreset.vue';
import Ripple from "primevue/ripple";
import { useToast } from "primevue/usetoast";

let toast: any = null;

const settingsPopoverFlag = ref();

function toggleSettingsPopover(e: any) {
  settingsPopoverFlag.value.toggle(e);
}

const testDataEnable: any = ref(false);

const chartOptions: any = ref();
const defaultStartDT: any = ref(new Date(Date.parse("04/01/2025 00:00:00")));
const defaultEndDT: any = ref(new Date(Date.parse("04/01/2025 00:00:00")));
const minEndDT: any = ref(new Date(Date.parse("04/01/2025 00:00:00")));

const data: any = ref(null);
const dataNames: Array<String> | any = ref(null);
const dataSerials: Array<String> | any = ref(null);
const dataFields: Array<String> | any = ref(null);

let preprocessedData: Map = new Map();
const dataProcessingStatus: ref = ref("Processing");

const chartData: any = ref({});
const minMaxData: any = ref([]);

const fieldSelectorsContainer: any = ref(null);
const lastContainer: any = ref(null);
const fieldSelectors: any = ref([]);

const associatedDatasets: any = ref([]);

const minXVal: any = ref(0);
const maxXVal: any = ref(1);

// const startDateTime = useTemplateRef('startDateTime');
let startDateTime: any = ref(null);
// let endDateTime = useTemplateRef('endDateTime');
let endDateTime: any = ref(null);

let currentID = 0;

export default {
  created() {
    chartOptions.value = setChartOptions();
    window.addEventListener("resize", this.resizeEvent);
    var currentDate: any = new Date();
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
    toast = useToast();
    // fieldSelectorsContainer = useTemplateRef('fieldSelectorsContainer');
    // chartOptions.value.options = setChartOptions();
  },
  methods: {
    resizeEvent() {
      (this.$refs.dataGraph as any).reinit();
    },
    async getData() {
      // create request
      dataProcessingStatus.value = "Forming request";

      const options = {
        method: "GET",
        mode: "cors" as RequestMode,
        headers: {
          'Accept': 'application/json',
        }
      }
      dataSerials.value = null;
      dataFields.value = null;

      let startDate = new Date(Date.parse((this.$refs.startDateTime as any).d_value));
      let endDate = new Date(Date.parse((this.$refs.endDateTime as any).d_value));
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
      
      // send request 
      dataProcessingStatus.value = "Awaiting response";

      let resp = null;
      if (testDataEnable.value) {
        resp = (await import('../data/test_data.json')).default;
      }
      else {
        let serverResponse = await fetch(`/api/calibr/log/${startYear}-${startMonth}-${startDay}%20${startHours}:${startMinutes}:${startSeconds}/${endYear}-${endMonth}-${endDay}%20${endHours}:${endMinutes}:${endSeconds}/`, options);
        if (serverResponse.status != 200) {
          dataNames.value = null;
          toast.add({ severity: 'error', summary: 'Request Error!', detail: `Error requesting data from the server. Server return code: ${serverResponse.status}. You may toggle test data using settings.`});
          return;
        }
        resp = await serverResponse.json();
      }
      
      this.clearAllDataSelectors();
      // data.value = resp;
      // let tmp_names = new Set();
      // for (let i in Object.keys(resp)) {
      //   if (resp[i]['uName'] == "NONE") continue;
      //   tmp_names.add(resp[i]['uName']);
      // }
      // dataNames.value = [];
      // let names_arr = Array.from(tmp_names);
      // names_arr.sort();
      // for (let i in names_arr) {
      //   dataNames.value.push({
      //     name: names_arr[i],
      //   });
      // }
      // chartData.value = setChartData();
      // chartOptions.value = setChartOptions();

      // preprocess data
      preprocessResponse(resp);

      this.updateTimeLimits([0, 100]);
      this.$refs.timeSlider.d_value = [0, 100];
    },
    updateMinEndDT(e: any) {
      minEndDT.value = e;
      if ((this.$refs.endDateTime as any).d_value < (this.$refs.startDateTime as any).d_value) {
        (this.$refs.endDateTime as any).d_value = (this.$refs.startDateTime as any).d_value;
      }
    },
    updateGraphStyle() {
      chartOptions.value = setChartOptions();
    },
    updateTestDataEnable(e: any) {
      testDataEnable.value = e;
    },
    updateTimeLimits(e: any) {
      let timeDiff: number = maxXVal.value - minXVal.value;
      
      let newStartX = minXVal.value + timeDiff * e[0] / 100;
      let newEndX = minXVal.value + timeDiff * e[1] / 100;

      let newStartDate: Date = new Date(newStartX);
      let newEndDate: Date = new Date(newEndX);

      this.$refs.startTimeLabel.innerText = newStartDate.toLocaleString().replace(",", "");
      this.$refs.endTimeLabel.innerText = newEndDate.toLocaleString().replace(",", "");

      chartOptions.value.scales.x.min = newStartX;
      chartOptions.value.scales.x.max = newEndX;
      // this.$refs.dataGraph.chart.update();
    },
    onTimeLimitsRelease(e: any) {
      this.$refs.dataGraph.chart.update();
      console.log(e);
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
    addDataSelector() {
      // fieldSelectors.value.push(currentID++);
      // let testClass = defineComponent(dataFieldSelector);
      // fieldSelectors.value.push(new testClass());
      const mountPoint = document.createElement("div");
      // fieldSelectorsContainer.value.appendChild(mountPoint);
      fieldSelectorsContainer.value.insertBefore(mountPoint, lastContainer.value);

      let id = currentID++;
      const app = createApp(dataFieldSelector, {
        // data: data.value,
        data: preprocessedData,
        id: id,
        startDateTime: startDateTime.value.d_value,
        endDateTime: endDateTime.value.d_value,

        onDeleteEmit: (e: any) => {
          this.removeDataSelector(e);
          chartData.value = setChartData();
        },
        onCloneEmit: (e: any) => {
          this.cloneDataSelector(e);
          chartData.value = setChartData();
        },
        onUpdateOutput: (e: any) => {
          this.registerDataset(e);
          chartData.value = setChartData();
        },
      });
      app.use(PrimeVue, {
        theme: {
          preset: (ThemePreset as any).data()['Theme'],
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
    removeDataSelector(e: any) {
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
    cloneDataSelector(e: { id: any; state: any; }) {
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
        // data: data.value,
        data: preprocessedData,
        id: id,
        startDateTime: startDateTime.value.d_value,
        endDateTime: endDateTime.value.d_value,
        state: e.state,

        onDeleteEmit: (e: any) => {
          this.removeDataSelector(e);
          chartData.value = setChartData();
        },
        onCloneEmit: (e: { id: any; state: any; }) => {
          this.cloneDataSelector(e);
          chartData.value = setChartData();
        },
        onUpdateOutput: (e: any) => {
          this.registerDataset(e);
          chartData.value = setChartData();
        },
      });
      copy_app.use(PrimeVue, {
        theme: {
          preset: (ThemePreset as any).data()['Theme'],
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
    registerDataset(e: { id: any; }) {
      const min = (arr: Array<any>, key: any) => arr.reduce((min, el) => el[key] < min[key] ? el : min);
      const max = (arr: Array<any>, key: any) => arr.reduce((max, el) => el[key] > max[key] ? el : max);

      let dataset_ = e.dataset;

      if (e.field == "Effective Temp") {
        for (let i = 0;i < Math.min(preprocessedData.get(e.name).get(e.serial).get(e.effectiveTempField).get(data).length, preprocessedData.get(e.name).get(e.serial).get(e.effectiveHumidityField).get(data).length);i++) {
          let t = preprocessedData.get(e.name).get(e.serial).get(e.effectiveTempField).get(data)[i].y;
          let h = preprocessedData.get(e.name).get(e.serial).get(e.effectiveHumidityField).get(data)[i].y;
          let effective_temp = t - 0.4 * (t - 10) * (1 - h / 100);
          dataset_.data.push({x: preprocessedData.get(e.name).get(e.serial).get(e.effectiveTempField).get(data)[i].x, y: effective_temp});
        }
        dataset_.min = min(dataset_.data, 'y').y;
        dataset_.max = max(dataset_.data, 'y').y;
      }
      else if (e.field == "Weather Perceivense") {
        for (let i = 0;i < Math.min(preprocessedData.get(e.name).get(e.serial).get(e.effectiveTempField).get(data).length, preprocessedData.get(e.name).get(e.serial).get(e.effectiveHumidityField).get(data).length);i++) {
          let t = preprocessedData.get(e.name).get(e.serial).get(e.effectiveTempField).get(data)[i].y;
          let h = preprocessedData.get(e.name).get(e.serial).get(e.effectiveHumidityField).get(data)[i].y;
          let effective_temp = t - 0.4 * (t - 10) * (1 - h / 100);

          let y_val = 0;

          if (effective_temp > 30) {
              y_val = 8;
          }
          else if (effective_temp > 24 && effective_temp <= 30) {
              y_val = 7;
          }
          else if (effective_temp > 18 && effective_temp <= 24) {
              y_val = 6;
          }
          else if (effective_temp > 12 && effective_temp <= 18) {
              y_val = 5;
          }
          else if (effective_temp > 6 && effective_temp <= 12) {
              y_val = 4;
          }
          else if (effective_temp > 0 && effective_temp <= 6) {
              y_val = 3;
          }
          else if (effective_temp > -12 && effective_temp <= 0) {
              y_val = 2;
          }
          else if (effective_temp > -24 && effective_temp <= -12) {
              y_val = 1;
          }
          else if (effective_temp > -30 && effective_temp <= -24) {
              y_val = 0;
          }
          else {
              y_val = 0;
          }
          
          dataset_.data.push({x: preprocessedData.get(e.name).get(e.serial).get(e.effectiveTempField).get(data)[i].x, y: y_val});
        }
        dataset_.min = 0;
        dataset_.max = 8;
      }
      else {
        dataset_.data = preprocessedData.get(e.name).get(e.serial).get(e.field).get(data);
        dataset_.min = preprocessedData.get(e.name).get(e.serial).get(e.field).get("min");
        dataset_.max = preprocessedData.get(e.name).get(e.serial).get(e.field).get("max");
      }

      for (let i = 0; i < associatedDatasets.value.length; i++) {
        if (associatedDatasets.value[i].id == e.dataset.id) {
          associatedDatasets.value[i] = dataset_;
          return;
        }
      }
      associatedDatasets.value.push(dataset_);
    },
    deregisterDataset(e: { id: any; }) {
      for (let i = 0; i < associatedDatasets.value.length; i++) {
        if (associatedDatasets.value[i].id == e.id) {
          associatedDatasets.value.splice(i, 1);
          return;
        }
      }
    },
    startDTMinus5() {
      let newDT = new Date(startDateTime.value.d_value - 1000 * 60 * 60 * 5);
      startDateTime.value.d_value = newDT;
      startDateTime.value.currentSecond = newDT.getSeconds();
      startDateTime.value.currentMinute = newDT.getMinutes();
      startDateTime.value.currentHour = newDT.getHours();
      this.updateMinEndDT(startDateTime.value.d_value);
    },
    startDTMinus1() {
      let newDT = new Date(startDateTime.value.d_value - 1000 * 60 * 60 * 1);
      startDateTime.value.d_value = newDT;
      startDateTime.value.currentSecond = newDT.getSeconds();
      startDateTime.value.currentMinute = newDT.getMinutes();
      startDateTime.value.currentHour = newDT.getHours();
      this.updateMinEndDT(startDateTime.value.d_value);
    },
    startDTPlus1() {
      let newDT = new Date(startDateTime.value.d_value.getTime() + 1000 * 60 * 60 * 1);
      startDateTime.value.d_value = newDT;
      startDateTime.value.currentSecond = newDT.getSeconds();
      startDateTime.value.currentMinute = newDT.getMinutes();
      startDateTime.value.currentHour = newDT.getHours();
      this.updateMinEndDT(startDateTime.value.d_value);
    },
    startDTPlus5() {
      let newDT = new Date(startDateTime.value.d_value.getTime() + 1000 * 60 * 60 * 5);
      startDateTime.value.d_value = newDT;
      startDateTime.value.currentSecond = newDT.getSeconds();
      startDateTime.value.currentMinute = newDT.getMinutes();
      startDateTime.value.currentHour = newDT.getHours();
      this.updateMinEndDT(startDateTime.value.d_value);
    },
    endDTMinus5() {
      if (endDateTime.value.d_value - 1000 * 60 * 60 * 5 < startDateTime.value.d_value) {
        return;
      }
      let newDT = new Date(endDateTime.value.d_value - 1000 * 60 * 60 * 5);
      endDateTime.value.d_value = newDT;
      endDateTime.value.currentSecond = newDT.getSeconds();
      endDateTime.value.currentMinute = newDT.getMinutes();
      endDateTime.value.currentHour = newDT.getHours();
    },
    endDTMinus1() {
      if (endDateTime.value.d_value - 1000 * 60 * 60 * 1 < startDateTime.value.d_value) {
        return;
      }
      let newDT = new Date(endDateTime.value.d_value - 1000 * 60 * 60 * 1);
      endDateTime.value.d_value = newDT;
      endDateTime.value.currentSecond = newDT.getSeconds();
      endDateTime.value.currentMinute = newDT.getMinutes();
      endDateTime.value.currentHour = newDT.getHours();
    },
    endDTPlus1() {
      let newDT = new Date(endDateTime.value.d_value.getTime() + 1000 * 60 * 60 * 1);
      endDateTime.value.d_value = newDT;
      endDateTime.value.currentSecond = newDT.getSeconds();
      endDateTime.value.currentMinute = newDT.getMinutes();
      endDateTime.value.currentHour = newDT.getHours();
    },
    endDTPlus5() {
      let newDT = new Date(endDateTime.value.d_value.getTime() + 1000 * 60 * 60 * 5);
      endDateTime.value.d_value = newDT;
      endDateTime.value.currentSecond = newDT.getSeconds();
      endDateTime.value.currentMinute = newDT.getMinutes();
      endDateTime.value.currentHour = newDT.getHours();
    },
  },
}

let getPointWeight = (x: number, middle: number, left: number, right: number): number => {
  if (x == middle) return 1;
  if (x < middle) {
    return Math.max(0, (x - middle) / (middle - left) + 1);
  }
  if (x > middle) {
    return Math.max(0, (x - middle) / (middle - right) + 1);
  }
  return 0;
}

let preprocessResponse = async (resp: json) => {
  const min = (arr: Array<any>, key: any) => arr.reduce((min, el) => el[key] < min[key] ? el : min);
  const max = (arr: Array<any>, key: any) => arr.reduce((max, el) => el[key] > max[key] ? el : max);

  preprocessedData = new Map();

  // process names
  dataProcessingStatus.value = "Processing names";

  let names_set: Set = new Set();
  for (let i in Object.keys(resp)) {
    if (resp[i]['uName'] != "NONE" && resp[i]['uName'] != "TEST") {
      names_set.add(resp[i]['uName']);
    }
  }
  for (let name of names_set) {
    preprocessedData.set(name, new Map());
  }

  // process serials
  dataProcessingStatus.value = "Processing serials";

  for (let name of names_set) {
    let serials_set: Set = new Set();

    for (let i in Object.keys(resp)) {
      if (resp[i]['uName'] == name) {
        serials_set.add(resp[i]['serial']);
      }
    }

    for (let serial of serials_set) {
      preprocessedData.get(name).set(serial, new Map());
    }
  }

  // process fields
  dataProcessingStatus.value = "Processing fields";

  for (let name of preprocessedData.keys()) {
    for (let serial of preprocessedData.get(name).keys()) {
      let fields_set: Set = new Set();

      for (let i in Object.keys(resp)) {
        if (resp[i]['uName'] == name && resp[i]['serial'] == serial) {
          for (let field in resp[i]['data']) {
            fields_set.add(field);
          }
        }
      }

      for (let field of fields_set) {
        preprocessedData.get(name).get(serial).set(field, new Map());

        preprocessedData.get(name).get(serial).get(field).set(data, new Array());

        for (let i in Object.keys(resp)) {
          if (resp[i]['uName'] == name && resp[i]['serial'] == serial) {
            if (typeof (resp[i]['data'][field]) != "number") {
              if (parseFloat(resp[i]['data'][field]).isNaN) {
                preprocessedData.get(name).get(serial).get(field).get(data).push({ x: Date.parse(resp[i]['Date']), y: parseFloat(resp[i]['data'][field]) });
              }
            }
            else {
              preprocessedData.get(name).get(serial).get(field).get(data).push({ x: Date.parse(resp[i]['Date']), y: resp[i]['data'][field] });
            }
          }
        }

        preprocessedData.get(name).get(serial).get(field).get(data).sort((a, b) => {
          if (a.x < b.x) {
              return -1;
          }
          if (b.x < a.x) {
              return 1;
          }
          return 0;
        });
        if (preprocessedData.get(name).get(serial).get(field).get(data).length > 0) {
          preprocessedData.get(name).get(serial).get(field).set("min", min(preprocessedData.get(name).get(serial).get(field).get(data), 'y').y);
          preprocessedData.get(name).get(serial).get(field).set("max", max(preprocessedData.get(name).get(serial).get(field).get(data), 'y').y);
        }

        if (preprocessedData.get(name).get(serial).get(field).get(data).length == 0) {
          preprocessedData.get(name).get(serial).delete(field);
        }
      }
    }
  }

  data.value = resp;
  dataNames.value = [];
  let names_arr = Array.from(names_set);
  names_arr.sort();
  for (let i in names_arr) {
    dataNames.value.push({
      name: names_arr[i],
    });
  }
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
}

let setChartData = () => {
  let startDate = Date.parse(startDateTime.value.d_value);
  let endDate = Date.parse(endDateTime.value.d_value);
  if (testDataEnable.value) {
    minXVal.value = Date.parse("2025-04-05 13:00:00");
    maxXVal.value = Date.parse("2025-04-05 14:00:00");
  }
  else {
    minXVal.value = startDate;
    maxXVal.value = endDate;
  }

  let result: any = {
    datasets: [

    ],
  };

  minMaxData.value = [];
  let nameSortedDatasets = associatedDatasets.value;
  nameSortedDatasets.sort((a: { label: number; }, b: { label: number; }) => {
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
        yAxisID: associatedDatasets.value[i].yAxisID,
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
        yAxisID: associatedDatasets.value[i].yAxisID,
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
        yAxisID: associatedDatasets.value[i].yAxisID,
        tension: 0.2,
      });
    }
    else if (associatedDatasets.value[i].settings.type == 'Scatter') {
      result.datasets.push({
        type: 'scatter',
        showLine: false,
        label: associatedDatasets.value[i].label,
        data: processedData,
        yAxisID: associatedDatasets.value[i].yAxisID,
        tension: 0.2,
      });
    }
  }

  return result;
}
const setChartOptions = (minX = null, maxX = null) => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--p-text-color');
  const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
  const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

  let startX = minXVal.value;
  let endX = maxXVal.value;

  if (minX != null && maxX != null) {
    startX = minX;
    endX = maxX;
  }

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
          filter: (item: { text: string; }) => item.text !== 'IGNORE'
        }
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';

            if (label) {
              label += ': (';
            }
            if (context.parsed.x !== null) {
              label += (new Date(context.parsed.x)).toLocaleString() + "; ";
            }
            if (context.parsed.y !== null) {
              if (context.dataset.yAxisID == "y") {
                label += (context.parsed.y as number).toFixed(2);
              }
              else if (context.dataset.yAxisID == "y1") {
                let names = [
                  'Extreme Cold',
                  'Very Cold',
                  'Cold',
                  'Moderate',
                  'Cold',
                  'Moderatly Warm',
                  'Warm',
                  'Hot',
                  'Very Hot',
                ];
                label += names[context.parsed.y];
              }
            }
            label += ")"
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        min: startX,
        max: endX,
        ticks: {
          // stepSize: 100000 / 2,
          // precision: 5,
          autoSkip: false,
          minRotation: 45,
          color: textColorSecondary,
          callback: function (value: any) {
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
        position: 'left',
        id: 'y',
        ticks: {
          precision: 2,
          color: textColorSecondary
        },
        grid: {
          color: surfaceBorder
        }
      },
      y1: {
        min: 0,
        max: 8,
        position: 'right',
        id: 'y1',
        ticks: {
          precision: 2,
          color: textColorSecondary,
          callback: function (value: number) {
            let names = [
              'Extreme Cold',
              'Very Cold',
              'Cold',
              'Moderate',
              'Cold',
              'Moderatly Warm',
              'Warm',
              'Hot',
              'Very Hot',
            ];
            return names[value];
          },
        },
        grid: {
          color: surfaceBorder,
          drawOnChartArea: false,
        }
      },
    },
  };

  return result;
}
</script>