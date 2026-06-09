// 模块类型
export type ModuleType = 
  | 'pre-departure'
  | 'vehicle-arrival'
  | 'deployment-alignment'
  | 'data-management'
  | 'deployment-management'
  | 'test-management'
  | 'training-management'
  | 'document-management'
  | 'project-closure';

// 项目类型
export type ProjectType = 'AET' | 'BUS' | 'UBOX' | '平板车' | '集卡';

// 项目状态
export type ProjectStatus = '未开始' | '进行中' | '已结束' | '延期' | '已归档';

// 模块名称映射
export const MODULE_NAMES: Record<ModuleType, string> = {
  'pre-departure': '发车检查',
  'vehicle-arrival': '车辆到场',
  'deployment-alignment': '部署对齐',
  'data-management': '数据管理',
  'deployment-management': '部署管理',
  'test-management': '测试管理',
  'training-management': '培训管理',
  'document-management': '文档管理',
  'project-closure': '项目收尾',
};

// 模块图标映射
export const MODULE_ICONS: Record<ModuleType, string> = {
  'pre-departure': 'Truck',
  'vehicle-arrival': 'Car',
  'deployment-alignment': 'AlignCenter',
  'data-management': 'Database',
  'deployment-management': 'Rocket',
  'test-management': 'TestTube',
  'training-management': 'GraduationCap',
  'document-management': 'FileText',
  'project-closure': 'CheckCircle',
};

// 项目类型映射
export const PROJECT_TYPE_NAMES: Record<ProjectType, string> = {
  AET: 'AET',
  BUS: 'BUS',
  UBOX: 'UBOX',
  '平板车': '平板车',
  '集卡': '集卡',
};

// 项目状态映射
export const PROJECT_STATUS_NAMES: Record<ProjectStatus, string> = {
  '未开始': '未开始',
  '进行中': '进行中',
  '已结束': '已结束',
  '延期': '延期',
  '已归档': '已归档',
};

// 项目状态颜色
export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  '未开始': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  '进行中': 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  '已结束': 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
  '延期': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
  '已归档': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
};

// 优先级映射
export const PRIORITY_NAMES = {
  high: '高',
  medium: '中',
  low: '低',
};

// 优先级颜色
export const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-800',
};

// 问题状态映射
export const ISSUE_STATUS_NAMES = {
  open: '待处理',
  'in-progress': '处理中',
  resolved: '已解决',
  closed: '已关闭',
};

// 问题状态颜色
export const ISSUE_STATUS_COLORS = {
  open: 'bg-red-100 text-red-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

// 物料状态映射
export const MATERIAL_STATUS_NAMES = {
  available: '可用',
  missing: '缺失',
  damaged: '损坏',
};

// 物料状态颜色
export const MATERIAL_STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  missing: 'bg-red-100 text-red-800',
  damaged: 'bg-yellow-100 text-yellow-800',
};

// 测试结果映射
export const TEST_RESULT_NAMES = {
  pass: '通过',
  fail: '失败',
  pending: '待测试',
};

// 测试结果颜色
export const TEST_RESULT_COLORS = {
  pass: 'bg-green-100 text-green-800',
  fail: 'bg-red-100 text-red-800',
  pending: 'bg-gray-100 text-gray-800',
};

// 线路难度映射
export const ROUTE_DIFFICULTY_NAMES = {
  easy: '易',
  medium: '较难',
  hard: '难',
};

// 线路难度颜色
export const ROUTE_DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

// 定位地图类型映射
export const LOCALIZATION_MAP_TYPE_NAMES = {
  visual: '视觉定位',
  lidar: '激光定位',
  semantic: '语义定位',
};

// Bug严重程度映射
export const BUG_SEVERITY_NAMES = {
  critical: '严重',
  major: '重要',
  minor: '轻微',
};

// Bug严重程度颜色
export const BUG_SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800',
  major: 'bg-yellow-100 text-yellow-800',
  minor: 'bg-gray-100 text-gray-800',
};

// Bug状态映射
export const BUG_STATUS_NAMES: Record<string, string> = {
  open: '待处理',
  'in-progress': '处理中',
  resolved: '已解决',
  closed: '已关闭',
};

// Bug状态颜色
export const BUG_STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

// 测试项分类映射
export const TEST_ITEM_CATEGORY_NAMES: Record<string, string> = {
  'road-network': '路网测试',
  'localization-map': '定位地图测试',
  'function': '功能项测试',
  'safety': '安全性能测试',
  'stress': '压力测试',
};

// 测试项分类颜色
export const TEST_ITEM_CATEGORY_COLORS: Record<string, string> = {
  'road-network': 'bg-blue-100 text-blue-800',
  'localization-map': 'bg-purple-100 text-purple-800',
  'function': 'bg-teal-100 text-teal-800',
  'safety': 'bg-red-100 text-red-800',
  'stress': 'bg-orange-100 text-orange-800',
};

