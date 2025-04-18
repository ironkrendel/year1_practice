<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import Button from "primevue/button";
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Select from 'primevue/select';
import Popover from 'primevue/popover';
import Divider from 'primevue/divider';
import ToggleButton from 'primevue/togglebutton';
import { toRef } from 'vue'

const dataJSON = ref(null);
const dataNames = ref(null);
const selectedUName = ref(null);
const dataSerials = ref(null);
const selectedSerial = ref(null);
const dataFields = ref(null);
const selectedField = ref(null);

const dataset = ref(null);

const serialSelectorRef = useTemplateRef<HTMLElement | null>('serialSelector');

const props = defineProps(['data', 'id', 'startDateTime', 'endDateTime']);
const emits = defineEmits(['updateOutput', 'deleteEmit']);

const outputRef = toRef(props.output);

dataJSON.value = props.data;
let tmp_names = new Set();
for (let i in Object.keys(props.data)) {
    if (props.data[i]['uName'] == "NULL") continue;
    tmp_names.add(props.data[i]['uName']);
}
dataNames.value = [];
let names_arr = Array.from(tmp_names);
names_arr.sort();
for (let i in names_arr) {
    dataNames.value.push({
        name: names_arr[i],
    });
}

function updateDataSerials(e) {
    selectedUName.value = e.name;
    selectedSerial.value = null;
    selectedField.value = null;
    dataSerials.value = null;
    dataFields.value = null;
    if (serialSelectorRef.value != null) {
        serialSelectorRef.value.d_value = null;
    }
    let tmp_serials = new Set();
    for (let i in Object.keys(dataJSON.value)) {
        if (dataJSON.value[i]['uName'] != e.name) continue;
        tmp_serials.add(dataJSON.value[i]['serial']);
    }
    tmp_serials = Array.from(tmp_serials);
    tmp_serials.sort();
    dataSerials.value = [];
    for (let i in tmp_serials) {
        dataSerials.value.push({
            serial: tmp_serials[i],
        });
    }
    emitNewData();
}

function updateDataFields(e) {
    selectedSerial.value = e.serial;
    let tmp_fields = new Set();
    for (let i in Object.keys(dataJSON.value)) {
        if (dataJSON.value[i]['uName'] != selectedUName.value || dataJSON.value[i]['serial'] != selectedSerial.value) continue;
        for (let j = 0; j < Object.keys(dataJSON.value[i]['data']).length; j++) {
            if (typeof (dataJSON.value[i]['data'][Object.keys(dataJSON.value[i]['data'])[j]]) != "number" && isNaN(parseFloat(dataJSON.value[i]['data'][Object.keys(dataJSON.value[i]['data'])[j]]))) {
                continue;
            }
            tmp_fields.add(Object.keys(dataJSON.value[i]['data'])[j]);
        }
    }
    tmp_fields = Array.from(tmp_fields);
    tmp_fields.sort();
    dataFields.value = [];
    for (let i in tmp_fields) {
        dataFields.value.push({
            field: tmp_fields[i],
        });
    }
    emitNewData();
}

function updateData(e) {
    selectedField.value = e.field;
    emitNewData();
}

function emitNewData() {
    if (selectedUName.value == null || selectedSerial.value == null || selectedField.value == null) {
        return;
    }
    let startDate = Date.parse(props.startDateTime.toISOString());
    let endDate = Date.parse(props.endDateTime.toISOString());
    let new_data = [];
    let minXVal = startDate;
    let maxXVal = endDate;
    for (let i in Object.keys(props.data)) {
      if (props.data[i]['uName'] != selectedUName.value || props.data[i]['serial'] != selectedSerial.value) continue;
      if (typeof (props.data[i]['data'][selectedField.value]) != "number") {
        new_data.push({ x: Date.parse(props.data[i]['Date']), y: parseFloat(props.data[i]['data'][selectedField.value]) });
      }
      else {
        new_data.push({ x: Date.parse(props.data[i]['Date']), y: props.data[i]['data'][selectedField.value] });
      }
    }
    new_data.sort((a, b) => {
      if (a.x < b.x) {
        return -1;
      }
      if (b.x < a.x) {
        return 1;
      }
      return 0;
    });
    const min = (arr, key) => arr.reduce((min, el) => el[key] < min[key] ? el : min);
    const max = (arr, key) => arr.reduce((max, el) => el[key] > max[key] ? el : max);
    dataset.value = new_data;
    emits('updateOutput', {
        id: props.id,
        data: new_data,
        min: min(new_data, 'y').y,
        max: max(new_data, 'y').y,
        showMinMax: graphSettings.value.minMaxToggle,
        label: `${selectedUName.value} ${selectedSerial.value} ${selectedField.value}`,
        settings: graphSettings.value,
    });
}

