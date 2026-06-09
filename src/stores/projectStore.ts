import { create } from 'zustand';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../types/project';
import { ModuleData, ModuleType } from '../types/module';
import { STORAGE_KEYS } from '../constants/modules';

// 生成唯一ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 内置示例项目数据
const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'sample-aet-01',
    name: 'AET-S 深圳前海自动驾驶项目',
    type: 'AET',
    description: '深圳前海自贸区自动驾驶乘用车部署项目，覆盖前海片区5平方公里，包含城市道路、高速匝道及停车场场景',
    status: '进行中',
    owner: '王志远',
    department: '自动驾驶事业部',
    startDate: '2024-03-15',
    endDate: '2024-12-31',
    createdAt: '2024-03-10T08:00:00.000Z',
    updatedAt: '2024-06-01T10:30:00.000Z',
  },
  {
    id: 'sample-aet-02',
    name: 'AET-L 广州白云机场接驳项目',
    type: 'AET',
    description: '广州白云机场T2航站楼至停车楼自动驾驶接驳服务，全程3.2公里',
    status: '未开始',
    owner: '李明辉',
    department: '自动驾驶事业部',
    startDate: '2024-07-01',
    endDate: '2025-03-31',
    createdAt: '2024-05-20T09:00:00.000Z',
    updatedAt: '2024-05-20T09:00:00.000Z',
  },
  {
    id: 'sample-bus-01',
    name: 'BUS-U 郑州智能公交示范线',
    type: 'BUS',
    description: '郑州市郑东新区智能网联公交示范线路，全长15.8公里，设站22座',
    status: '进行中',
    owner: '张伟',
    department: '智慧交通事业部',
    startDate: '2024-01-10',
    endDate: '2024-09-30',
    createdAt: '2024-01-05T10:00:00.000Z',
    updatedAt: '2024-06-02T14:20:00.000Z',
  },
  {
    id: 'sample-bus-02',
    name: 'BUS-H 合肥高新区微循环巴士',
    type: 'BUS',
    description: '合肥高新区园区微循环自动驾驶巴士线路，覆盖3条循环路线',
    status: '已结束',
    owner: '陈建国',
    department: '智慧交通事业部',
    startDate: '2023-06-01',
    endDate: '2024-03-31',
    createdAt: '2023-05-15T08:00:00.000Z',
    updatedAt: '2024-04-01T16:00:00.000Z',
  },
  {
    id: 'sample-ubox-01',
    name: 'UBOX 上海临港无人配送项目',
    type: 'UBOX',
    description: '上海临港新片区无人配送车运营项目，覆盖产业园区4平方公里区域',
    status: '进行中',
    owner: '刘思远',
    department: '末端配送事业部',
    startDate: '2024-02-20',
    endDate: '2024-11-30',
    createdAt: '2024-02-15T10:00:00.000Z',
    updatedAt: '2024-05-28T11:45:00.000Z',
  },
  {
    id: 'sample-flat-01',
    name: '平板车 宁波舟山港水平运输项目',
    type: '平板车',
    description: '宁波舟山港集装箱码头无人平板车水平运输系统，一期部署12台车辆',
    status: '延期',
    owner: '赵德强',
    department: '港口物流事业部',
    startDate: '2024-01-15',
    endDate: '2024-08-31',
    createdAt: '2024-01-10T09:00:00.000Z',
    updatedAt: '2024-06-01T08:30:00.000Z',
  },
  {
    id: 'sample-truck-01',
    name: '集卡 天津港自动驾驶集卡项目',
    type: '集卡',
    description: '天津港北疆港区自动驾驶集装箱卡车运输，封闭港区道路环境',
    status: '已归档',
    owner: '孙立成',
    department: '港口物流事业部',
    startDate: '2023-03-01',
    endDate: '2024-01-31',
    createdAt: '2023-02-20T10:00:00.000Z',
    updatedAt: '2024-02-05T09:00:00.000Z',
  },
];

