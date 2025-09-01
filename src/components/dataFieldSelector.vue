<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Select from 'primevue/select';
import Popover from 'primevue/popover';
import Divider from 'primevue/divider';
import ToggleButton from 'primevue/togglebutton';

const dataJSON: any = ref({});
const dataNames: any | undefined = ref(null);
const selectedUName = ref(null);
const dataSerials: any | undefined = ref(null);
const selectedSerial = ref(null);
const dataFields: any | undefined = ref(null);
const selectedField = ref(null);

const effectiveTempDataFields: any | undefined = ref(null);

const dataset: any = ref(null);

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
    graphSettings.value = props.state.graphSettings;
    selectedUName.value = (props.state.selectedUName == null) ? null : props.state.selectedUName.toString();
    updateDataSerials(selectedUName.value);
    selectedSerial.value = (props.state.selectedSerial == null) ? null : props.state.selectedSerial.toString();
    updateDataFields(selectedSerial.value);
    selectedField.value = (props.state.selectedField == null) ? null : props.state.selectedField.toString();
    emitNewData();
}

dataNames.value = [];
let names_arr = Array.from(props.data.keys());
names_arr.sort();
for (let i in names_arr) {
    dataNames.value.push({
        name: names_arr[i],
    });
}

function updateDataSerials(e: any) {
    selectedUName.value = e;
    selectedSerial.value = null;
    selectedField.value = null;
    dataSerials.value = null;
    dataFields.value = null;
    effectiveTempDataFields.value = null;
    let tmp_serials = Array.from(props.data.get(e).keys());
    tmp_serials.sort();
    dataSerials.value = [];
    for (let i in tmp_serials) {
        dataSerials.value.push({
            serial: tmp_serials[i],
        });
    }
    emitNewData();
}

function updateDataFields(e: any) {
    selectedSerial.value = e;
    let tmp_fields = Array.from(props.data.get(selectedUName.value).get(selectedSerial.value).keys());
    tmp_fields.push("Effective Temp");
    tmp_fields.push("Weather Perceivense");
    tmp_fields.sort();
    dataFields.value = [];
    effectiveTempDataFields.value = [];
    for (let i in tmp_fields) {
        dataFields.value.push({
            field: tmp_fields[i],
        });
        if (tmp_fields[i] != "Effective Temp" && tmp_fields[i] != "Weather Perceivense") {
            effectiveTempDataFields.value.push({
                field: tmp_fields[i],
            })
        }
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

function updateData(e: any) {
    selectedField.value = e;
    if (e == 'Weather Perceivense') {
        updateDataAveraging('Raw');
        updateMinMaxToggle(false);
        graphSettings.value.minMaxToggle = false;
    }
    else {
        emitNewData();
    }
}

function emitNewData() {
    if (selectedUName.value == null || selectedSerial.value == null || selectedField.value == null) {
        return;
    }
    emits('updateOutput', {
        name: selectedUName.value,
        serial: selectedSerial.value,
        field: selectedField.value,
        effectiveTempField: graphSettings.value.effectiveTempField,
        effectiveHumidityField: graphSettings.value.effectiveHumidityField,
        dataset: {
            id: props.id,
            data: [],
            min: 0,
            max: 100,
            yAxisID: (selectedField.value == "Weather Perceivense") ? 'y1' : 'y',
            showMinMax: graphSettings.value.minMaxToggle,
            label: `${selectedUName.value} ${selectedSerial.value} ${selectedField.value}`,
            settings: graphSettings.value,
        }
    });
}

function selfDestruct() {
    emits('deleteEmit', {
        id: props.id,
    });
}

function selfClone() {
    emits('cloneEmit', {
        id: props.id,
        state: {
            selectedUName: (selectedUName.value == null) ? null : new String(selectedUName.value),
            selectedSerial: (selectedSerial.value == null) ? null : new String(selectedSerial.value),
            selectedField: (selectedField.value == null) ? null : new String(selectedField.value),
            graphSettings: { ...graphSettings.value },
        }
    });
}

const popoverFlag = ref();
const graphTypes = ref(['Line', 'Bar', 'Scatter']);
const dataAveragingTypes = ref(['Raw', '5 Minutes', '30 Minutes', '1 Hour', '3 Hours', '24 Hours'])

function togglePopover(e: any) {
    popoverFlag.value.toggle(e);
}

function updateGraphType(e: any) {
    graphSettings.value.type = e;
    emitNewData();
}

function updateDataAveraging(e: any) {
    graphSettings.value.averaging = e;
    emitNewData();
}

function updateMinMaxToggle(e: any) {
    graphSettings.value.minMaxToggle = e;
    emitNewData();
}

function updateEffectiveTempField(e: any) {
    graphSettings.value.effectiveTempField = e;
    emitNewData();
}

function updateEffectiveHumidityField(e: any) {
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
                :modelValue="(selectedField != 'Weather Perceivense') ? graphSettings.averaging : 'Raw'"
                @update:model-value="updateDataAveraging" :disabled="selectedField == 'Weather Perceivense'"></Select>
            <Divider></Divider>
            <ToggleButton v-ripple ref="showMinMaxToggle" offLabel="Show Min/Max Values" onLabel="Show Min/Max Values"
                :modelValue="graphSettings.minMaxToggle && selectedField != 'Weather Perceivense'"
                @update:model-value="updateMinMaxToggle" :disabled="selectedField == 'Weather Perceivense'">
            </ToggleButton>
            <Divider></Divider>
            <Select ref="effectiveTempField" placeholder="Temp Field" :options="effectiveTempDataFields" optionLabel="field"
                optionValue="field" :modelValue="graphSettings.effectiveTempField"
                @update:model-value="updateEffectiveTempField"></Select>
            <br>
            <Select ref="effectiveHumidityField" placeholder="Humidity Field" :options="effectiveTempDataFields" optionLabel="field"
                optionValue="field" class="my-1.5" :modelValue="graphSettings.effectiveHumidityField"
                @update:model-value="updateEffectiveHumidityField"></Select>
        </Popover>
        <Button icon="pi pi-clone" style="width: 125px;" @click="selfClone"></Button>
        <Button icon="pi pi-times" style="width: 125px;" @click="selfDestruct" class="mx-1.5"></Button>
    </div>
</template>

<script lang="ts">

</script>