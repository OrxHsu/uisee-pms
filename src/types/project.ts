// 项目类型
export type ProjectType = 'AET' | 'BUS' | 'UBOX' | '平板车' | '集卡';

// 项目状态
export type ProjectStatus = '未开始' | '进行中' | '已结束' | '延期' | '已归档';

// 项目接口
export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  status: ProjectStatus;
  owner: string;
  department: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

// 创建项目请求
export interface CreateProjectRequest {
  name: string;
  type: ProjectType;
  description: string;
  status?: ProjectStatus;
  owner: string;
  department: string;
  startDate: string;
  endDate: string;
}

// 更新项目请求
export interface UpdateProjectRequest {
  name?: string;
  type?: ProjectType;
  description?: string;
  status?: ProjectStatus;
  owner?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
}
