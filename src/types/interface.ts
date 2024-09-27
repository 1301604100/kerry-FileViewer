export enum FileType {
  Text = 'text',
  Image = 'image',
}

export type TreeNode = {
  id: string;
  label: string;
  info: FileSystemFileHandle | FileSystemDirectoryHandle;
  kind: 'directory' | 'file';
  children?: TreeNode[];
};

export type IOpenFile = {
  id: string;
  type: FileType;
  filename: string;
  content: string;
  active: boolean;
};
