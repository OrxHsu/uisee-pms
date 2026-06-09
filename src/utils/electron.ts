// Electron 工具函数

// 检测是否在 Electron 环境中运行
export const isElectron = () => {
  return window.electronAPI !== undefined;
};

// 获取应用版本
export const getAppVersion = async (): Promise<string> => {
  if (isElectron()) {
    return await window.electronAPI.getAppVersion();
  }
  return '1.0.0';
};

// 获取数据存储路径
export const getDataPath = async (): Promise<string> => {
  if (isElectron()) {
    return await window.electronAPI.getDataPath();
  }
  return './data';
};

// 导出数据处理
export const setupExportData = (callback: () => void) => {
  if (isElectron()) {
    window.electronAPI.onExportData(callback);
  }
};

// 导入数据处理
export const setupImportData = (callback: () => void) => {
  if (isElectron()) {
    window.electronAPI.onImportData(callback);
  }
};

// 清理事件监听器
export const cleanupListeners = () => {
  if (isElectron()) {
    window.electronAPI.removeAllListeners('export-data');
    window.electronAPI.removeAllListeners('import-data');
  }
};
