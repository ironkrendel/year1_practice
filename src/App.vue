<script lang="ts" setup>
    import TopBar from "/src/components/TopBar.vue";
    import ToTopBtn from "/src/components/ToTopBtn.vue";
</script>

<template>
  <div id="Top" style="position: absolute;top: 0px;"></div>
  <TopBar id="TopBar"></TopBar>
  <ToTopBtn url="#Top"></ToTopBtn>
  <h1 style="margin-top: 2500px;padding: 30px;font-size: 100px;padding-top: 10vh;" id="Miku">Miku</h1>
  <h1 style="margin-top: 2500px;padding: 30px;font-size: 100px;" id="Pearto">Pearto</h1>
</template>