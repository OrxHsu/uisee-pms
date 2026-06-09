import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 主窗口变量
let mainWindow;

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1680,
    height: 960,
    minWidth: 1440,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // 禁用web安全警告
      webSecurity: false,
      // 防止窗口被遮挡时节流动画/计时器
      backgroundThrottling: false,
    },
    // 启用透明窗口，让圆角生效
    transparent: true,
    backgroundColor: '#00000000',
    title: 'UPMS - 项目管理系统',
    show: false,
    // 去掉原生标题栏和边框 — 无边框窗口
    frame: false,
    // 去掉默认菜单栏
    autoHideMenuBar: true,
    // 窗口在任务栏显示
    skipTaskbar: false,
    // 设置应用图标
    icon: path.join(__dirname, '../build/icons/512x512.png'),
    // 启用窗口阴影（透明窗口专用）
    hasShadow: true
  });

  // 完全禁用菜单栏
  Menu.setApplicationMenu(null);

  // 窗口准备好后再显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 窗口最大化/还原状态变化时通知渲染进程
  mainWindow.on('maximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window-maximized', true);
    }
  });

  mainWindow.on('unmaximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window-maximized', false);
    }
  });

  // 窗口关闭时
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ========== GPU 加速 & 渲染优化 ==========
// 强制 GPU 光栅化，加速 backdrop-filter / blur 合成
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
// 增加光栅化线程数，提升合成性能
app.commandLine.appendSwitch('raster-threads', '4');
// 使用独立 GPU 进程（非 in-process-gpu，避免 NVIDIA 驱动兼容问题）
app.commandLine.appendSwitch('gpu-sandbox-start-nowait');
// 强制使用高性能 GPU（双显卡笔记本优先独显）
app.commandLine.appendSwitch('use-gl', 'desktop');
// 启用 Vulkan 后端（NVIDIA 驱动下性能优于 OpenGL）
app.commandLine.appendSwitch('enable-features', 'Vulkan,UseSkiaRenderer,VaapiVideoDecoder');
// 提升 GPU 合成帧率上限
app.commandLine.appendSwitch('disable-frame-rate-limit');

// 确保硬件加速开启（Electron 默认开启，显式声明以防被禁用）
// app.disableHardwareAcceleration() — 不调用即保持开启

// Electron 应用准备就绪
app.whenReady().then(createWindow);

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// ========== IPC 通信处理 ==========

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-data-path', () => {
  return app.getPath('userData');
});

// 窗口控制 IPC
ipcMain.handle('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// ========== 文件/文件夹选择对话框 ==========
ipcMain.handle('show-open-dialog', async (_event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: options?.title || '选择文件或文件夹',
    properties: options?.properties || ['openFile', 'openDirectory'],
    filters: options?.filters || [],
  });
  return result; // { canceled, filePaths }
});

// ========== 获取文件/文件夹大小 ==========
function getPathSize(p) {
  try {
    const stat = fs.statSync(p);
    if (stat.isFile()) return stat.size;
    if (stat.isDirectory()) {
      let total = 0;
      const entries = fs.readdirSync(p);
      for (const entry of entries) {
        total += getPathSize(path.join(p, entry));
      }
      return total;
    }
    return 0;
  } catch {
    return 0;
  }
}

ipcMain.handle('get-path-size', (_event, filePath) => {
  const bytes = getPathSize(filePath);
  return bytes;
});