// 测试项分类缩写（用于用例编号）
export const TEST_ITEM_CATEGORY_ABBR: Record<string, string> = {
  'road-network': 'RN',
  'localization-map': 'LM',
  'function': 'FN',
  'safety': 'SF',
  'stress': 'ST',
};

// 测试项状态映射
export const TEST_ITEM_STATUS_NAMES: Record<string, string> = {
  pending: '待测试',
  testing: '测试中',
  passed: '通过',
  failed: '失败',
};

// 测试项状态颜色
export const TEST_ITEM_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  testing: 'bg-blue-100 text-blue-800',
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

// 遗留问题分类映射
export const REMAINING_ISSUE_CATEGORY_NAMES: Record<string, string> = {
  hardware: '硬件问题',
  software: '软件问题',
  process: '流程问题',
  safety: '安全问题',
  other: '其他问题',
};

// 遗留问题分类颜色
export const REMAINING_ISSUE_CATEGORY_COLORS: Record<string, string> = {
  hardware: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
  software: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  process: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
  safety: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

// 遗留问题状态映射
export const REMAINING_ISSUE_STATUS_NAMES: Record<string, string> = {
  open: '待处理',
  'in-progress': '处理中',
  resolved: '已解决',
  closed: '已关闭',
};

// 遗留问题状态颜色
export const REMAINING_ISSUE_STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

// 遗留问题优先级映射
export const REMAINING_ISSUE_PRIORITY_NAMES: Record<string, string> = {
  critical: '紧急',
  major: '重要',
  minor: '一般',
};

// 遗留问题优先级颜色
export const REMAINING_ISSUE_PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
  major: 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200',
  minor: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

// 后续投入分类映射
export const FOLLOW_UP_CATEGORY_NAMES: Record<string, string> = {
  personnel: '人力投入',
  equipment: '设备投入',
  material: '物料投入',
  technical: '技术投入',
  other: '其他投入',
};

// 后续投入分类颜色
export const FOLLOW_UP_CATEGORY_COLORS: Record<string, string> = {
  personnel: 'bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-200',
  equipment: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  material: 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-200',
  technical: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

// 后续投入状态映射
export const FOLLOW_UP_STATUS_NAMES: Record<string, string> = {
  planned: '计划中',
  'in-progress': '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

// 后续投入状态颜色
export const FOLLOW_UP_STATUS_COLORS: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
};

// 文档分类映射
export const DOCUMENT_CATEGORY_NAMES: Record<string, string> = {
  technical: '技术文档',
  management: '管理文档',
  safety: '安全文档',
  testing: '测试文档',
  'training-doc': '培训文档',
  other: '其他文档',
};

// 文档分类颜色
export const DOCUMENT_CATEGORY_COLORS: Record<string, string> = {
  technical: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200',
  management: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  safety: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
  testing: 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-200',
  'training-doc': 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

// 文档状态映射
export const DOCUMENT_STATUS_NAMES: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
};

// 文档状态颜色
export const DOCUMENT_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
  published: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
  archived: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
};

// 培训分类映射
export const TRAINING_CATEGORY_NAMES: Record<string, string> = {
  safety: '安全培训',
  operation: '操作培训',
  maintenance: '维护培训',
  commissioning: '调试培训',
  other: '其他培训',
};

// 培训分类颜色
export const TRAINING_CATEGORY_COLORS: Record<string, string> = {
  safety: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
  operation: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  maintenance: 'bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-200',
  commissioning: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

// 培训状态映射
export const TRAINING_STATUS_NAMES: Record<string, string> = {
  planned: '计划中',
  'in-progress': '进行中',
  completed: '已完成',
};

// 培训状态颜色
export const TRAINING_STATUS_COLORS: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
};

// 侧边栏宽度
export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 64;

// 本地存储键名
export const STORAGE_KEYS = {
  PROJECTS: 'pm_projects',
  MODULE_DATA: 'pm_module_data',
  USER_PREFERENCES: 'pm_user_preferences',
};

// 默认发车清单项
export const DEFAULT_DEPARTURE_CHECKLIST = [
  '检查清单完成',
  '发车版本确认',
  '车辆配件清点',
  'RTK账号申请',
  '发车测试报告',
  '车辆保险购买',
  '物流信息确认',
];

// 默认车辆到场检查项
export const DEFAULT_ARRIVAL_CHECKLIST = [
  '车辆外观检查',
  '设备完整性检查',
  '软件运行状态检查',
  '传感器校准检查',
  '通信系统检查',
  '安全系统检查',
];
