# 桌面应用部署指南

## 前置条件

- Node.js 18+ 已安装
- npm 或 yarn 已安装

## 环境配置

### 1. 配置国内镜像（可选但推荐）

创建 `.npmrc` 文件（已创建）：

```
registry=https://registry.npmmirror.com
electron_mirror=https://npmmirror.com/mirrors/electron/
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
```

### 2. 安装依赖

```bash
npm install
```

## 开发模式

### Web 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### Electron 开发模式

```bash
npm run electron:dev
```

这会同时启动 Vite 开发服务器和 Electron 窗口。

## 构建应用

### 构建 Web 版本

```bash
npm run build
```

### 构建 Linux 桌面应用

```bash
npm run electron:build:linux
```

生成的文件在 `dist-electron/` 目录。

### 构建所有平台

```bash
npm run electron:build
```

## 项目架构说明

### Electron 目录结构

```
electron/
├── main.js      # 主进程文件
└── preload.js   # 预加载脚本（安全桥接）
```

### 前端代码

`src/` 目录下是 React 应用代码，与 Web 版完全相同。

### 通信机制

使用 `ipcMain` 和 `ipcRenderer` 进行主进程和渲染进程的安全通信。

## 从 B/S 到 C/S 的演进

### 当前状态（纯 C/S）

- 单用户桌面应用
- 本地数据存储（LocalStorage）
- 无需后端服务

### 未来扩展（完整 C/S 架构）

如需升级为完整的客户端-服务器架构：

1. **添加后端服务**（可选）
   - Node.js/Express 或 Python/FastAPI
   - 数据库支持（SQLite/PostgreSQL）
   - RESTful API 或 GraphQL

2. **数据同步**
   - 本地缓存 + 云端同步
   - 离线优先策略

3. **多用户协作**
   - 用户认证
   - 项目权限管理
   - 实时协作功能

4. **Electron 网络请求**
   - 使用 `fetch` 或 `axios`
   - 主进程可处理更复杂的网络任务

## 故障排除

### Electron 下载失败

确保 `.npmrc` 配置正确，使用国内镜像源。

### 开发模式白屏

检查控制台错误，确认 Vite 开发服务器正在运行。

### 构建失败

- 清理缓存：`rm -rf node_modules package-lock.json dist dist-electron`
- 重新安装：`npm install`
- 重新构建：`npm run electron:build:linux`

## 快捷键

- `Ctrl+E`: 导出数据
- `Ctrl+I`: 导入数据  
- `F5`: 刷新页面
- `F11`: 全屏
- `Ctrl+Shift+I`: 开发者工具（开发模式）