// 项目状态管理
interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  
  // Actions
  addProject: (request: CreateProjectRequest) => void;
  updateProject: (id: string, updates: UpdateProjectRequest) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  loadProjects: () => void;
  saveProjects: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  
  addProject: (request) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      id: generateId(),
      name: request.name,
      type: request.type,
      description: request.description,
      status: request.status || '未开始',
      owner: request.owner,
      department: request.department,
      startDate: request.startDate,
      endDate: request.endDate,
      createdAt: now,
      updatedAt: now,
    };
    
    set((state) => ({
      projects: [...state.projects, newProject],
    }));
    
    get().saveProjects();
  },
  
  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates, updatedAt: new Date().toISOString() }
          : state.currentProject,
    }));
    
    get().saveProjects();
  },
  
  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
    
    get().saveProjects();
  },
  
  setCurrentProject: (project) => {
    set({ currentProject: project });
  },
  
  loadProjects: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (stored) {
        const projects = JSON.parse(stored) as Project[];
        // 合并追加：将示例项目中用户尚未拥有的项目追加进去（按ID去重）
        const existingIds = new Set(projects.map(p => p.id));
        const missingSamples = SAMPLE_PROJECTS.filter(sp => !existingIds.has(sp.id));
        if (missingSamples.length > 0) {
          const merged = [...projects, ...missingSamples];
          set({ projects: merged });
          get().saveProjects();
        } else {
          set({ projects });
        }
      } else {
        // 首次启动，注入示例项目数据
        set({ projects: SAMPLE_PROJECTS });
        get().saveProjects();
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      // 出错时也注入示例数据
      set({ projects: SAMPLE_PROJECTS });
      get().saveProjects();
    }
  },
  
  saveProjects: () => {
    try {
      const { projects } = get();
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Failed to save projects:', error);
    }
  },
}));

// 模块数据状态管理
interface ModuleStore {
  moduleData: Record<string, ModuleData>;
  
  // Actions
  updateModuleData: (projectId: string, moduleType: ModuleType, data: Record<string, any>) => void;
  getModuleData: (projectId: string, moduleType: ModuleType) => ModuleData | undefined;
  loadModuleData: () => void;
  saveModuleData: () => void;
}

export const useModuleStore = create<ModuleStore>((set, get) => ({
  moduleData: {},
  
  updateModuleData: (projectId, moduleType, data) => {
    const key = `${projectId}-${moduleType}`;
    const now = new Date().toISOString();
    
    set((state) => ({
      moduleData: {
        ...state.moduleData,
        [key]: {
          projectId,
          moduleType,
          data,
          updatedAt: now,
        },
      },
    }));
    
    get().saveModuleData();
  },
  
  getModuleData: (projectId, moduleType) => {
    const key = `${projectId}-${moduleType}`;
    return get().moduleData[key];
  },
  
  loadModuleData: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MODULE_DATA);
      if (stored) {
        const moduleData = JSON.parse(stored) as Record<string, ModuleData>;
        set({ moduleData });
      }
    } catch (error) {
      console.error('Failed to load module data:', error);
    }
  },
  
  saveModuleData: () => {
    try {
      const { moduleData } = get();
      localStorage.setItem(STORAGE_KEYS.MODULE_DATA, JSON.stringify(moduleData));
    } catch (error) {
      console.error('Failed to save module data:', error);
    }
  },
}));

// 用户偏好设置状态管理
interface SettingsStore {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  autoSave: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setAutoSave: (autoSave: boolean) => void;
  loadSettings: () => void;
  saveSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  theme: 'light',
  sidebarCollapsed: false,
  autoSave: true,
  
  setTheme: (theme) => {
    set({ theme });
    get().saveSettings();
  },
  
  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
    get().saveSettings();
  },
  
  setAutoSave: (autoSave) => {
    set({ autoSave });
    get().saveSettings();
  },
  
  loadSettings: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (stored) {
        const settings = JSON.parse(stored);
        set(settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },
  
  saveSettings: () => {
    try {
      const { theme, sidebarCollapsed, autoSave } = get();
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify({
        theme,
        sidebarCollapsed,
        autoSave,
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
}));