function selfDestruct(e) {
    emits('deleteEmit', {
        id: props.id,
    });
}

const popoverFlag = ref();
const graphTypes = ref(['Line', 'Bar', 'Scatter']);
const dataAveragingTypes = ref(['Raw', '5 Minutes', '30 Minutes', '1 Hour', '3 Hours', '24 Hours'])

const graphSettings = ref({
    type: 'Line',
    averaging: 'Raw',
    minMaxToggle: false,
});

function togglePopover(e) {
    popoverFlag.value.toggle(e);
}

function updateGraphType(e) {
    graphSettings.value.type = e;
    emitNewData();
}

function updateDataAveraging(e) {
    graphSettings.value.averaging = e;
    emitNewData();
}

function updateMinMaxToggle(e) {
    graphSettings.value.minMaxToggle = e;
    emitNewData();
}
</script>

<template>
    <div class="flex justify-center m-2 w-70%">
        <!-- <InputGroup style="width: 15%;" class="mx-2"> -->
        <InputGroup class="mx-2">
            <InputGroupAddon>
                <i class="pi pi-database"></i>
            </InputGroupAddon>
            <Select ref="uNameSelector" :options="dataNames" optionLabel="name" placeholder="uName"
                @update:model-value="updateDataSerials"></Select>
        </InputGroup>
        <!-- <InputGroup v-if='dataSerials != null' style="width: 15%;" class="mx-2"> -->
        <InputGroup v-if='dataSerials != null' class="mx-2">
            <InputGroupAddon>
                <i class="pi pi-database"></i>
            </InputGroupAddon>
            <Select ref="serialSelector" :options="dataSerials" optionLabel="serial" placeholder="Serial"
                @update:model-value="updateDataFields" class=""></Select>
        </InputGroup>
        <!-- <InputGroup v-if='dataFields != null' style="width: 15%;" class="mx-2"> -->
        <InputGroup v-if='dataFields != null' class="mx-2">
            <InputGroupAddon>
                <i class="pi pi-database"></i>
            </InputGroupAddon>
            <Select ref="fieldSelector" :options="dataFields" optionLabel="field" placeholder="DataField"
                @update:model-value="updateData"></Select>
        </InputGroup>
        <!-- <Button v-if="selectedField != null" icon="pi pi-cog" style="width: 125px;" class="mx-1.5" @click="togglePopover"></Button> -->
        <Button icon="pi pi-cog" style="width: 125px;" class="mx-1.5" @click="togglePopover"></Button>
        <Popover ref="popoverFlag" class="border-2! border-blue-900! my-0.5!">
            <Select ref="graphTypeSelector" :options="graphTypes" placeholder="Graph Type" :modelValue="graphSettings.type" @update:model-value="updateGraphType"></Select>
            <Divider></Divider>
            <Select ref="dataAveragingTypeSelector" :options="dataAveragingTypes" placeholder="Data Averaging Type" :modelValue="graphSettings.averaging" @update:model-value="updateDataAveraging"></Select>
            <Divider></Divider>
            <ToggleButton v-ripple ref="showMinMaxToggle" offLabel="Show Min/Max Values" onLabel="Show Min/Max Values" :modelValue="graphSettings.minMaxToggle" @update:model-value="updateMinMaxToggle"></ToggleButton>
        </Popover>
        <Button icon="pi pi-times" style="width: 125px;" @click="selfDestruct"></Button>
    </div>
</template>