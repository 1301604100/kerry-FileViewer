<template>
  <div class="app">
    <FolderListArea />
    <EditorArea />
  </div>
</template>

<script setup lang="ts">
import EditorArea from './components/EditorArea.vue';
import FolderListArea from './components/FolderListArea.vue';
</script>

<style scoped lang="scss">
.app {
  display: flex;
  height: 100vh;
}
</style>
