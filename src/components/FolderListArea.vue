<template>
  <div class="folder-area">
    <template v-if="!fileList.length">
      <div class="no-folder">
        <p>尚未打开文件夹。</p>
        <div class="open-folder-btn" @click="openFolder">打开文件夹</div>
      </div>
    </template>
    <template v-else>
      <div class="folder-tree">
        <ElTree :data="fileList" highlight-current @node-click="nodeClickHandle">
          <template #default="{ node, data }">
            <el-icon class="icon">
              <template v-if="data.kind === 'file'">
                <Document />
              </template>
              <template v-else>
                <FolderOpened v-if="node.expanded" />
                <Folder v-else />
              </template>
            </el-icon>
            <span>{{ data.label }}</span>
          </template>
        </ElTree>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElTree, ElIcon } from 'element-plus';
import { Folder, FolderOpened, Document } from '@element-plus/icons-vue';
import { useFileStore } from '@/store/file';
import { storeToRefs } from 'pinia';

import { FileType, TreeNode } from '@/types/interface';

import 'element-plus/es/components/tree/style/css';

const fileStore = useFileStore();
const { openFileList, curShowFile } = storeToRefs(fileStore);

const fileList = ref<TreeNode[]>([]);

async function openFolder() {
  const rootHandle = await window.showDirectoryPicker();
  fileList.value = [await getTree(rootHandle)];
  console.log(fileList.value);
}

async function getTree(rootHandle: FileSystemDirectoryHandle, deepPath = '') {
  const arr: TreeNode[] = [];
  const root: TreeNode = {
    id: `${deepPath ? `${deepPath}-` : ''}${rootHandle.name}`,
    label: rootHandle.name,
    kind: 'directory' as const,
    info: rootHandle,
    children: arr,
  };

  for await (const entry of rootHandle.values()) {
    if (entry.kind === 'file') {
      arr.push({
        id: root.id + '-' + entry.name,
        label: entry.name,
        kind: 'file',
        info: entry,
      });
    } else if (entry.kind === 'directory') {
      // getTree(entry, root.id).then((res) => arr.push(res));
      arr.push({
        id: root.id + '-' + entry.name,
        label: entry.name,
        kind: 'directory',
        info: entry,
        children: [],
      });
    }
  }

  arr.sort((a, b) => {
    if (a.kind === b.kind) {
      return a.info.name.localeCompare(b.info.name, 'en', { ignorePunctuation: true });
    } else {
      return a.kind === 'directory' ? -1 : 1;
    }
  });
  return root;
}

function cancelOpenFileListActive() {
  curShowFile.value.active = false;
}

async function nodeClickHandle(node: TreeNode, Node: any) {
  // console.log(args);
  if (node.kind === 'directory' && node.children!.length === 0) {
    node.children = (await getTree(node.info as FileSystemDirectoryHandle)).children;
    Node.expanded = true;
  } else if (node.kind === 'file') {
    const existInfo = openFileList.value.find((item) => item.id === node.id);
    if (existInfo) {
      curShowFile.value.active = false;
      curShowFile.value = existInfo;
      curShowFile.value.active = true;
      return;
    }
    (node.info as FileSystemFileHandle).getFile().then((file: File) => {
      console.log('🚀 ~ file:', file);
      if (file.type) {
        const type = file.type.split('/')[0];
        switch (type) {
          case 'image':
            readFileAsBase64(node, file);
            break;
          case 'text':
          default:
            readFileAsText(node, file);
            break;
        }
      } else {
        readFileAsText(node, file);
      }
      curShowFile.value.active = false;
    });
  }
}

function readFileAsText(node: TreeNode, file: File) {
  file.text().then((text: string) => {
    const fileInfo = {
      id: node.id,
      type: FileType.Text,
      filename: node.info.name,
      content: text,
      active: true,
    };
    curShowFile.value = fileInfo;
    openFileList.value.push(fileInfo);
  });
}

function readFileAsBase64(node: TreeNode, file: File) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    console.log(reader.result);
    const fileInfo = {
      id: node.id,
      type: FileType.Image,
      filename: node.info.name,
      content: reader.result as string,
      active: true,
    };
    curShowFile.value = fileInfo;
    openFileList.value.push(fileInfo);
  };
}

function readFileAsImage(node: TreeNode, file: File) {
  URL.createObjectURL(file);
}
</script>

<style lang="scss" scoped>
.folder-area {
  --bg: #21252b;
  width: 290px;
  height: 100%;
  background: var(--bg);

  .no-folder {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 13px;

    p {
      padding-left: 20px;
      width: 100%;
      color: #8e99b1;
    }

    .open-folder-btn {
      display: flex;
      align-items: center;
      justify-content: center;

      height: 30px;
      width: calc(100% - 40px);
      color: white;
      background: #4b516a;
      cursor: pointer;
      border-radius: 3px;

      &:hover {
        background: #5383dc;
      }
    }
  }

  .folder-tree {
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  .el-tree {
    background: inherit;
    --el-tree-node-hover-bg-color: #384e7a;
    --el-tree-text-color: #8e99b1;

    :deep(.el-tree-node) {
      &.is-current > .el-tree-node__content {
        .el-tree-node__label {
          color: #fff;
        }
      }
      &.is-current > .el-tree-node__content {
        background: var(--el-tree-node-hover-bg-color);
      }
      .el-tree-node__content {
        &:hover {
          .el-tree-node__label {
            color: #fff;
          }
        }
      }
      .el-tree-node__expand-icon {
        display: none;
      }
      .el-icon {
        margin: 0 10px;
      }
    }
  }
}
</style>
