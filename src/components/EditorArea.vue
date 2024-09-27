<template>
  <div class="editor-area" :style="{ '--open-file-list-height': `${openFileListHeight}px` }">
    <div ref="openFileListRef" class="open-file-list">
      <div
        class="open-file-item"
        :class="{ active: item.active }"
        v-for="(item, index) in openFileList"
        :key="item.id"
        @click="changeShowFile(item)"
      >
        <el-icon>
          <Document />
        </el-icon>
        <span class="open-file-name">{{ item.filename }}</span>
        <div class="open-file-close-btn" @click.stop="closeFileHandle(index)">x</div>
      </div>
    </div>
    <div class="content">
      <hljsVuePlugin.component v-if="curShowFile.type === FileType.Text" autodetect :code="curShowFile.content || ''" />
      <div v-else-if="curShowFile.type === FileType.Image" class="image-content">
        <img :src="curShowFile.content" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import 'highlight.js/lib/common';
import { storeToRefs } from 'pinia';
import { ElIcon } from 'element-plus';
import { Document } from '@element-plus/icons-vue';
import hljsVuePlugin from '@highlightjs/vue-plugin';

import { useFileStore } from '@/store/file';
import { IOpenFile, FileType } from '@/types/interface';

import 'highlight.js/styles/sunburst.css';

const fileStore = useFileStore();
const { openFileList, curShowFile } = storeToRefs(fileStore);
const openFileListRef = ref<HTMLDivElement | null>();
const openFileListHeight = ref(40);

function changeShowFile(item: IOpenFile) {
  openFileList.value.forEach((item) => (item.active = false));
  curShowFile.value = item;
  item.active = true;
}

function closeFileHandle(index: number) {
  openFileList.value.forEach((item) => (item.active = false));
  openFileList.value.splice(index, 1);
  if (openFileList.value.length === 0) {
    curShowFile.value = {} as IOpenFile;
    return;
  }
  let item;
  if (openFileList.value.length - 1 < index) {
    item = openFileList.value[openFileList.value.length - 1];
  } else {
    item = openFileList.value[index];
  }
  item.active = true;
  curShowFile.value = item;
}

const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    if (entry.target.classList.contains('open-file-list')) {
      openFileListHeight.value = entry.contentRect.height;
    }
  }
});

onMounted(() => {
  openFileListRef.value && resizeObserver.observe(openFileListRef.value);
});
</script>

<style lang="scss" scoped>
.editor-area {
  overflow: hidden;
  width: calc(100% - 290px);
  height: 100vh;

  background: #282c34;
  font-size: 13px;

  .open-file-list {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    background: #21252b;
    box-shadow: 0 2px 1px rgba(0, 0, 0, 0.2);

    .open-file-item {
      position: relative;
      padding-left: 10px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      height: 40px;
      min-width: 130px;
      color: #676e95;
      cursor: pointer;

      .el-icon {
        margin-right: 5px;
      }

      .open-file-close-btn {
        display: none;
        position: absolute;
        right: 5px;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 5px;
        line-height: 20px;

        &:hover {
          background: #30456a;
        }
      }

      &.active {
        background: #282c34;
        color: #d7dae0;
      }

      &:hover {
        .open-file-close-btn {
          display: flex;
        }
      }

      &:not(.active):hover {
        background: #384e7a;
      }
    }
  }

  .content {
    width: 100%;
    overflow-y: auto;
    height: calc(100vh - var(--open-file-list-height));

    :deep() {
      .hljs {
        font-size: 16px;
        line-height: 25px;
        background: #282c34;
      }
    }

    .image-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        max-width: 100%;
        max-height: 100%;
      }
    }
  }
}
</style>
