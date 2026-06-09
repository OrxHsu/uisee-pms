# 首页 Kanban 看板

## Context
用户希望将首页改造成项目状态 Kanban 看板：
1. 移除首页右上角「项目看板」和「文件管理」两个无用按钮
2. 首页主体区域展示按项目状态分组的 Kanban 看板
3. 五列对应五种状态：未开始 / 进行中 / 已结束 / 延期 / 已归档
4. 每列展示对应状态的项目卡片，点击可跳转项目详情

## Changes

### File: `src/components/modules/kanban/KanbanBoard.tsx` (新建)

创建 Kanban 看板组件，内部包含三个子组件：

- **KanbanBoard**: 横向滚动容器，按状态分组项目数据
- **KanbanColumn**: 单列，包含状态指示条、状态名、数量徽章、卡片列表
- **KanbanCard**: 项目卡片，展示名称、类型标签、负责人、起止日期

样式要点：
- 容器：`overflow-x-auto pb-4`，内部 `flex gap-5 min-w-max`
- 列宽：固定 `w-[280px] flex-shrink-0`
- 列头：左侧 6px 圆角色条 + 状态名 + 右侧数量徽章（复用 `PROJECT_STATUS_COLORS`）
- 卡片：`p-4 rounded-xl border bg-white dark:bg-gray-800`，悬停阴影和边框高亮
- 类型标签：5 种车型各分配独立颜色（AET indigo、BUS emerald、UBOX cyan、平板车 orange、集卡 violet）
- 空列：虚线边框 + Inbox 图标 + "暂无项目"
- 深色模式：全面使用 `dark:` 前缀适配

### File: `src/pages/HomePage.tsx` (重构)

完全重构首页：
- 移除右上角「项目看板」和「文件管理」按钮
- 移除内联的新建项目模态框（Sidebar 已提供此功能）
- 保留 UPMS 标题 + 全称 + 标语
- 主体区域接入 `<KanbanBoard projects={projects} />`
- 从 `useProjectStore` 获取 `projects` 数据传入看板

### File: `src/types/project.ts` / `src/constants/modules.ts`

无需修改，已有 `Project` 接口和 `PROJECT_STATUS_COLORS` 可直接复用。

## Verification

1. 运行 `npm run check` 确认无编译错误
2. 启动 dev server (`npm run dev`)
3. 在预览浏览器中查看首页
4. 确认：右上角按钮已移除、出现 5 列 Kanban 看板、项目卡片按状态正确分布
5. 点击项目卡片可跳转到对应项目详情页
6. 切换深色模式确认看板样式正常
7. 空项目时确认每列显示 "暂无项目" 提示
