// Electron API 类型定义
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      getDataPath: () => Promise<string>;
      // 窗口控制
      windowMinimize: () => Promise<void>;
      windowMaximize: () => Promise<void>;
      windowClose: () => Promise<void>;
      windowIsMaximized: () => Promise<boolean>;
      // 窗口状态监听
      onWindowMaximized: (callback: (isMaximized: boolean) => void) => void;
      onExportData: (callback: () => void) => void;
      onImportData: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
      // 文件/文件夹选择对话框
      showOpenDialog: (options?: {
        title?: string;
        properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'>;
        filters?: Array<{ name: string; extensions: string[] }>;
      }) => Promise<{ canceled: boolean; filePaths: string[] }>;
      // 获取文件/文件夹大小
      getPathSize: (filePath: string) => Promise<number>;
    };
  }
}

export {};
