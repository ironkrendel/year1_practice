<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import Button from "primevue/button";
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Select from 'primevue/select';
import Popover from 'primevue/popover';
import Divider from 'primevue/divider';
import ToggleButton from 'primevue/togglebutton';

const dataJSON = ref(null);
const dataNames = ref([]);
const selectedUName = ref(null);
const dataSerials = ref(null);
const selectedSerial = ref(null);
const dataFields = ref(null);
const selectedField = ref(null);

const dataset = ref(null);

// const uNameSelectorRef = useTemplateRef<HTMLElement | null>('uNameSelector');
const serialSelectorRef = useTemplateRef<HTMLElement | null>('serialSelector');
// const fieldSelectorRef = useTemplateRef<HTMLElement | null>('fieldSelector');

const props = defineProps(['data', 'id', 'startDateTime', 'endDateTime', 'state']);
const emits = defineEmits(['updateOutput', 'deleteEmit', 'cloneEmit']);

const graphSettings = ref({
    type: 'Line',
    averaging: 'Raw',
    minMaxToggle: false,
    effectiveTempField: '',
    effectiveHumidityField: '',
});

dataJSON.value = props.data;

if (props.state != null) {
    dataNames.value = props.state.dataNames;
    dataSerials.value = props.state.dataSerials;
    dataFields.value = props.state.dataFields;
    graphSettings.value = props.state.graphSettings;
    selectedUName.value = (props.state.selectedUName == null) ? null : props.state.selectedUName.toString();
    selectedSerial.value = (props.state.selectedSerial == null) ? null : props.state.selectedSerial.toString();
    selectedField.value = (props.state.selectedField == null) ? null : props.state.selectedField.toString();
    // updateDataSerials(props.state.selectedUName);
    // updateDataFields(props.state.selectedSerial);
    // updateData(props.state.selectedField);
    emitNewData();
}

// const outputRef = toRef(props.output);

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
    selectedUName.value = e;
    selectedSerial.value = null;
    selectedField.value = null;
    dataSerials.value = null;
    dataFields.value = null;
    if (serialSelectorRef.value != null) {
        serialSelectorRef.value.d_value = null;
    }
    let tmp_serials = new Set();
    for (let i in Object.keys(dataJSON.value)) {
        if (dataJSON.value[i]['uName'] != selectedUName.value) continue;
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
    selectedSerial.value = e;
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
    tmp_fields.add("Effective Temp");
    tmp_fields.add("Weather Perceivense");
    tmp_fields = Array.from(tmp_fields);
    tmp_fields.sort();
    dataFields.value = [];
    for (let i in tmp_fields) {
        dataFields.value.push({
            field: tmp_fields[i],
        });
    }
    if (graphSettings.value.effectiveTempField == '' || graphSettings.value.effectiveTempField == 'Effective Temp' || graphSettings.value.effectiveTempField == 'Weather Perceivense') {
        graphSettings.value.effectiveTempField = '';
        for (let i = 0; i < dataFields.value.length; i++) {
            if (dataFields.value[i].field.toString().toLowerCase().includes("temp") && dataFields.value[i].field.toString() != "Effective Temp") {
                graphSettings.value.effectiveTempField = dataFields.value[i].field;
                break;
            }
        }
    }
    if (graphSettings.value.effectiveHumidityField == '' || graphSettings.value.effectiveTempField == 'Effective Temp' || graphSettings.value.effectiveTempField == 'Weather Perceivense') {
        graphSettings.value.effectiveHumidityField = '';
        for (let i = 0; i < dataFields.value.length; i++) {
            if (dataFields.value[i].field.toString().toLowerCase().includes("humidity")) {
                graphSettings.value.effectiveHumidityField = dataFields.value[i].field;
                break;
            }
        }
    }
    emitNewData();
}

