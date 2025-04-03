<style scoped>
    .Btn {
        width: 10vh;
        height: 10vh;
        background-color: gray;
        position: fixed;
        /* margin-left: auto; */
        /* top:1vh; */
        right: 1vw;
        bottom: 1vw;
        border-radius: 10vh;
    }
</style>

<script setup>
    defineProps(['url']);

    function onclick(url) {
        location.href = url;
    }
</script>

<template>
    <div class="Btn" id="ToTopBtn" @click="onclick(url)">
        
    </div>
</template>