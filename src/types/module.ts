import { ProjectType } from './project';

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

// 检查项接口
export interface ChecklistItem {
  id: string;
  title: string;
  checked: boolean;
  notes?: string;
  updatedAt: string;
}

// 问题接口
export interface Issue {
  id: string;
  projectId: string;
  moduleType: ModuleType;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

// 物流信息接口
export interface LogisticsInfo {
  id: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  updates: LogisticsUpdate[];
}

export interface LogisticsUpdate {
  time: string;
  location: string;
  status: string;
}

// 物料接口
export interface Material {
  id: string;
  name: string;
  quantity: number;
  status: 'available' | 'missing' | 'damaged';
  notes?: string;
}

// 测试项分类
export type TestItemCategory = 'road-network' | 'localization-map' | 'function' | 'safety' | 'stress';

// 测试项状态
export type TestItemStatus = 'pending' | 'testing' | 'passed' | 'failed';

// 测试用例接口
export interface TestCase {
  id: string;
  projectId: string;
  name: string;
  caseNumber: string;
  category: TestItemCategory;
  testItemId: string;
  preconditions: string;
  steps: TestStep[];
  expectedResult: string;
  result: 'pass' | 'fail' | 'pending';
  executedAt?: string;
}

export interface TestStep {
  step: number;
  action: string;
  expectedResult: string;
  actualResult?: string;
}

// 测试项接口
export interface TestItem {
  id: string;
  projectId: string;
  name: string;
  category: TestItemCategory;
  status: TestItemStatus;
  assignee: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

// 测试 Log 文件接口
export interface TestLog {
  id: string;
  projectId: string;
  fileName: string;
  testItemId: string;
  uploadedAt: string;
  remark: string;
}

// 测试截图接口
export interface TestScreenshot {
  id: string;
  projectId: string;
  fileName: string;
  testItemId: string;
  bugId?: string;
  uploadedAt: string;
  description: string;
}

// 测试报告接口
export interface TestReport {
  id: string;
  projectId: string;
  title: string;
  sourceType: 'test-item' | 'test-case';
  sourceId: string;
  summary: string;
  totalCases: number;
  passedCases: number;
  failedCases: number;
  pendingCases: number;
  generatedAt: string;
}

// 测试管理模块整体数据结构
export interface TestManagementData {
  testItems: TestItem[];
  testCases: TestCase[];
  testLogs: TestLog[];
  testScreenshots: TestScreenshot[];
  parameterConfigs: ParameterConfig[];
  bugs: Bug[];
  testReports: TestReport[];
}

// 培训分类
export type TrainingCategory = 'safety' | 'operation' | 'maintenance' | 'commissioning' | 'other';

// 培训状态
export type TrainingStatus = 'planned' | 'in-progress' | 'completed';

// 培训记录接口
export interface TrainingRecord {
  id: string;
  projectId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  trainer: string;
  participants: string[];
  content: string;
  category: TrainingCategory;
  status: TrainingStatus;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

// 培训管理模块整体数据结构
export interface TrainingManagementData {
  trainingRecords: TrainingRecord[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: number;
}

// 文档分类
export type DocumentCategory = 'technical' | 'management' | 'safety' | 'testing' | 'training-doc' | 'other';

// 文档状态
export type DocumentStatus = 'draft' | 'published' | 'archived';

// 文档接口
export interface Document {
  id: string;
  projectId: string;
  title: string;
  category: DocumentCategory;
  description: string;
  url: string;
  tags: string[];
  status: DocumentStatus;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

// 文档管理模块整体数据结构
export interface DocumentManagementData {
  documents: Document[];
}

// 遗留问题分类
export type RemainingIssueCategory = 'hardware' | 'software' | 'process' | 'safety' | 'other';

// 遗留问题状态
export type RemainingIssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

// 现场遗留问题接口
export interface RemainingIssue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: RemainingIssueCategory;
  priority: 'critical' | 'major' | 'minor';
  status: RemainingIssueStatus;
  assignee: string;
  deadline: string;
  resolution: string;
  createdAt: string;
  updatedAt: string;
}

// 后续投入分类
export type FollowUpCategory = 'personnel' | 'equipment' | 'material' | 'technical' | 'other';

// 后续投入状态
export type FollowUpStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';

// 现场后续投入接口
export interface FollowUpInvestment {
  id: string;
  projectId: string;
  title: string;
  category: FollowUpCategory;
  description: string;
  quantity: number;
  unit: string;
  estimatedCost: string;
  responsiblePerson: string;
  planDate: string;
  status: FollowUpStatus;
  createdAt: string;
  updatedAt: string;
}

// 项目收尾模块整体数据结构
export interface ProjectClosureData {
  remainingIssues: RemainingIssue[];
  followUpInvestments: FollowUpInvestment[];
}

// 线路难度分级
export type RouteDifficulty = 'easy' | 'medium' | 'hard';

// 线路详情接口
export interface RouteDetail {
  id: string;
  projectId: string;
  name: string;
  difficulty: RouteDifficulty;
  difficultyReason?: string;
  description: string;
  collectionSpec?: string;
  sensorRequirements?: string[];
}

// 定位地图类型
export type LocalizationMapType = 'visual' | 'lidar' | 'semantic';

// 定位地图接口
export interface LocalizationMap {
  id: string;
  projectId: string;
  type: LocalizationMapType;
  name: string;
  version: string;
  status: 'pending' | 'deployed' | 'tested';
  createdAt: string;
}

// 路网版本接口
export interface RoadNetworkVersion {
  id: string;
  projectId: string;
  version: string;
  status: 'pending' | 'deployed' | 'tested';
  createdAt: string;
  updatedAt: string;
}

// 功能项接口
export interface FunctionItem {
  id: string;
  projectId: string;
  productType: ProjectType;
  name: string;
  description: string;
  status: 'pending' | 'deployed' | 'tested';
}

// 参数配置接口
export interface ParameterConfig {
  id: string;
  projectId: string;
  vehicleId: string;
  version: string;
  parameters: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Bug接口
export interface Bug {
  id: string;
  projectId: string;
  vehicleId?: string;
  testItemId?: string;
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// 数据批次接口
export interface DataBatch {
  id: string;
  projectId: string;
  name: string;
  description: string;
  dataCount: number;
  createdAt: string;
}

// 模块数据接口（通用）
export interface ModuleData {
  projectId: string;
  moduleType: ModuleType;
  data: Record<string, any>;
  updatedAt: string;
}