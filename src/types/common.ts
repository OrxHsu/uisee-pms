// 通用类型定义

// ID类型
export type ID = string;

// 时间戳类型
export type Timestamp = string;

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// API响应
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 状态颜色映射
export type StatusColor = 'success' | 'warning' | 'error' | 'info';

// 优先级
export type Priority = 'high' | 'medium' | 'low';

// 严重程度
export type Severity = 'critical' | 'major' | 'minor';

// 操作结果
export interface OperationResult {
  success: boolean;
  message?: string;
}

// 表格列定义
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number | string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

// 表格排序
export interface TableSort {
  field: string;
  order: 'asc' | 'desc';
}

// 表格筛选
export interface TableFilter {
  field: string;
  value: any;
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
}

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 通知接口
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  createdAt: string;
}

// 用户偏好设置
export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  sidebarCollapsed: boolean;
  autoSave: boolean;
}

// 导出格式
export type ExportFormat = 'json' | 'csv' | 'pdf';

// 导出选项
export interface ExportOptions {
  format: ExportFormat;
  includeAttachments?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}