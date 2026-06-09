# 项目管理系统

自动驾驶车辆部署项目管理系统 - 基于 Electron + React + TypeScript 的桌面应用

## 功能特性

- 项目管理（创建、编辑、删除项目）
- 发车前Check
- 车辆到场管理
- 部署前对齐
- 数据管理
- 部署管理
- 测试管理
- 培训管理
- 文档管理
- 项目收尾

## 技术栈

- **前端框架**: React 18
- **桌面框架**: Electron
- **类型安全**: TypeScript
- **样式方案**: Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router
- **构建工具**: Vite

## 开发

### 安装依赖

```bash
npm install
```

### 开发模式（Web）

```bash
npm run dev
```

### 开发模式（Electron）

```bash
npm run electron:dev
```

## 构建

### 构建Web版本

```bash
npm run build
```

### 构建Electron版本（Linux）

```bash
npm run electron:build:linux
```

### 构建Electron版本（所有平台）

```bash
npm run electron:build
```

## 项目结构

```
.
├── electron/           # Electron 主进程代码
│   ├── main.js         # 主进程入口
│   └── preload.js      # 预加载脚本
├── src/                # React 前端代码
│   ├── components/     # 组件
│   ├── pages/          # 页面
│   ├── stores/         # 状态管理
│   ├── types/          # 类型定义
│   └── utils/          # 工具函数
└── package.json        # 项目配置
```

## 快捷键

- `Ctrl+E`: 导出数据
- `Ctrl+I`: 导入数据
- `F5`: 刷新页面
- `F11`: 全屏

## 数据存储

应用使用 LocalStorage 存储数据，数据会持久化在用户本地。
