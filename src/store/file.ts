import { defineStore } from 'pinia';

import { IOpenFile } from '@/types/interface';

export const useFileStore = defineStore('file', {
  state: () => {
    return {
      openFileList: [] as IOpenFile[],
      curShowFile: {} as IOpenFile,
    };
  },
  getters: {},
  actions: {},
});
