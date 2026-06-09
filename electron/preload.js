import { contextBridge, ipcRenderer } from 'electron';

// 安全地暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // 获取数据存储路径
  getDataPath: () => ipcRenderer.invoke('get-data-path'),

  // 窗口控制
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),

  // 窗口状态监听
  onWindowMaximized: (callback) => ipcRenderer.on('window-maximized', (_event, value) => callback(value)),

  // 导出数据
  onExportData: (callback) => ipcRenderer.on('export-data', callback),

  // 导入数据
  onImportData: (callback) => ipcRenderer.on('import-data', callback),

  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // 文件/文件夹选择对话框
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  // 获取文件/文件夹大小
  getPathSize: (filePath) => ipcRenderer.invoke('get-path-size', filePath),
});
