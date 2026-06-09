export type Language = 'zh' | 'en';

export interface Translation {
  header: {
    home: string;
  };
  sidebar: {
    title: string;
    newProject: string;
    noProjects: string;
  };
  modal: {
    newProject: string;
    editProject: string;
    projectName: string;
    projectType: string;
    projectStatus: string;
    projectInfo: string;
    projectOwner: string;
    deliveryDepartment: string;
    startDate: string;
    endDate: string;
    cancel: string;
    create: string;
    save: string;
    deleteConfirm: string;
  };
  projectStatus: {
    notStarted: string;
    inProgress: string;
    completed: string;
    delayed: string;
    archived: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  language: {
    zh: string;
    en: string;
  };
}

export const translations: Record<Language, Translation> = {
  zh: {
    header: {
      home: '首页',
    },
    sidebar: {
      title: 'UPMS',
      newProject: '新建项目',
      noProjects: '暂无项目',
    },
    modal: {
      newProject: '新建项目',
      editProject: '编辑项目',
      projectName: '项目名称',
      projectType: '项目车型',
      projectStatus: '项目状态',
      projectInfo: '项目信息',
      projectOwner: '项目负责人',
      deliveryDepartment: '交付部门',
      startDate: '开始日期',
      endDate: '结束日期',
      cancel: '取消',
      create: '创建',
      save: '保存',
      deleteConfirm: '确定要删除这个项目吗？',
    },
    projectStatus: {
      notStarted: '未开始',
      inProgress: '进行中',
      completed: '已结束',
      delayed: '延期',
      archived: '已归档',
    },
    theme: {
      light: '浅色',
      dark: '深色',
      system: '跟随系统',
    },
    language: {
      zh: '中文',
      en: 'English',
    },
  },
  en: {
    header: {
      home: 'Home',
    },
    sidebar: {
      title: 'UPMS',
      newProject: 'New Project',
      noProjects: 'No Projects',
    },
    modal: {
      newProject: 'New Project',
      editProject: 'Edit Project',
      projectName: 'Project Name',
      projectType: 'Vehicle Type',
      projectStatus: 'Project Status',
      projectInfo: 'Project Info',
      projectOwner: 'Project Owner',
      deliveryDepartment: 'Delivery Department',
      startDate: 'Start Date',
      endDate: 'End Date',
      cancel: 'Cancel',
      create: 'Create',
      save: 'Save',
      deleteConfirm: 'Are you sure you want to delete this project?',
    },
    projectStatus: {
      notStarted: 'Not Started',
      inProgress: 'In Progress',
      completed: 'Completed',
      delayed: 'Delayed',
      archived: 'Archived',
    },
    theme: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    language: {
      zh: '中文',
      en: 'English',
    },
  },
};
