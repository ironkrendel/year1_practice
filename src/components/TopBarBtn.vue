<style scoped>
    .BG {
        background-color: gray;
        display: inline-block;
        margin: auto;
        margin-left: 1vw;
        height: 6vh;
        line-height: 6vh;
        text-align: center;
        vertical-align: middle;
        border-radius: 5px;
    }

    h1 {
        margin: auto;
        padding: 0px 10px 0px 10px;
        color: white;
        width: auto;
        vertical-align: middle;
        height: 100%;
    }
</style>

<script setup>
    defineProps(['text', 'url']);

    function onclick(url) {
        location.href = url;
    }
</script>

<template>
    <div class="BG" @click="onclick(url)">
        <h1>
            {{ text }}
        </h1>
    </div>
</template>