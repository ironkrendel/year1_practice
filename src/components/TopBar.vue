<style scoped>
    .TopBarBG {
        width: 100%;
        height: 10vh;
        box-sizing: border-box;
        background-color: black;
        margin: auto;
        padding: 0px 0px 0px 0px;
        position: fixed;
        top: 0px;
        overflow: hidden;
    }

    .TopBarElems {
        margin: auto;
        padding: 0px 0px 0px 0px;
        width: 100%;
        height: 10vh;
        box-sizing: border-box;
        display: table-cell;
        vertical-align: middle;
    }
</style>

<script setup>
    import TopBarBtn from "/src/components/TopBarBtn.vue";
</script>

<template>
    <div class="TopBarBG" id="TopBar">
        <div class="TopBarElems">
            <TopBarBtn text="Teto" url="#Pearto"></TopBarBtn>
            <TopBarBtn text="Miku" url="#Miku"></TopBarBtn>
        </div>
    </div>
</template>