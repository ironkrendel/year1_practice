//
<script setup lang="ts">
// import { ref } from "vue";
// import Button from "primevue/button";
// import InputGroup from 'primevue/inputgroup';
// import InputGroupAddon from 'primevue/inputgroupaddon';
// import Select from 'primevue/select';
// </script>

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
        <Button v-if="selectedField != null" icon="pi pi-times" style="width: 125px;"></Button>
    </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { Vue, setup } from 'vue-class-component';
import Button from "primevue/button";
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Select from 'primevue/select';

const data = ref(null);
const dataNames = ref(null);
const selectedUName = ref(null);
const dataSerials = ref(null);
const selectedSerial = ref(null);
const dataFields = ref(null);
const selectedField = ref(null);

export default {
    props: ['data'],
    mounted() {
        data.value = this.data;
        let tmp_names = new Set();
        for (let i in Object.keys(this.data)) {
            if (this.data[i]['uName'] == "NULL") continue;
            tmp_names.add(this.data[i]['uName']);
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
    data() {
        return {test: "teto"};
    },
    methods: {
        updateDataSerials(e) {
            selectedUName.value = e.name;
            selectedSerial.value = null;
            selectedField.value = null;
            dataSerials.value = null;
            dataFields.value = null;
            if (this.$refs.serialSelector != null) {
                this.$refs.serialSelector.d_value = null;
            }
            let tmp_serials = new Set();
            for (let i in Object.keys(data.value)) {
                if (data.value[i]['uName'] != e.name) continue;
                tmp_serials.add(data.value[i]['serial']);
            }
            tmp_serials = Array.from(tmp_serials);
            tmp_serials.sort();
            dataSerials.value = [];
            for (let i in tmp_serials) {
                dataSerials.value.push({
                    serial: tmp_serials[i],
                });
            }
        },
        updateDataFields(e) {
            selectedSerial.value = e.serial;
            let tmp_fields = new Set();
            for (let i in Object.keys(data.value)) {
                if (data.value[i]['uName'] != selectedUName.value || data.value[i]['serial'] != selectedSerial.value) continue;
                for (let j = 0; j < Object.keys(data.value[i]['data']).length; j++) {
                    if (typeof (data.value[i]['data'][Object.keys(data.value[i]['data'])[j]]) != "number" && isNaN(parseFloat(data.value[i]['data'][Object.keys(data.value[i]['data'])[j]]))) {
                        continue;
                    }
                    tmp_fields.add(Object.keys(data.value[i]['data'])[j]);
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
        },
        updateData(e) {
            selectedField.value = e.field;
        },
    }
}
</script>