function updateData(e) {
    selectedField.value = e;
    if (e == 'Weather Perceivense') {
        updateDataAveraging('Raw');
    }
    else {
        emitNewData();
    }   
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
        let x_val = Date.parse(props.data[i]['Date']);
        if (selectedField.value == "Effective Temp") {
            let t = props.data[i]['data'][graphSettings.value.effectiveTempField];
            let h = props.data[i]['data'][graphSettings.value.effectiveHumidityField];
            let effective_temp = t - 0.4 * (t - 10) * (1 - h / 100);
            new_data.push({ x: x_val, y: effective_temp });
        }
        else if (selectedField.value == "Weather Perceivense") {
            let t = props.data[i]['data'][graphSettings.value.effectiveTempField];
            let h = props.data[i]['data'][graphSettings.value.effectiveHumidityField];
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

            new_data.push({ x: x_val, y: y_val });
        }
        else {
            if (typeof (props.data[i]['data'][selectedField.value]) != "number") {
                new_data.push({ x: x_val, y: parseFloat(props.data[i]['data'][selectedField.value]) });
            }
            else {
                new_data.push({ x: x_val, y: props.data[i]['data'][selectedField.value] });
            }
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
    if (new_data.length <= 0) return;
    dataset.value = new_data;
    emits('updateOutput', {
        id: props.id,
        data: new_data,
        min: min(new_data, 'y').y,
        max: max(new_data, 'y').y,
        yAxisID: (selectedField.value == "Weather Perceivense") ? 'y1' : 'y',
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

function selfClone(e) {
    emits('cloneEmit', {
        id: props.id,
        state: {
            selectedUName: (selectedUName.value == null) ? null : new String(selectedUName.value),
            selectedSerial: (selectedSerial.value == null) ? null : new String(selectedSerial.value),
            selectedField: (selectedField.value == null) ? null : new String(selectedField.value),
            dataNames: (dataNames.value == null) ? null : [...dataNames.value],
            dataSerials: (dataSerials.value == null) ? null : [...dataSerials.value],
            dataFields: (dataFields.value == null) ? null : [...dataFields.value],
            graphSettings: { ...graphSettings.value },
        }
    });
}

const popoverFlag = ref();
const graphTypes = ref(['Line', 'Bar', 'Scatter']);
const dataAveragingTypes = ref(['Raw', '5 Minutes', '30 Minutes', '1 Hour', '3 Hours', '24 Hours'])

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

function updateEffectiveTempField(e) {
    graphSettings.value.effectiveTempField = e;
    emitNewData();
}

function updateEffectiveHumidityField(e) {
    graphSettings.value.effectiveHumidityField = e;
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
                @update:model-value="updateDataSerials" :modelValue="selectedUName" optionValue="name"></Select>
        </InputGroup>
        <!-- <InputGroup v-if='dataSerials != null' style="width: 15%;" class="mx-2"> -->
        <InputGroup v-if='selectedUName != null' class="mx-2">
            <InputGroupAddon>
                <i class="pi pi-database"></i>
            </InputGroupAddon>
            <Select ref="serialSelector" :options="dataSerials" optionLabel="serial" placeholder="Serial"
                @update:model-value="updateDataFields" :modelValue="selectedSerial" optionValue="serial"></Select>
        </InputGroup>
        <!-- <InputGroup v-if='dataFields != null' style="width: 15%;" class="mx-2"> -->
        <InputGroup v-if='selectedSerial != null' class="mx-2">
            <InputGroupAddon>
                <i class="pi pi-database"></i>
            </InputGroupAddon>
            <Select ref="fieldSelector" :options="dataFields" optionLabel="field" placeholder="DataField"
                @update:model-value="updateData" :modelValue="selectedField" optionValue="field"></Select>
        </InputGroup>
        <!-- <Button v-if="selectedField != null" icon="pi pi-cog" style="width: 125px;" class="mx-1.5" @click="togglePopover"></Button> -->
        <Button icon="pi pi-cog" style="width: 125px;" class="mx-1.5" @click="togglePopover"></Button>
        <Popover ref="popoverFlag" class="border-2! border-blue-900! my-0.5!">
            <Select ref="graphTypeSelector" :options="graphTypes" placeholder="Graph Type"
                :modelValue="graphSettings.type" @update:model-value="updateGraphType"></Select>
            <Divider></Divider>
            <Select ref="dataAveragingTypeSelector" :options="dataAveragingTypes" placeholder="Data Averaging Type"
                :modelValue="(selectedField != 'Weather Perceivense') ? graphSettings.averaging : 'Raw'" @update:model-value="updateDataAveraging" :disabled="selectedField == 'Weather Perceivense'"></Select>
            <Divider></Divider>
            <ToggleButton v-ripple ref="showMinMaxToggle" offLabel="Show Min/Max Values" onLabel="Show Min/Max Values"
                :modelValue="graphSettings.minMaxToggle && selectedField != 'Weather Perceivense'"
                @update:model-value="updateMinMaxToggle" :disabled="selectedField == 'Weather Perceivense'">
            </ToggleButton>
            <Divider></Divider>
            <Select ref="effectiveTempField" placeholder="Temp Field" :options="dataFields" optionLabel="field"
                optionValue="field" :modelValue="graphSettings.effectiveTempField"
                @update:model-value="updateEffectiveTempField"></Select>
            <br>
            <Select ref="effectiveHumidityField" placeholder="Humidity Field" :options="dataFields" optionLabel="field"
                optionValue="field" class="my-1.5" :modelValue="graphSettings.effectiveHumidityField"
                @update:model-value="updateEffectiveHumidityField"></Select>
        </Popover>
        <Button icon="pi pi-clone" style="width: 125px;" @click="selfClone"></Button>
        <Button icon="pi pi-times" style="width: 125px;" @click="selfDestruct" class="mx-1.5"></Button>
    </div>
</template>

<script lang="ts">

</script>