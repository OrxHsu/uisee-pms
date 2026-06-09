import { useState, useCallback, useEffect } from 'react';
import { useModuleStore } from '@/stores/projectStore';
import {
  ProjectClosureData,
  RemainingIssue,
  FollowUpInvestment,
} from '@/types/module';
import { generateId } from '@/utils/helpers';

const EMPTY_DATA: ProjectClosureData = {
  remainingIssues: [],
  followUpInvestments: [],
};

function getSampleData(projectId: string): ProjectClosureData {
  const now = new Date().toISOString();
  return {
    remainingIssues: [
      {
        id: 'ri-1',
        projectId,
        title: '3号车激光雷达标定偏差',
        description: '3号车前向激光雷达标定存在2cm偏差，需重新标定，当前在可接受范围内但建议修正',
        category: 'hardware',
        priority: 'major',
        status: 'open',
        assignee: '张工',
        deadline: '2024-07-15',
        resolution: '',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ri-2',
        projectId,
        title: '夜间接管率偏高需优化',
        description: '夜间低光照场景下接管率高于预期，需要优化感知算法参数',
        category: 'software',
        priority: 'critical',
        status: 'in-progress',
        assignee: '李工',
        deadline: '2024-07-20',
        resolution: '已安排算法团队进行参数调优，预计7月中旬完成',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'ri-3',
        projectId,
        title: '现场验收流程缺少文档模板',
        description: '当前验收流程缺少标准化文档模板，导致不同站点验收标准不一致',
        category: 'process',
        priority: 'minor',
        status: 'resolved',
        assignee: '王管理',
        deadline: '2024-06-30',
        resolution: '已制定统一验收文档模板并下发各站点',
        createdAt: now,
        updatedAt: now,
      },
    ],
    followUpInvestments: [
      {
        id: 'fu-1',
        projectId,
        title: '增派2名调试工程师驻场',
        category: 'personnel',
        description: '为加快遗留问题处理进度，需增派2名调试工程师驻场2周',
        quantity: 2,
        unit: '人',
        estimatedCost: '8万',
        responsiblePerson: '陈经理',
        planDate: '2024-07-10',
        status: 'planned',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'fu-2',
        projectId,
        title: '补充备用传感器套件',
        category: 'equipment',
        description: '补充1套激光雷达和2套摄像头作为现场备件',
        quantity: 1,
        unit: '套',
        estimatedCost: '15万',
        responsiblePerson: '刘采购',
        planDate: '2024-07-05',
        status: 'in-progress',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'fu-3',
        projectId,
        title: '感知算法优化迭代',
        category: 'technical',
        description: '针对夜间场景进行感知算法参数调优，提升低光照条件下识别率',
        quantity: 1,
        unit: '项',
        estimatedCost: '5万',
        responsiblePerson: '李工',
        planDate: '2024-07-20',
        status: 'in-progress',
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

export function useProjectClosureData(projectId: string) {
  const { getModuleData, updateModuleData } = useModuleStore();

  const loadData = useCallback((): ProjectClosureData => {
    const stored = getModuleData(projectId, 'project-closure');
    if (stored?.data) {
      return stored.data as ProjectClosureData;
    }
    // ★ 首次访问该模块：返回示例数据但不立即持久化
    return getSampleData(projectId);
  }, [projectId, getModuleData]);

  const [data, setData] = useState<ProjectClosureData>(loadData);

  useEffect(() => {
    setData(loadData());
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 监听 store 中该模块数据变化（外部更新同步）
  useEffect(() => {
    const unsub = useModuleStore.subscribe((state) => {
      const key = `${projectId}-project-closure`;
      const stored = state.moduleData[key];
      if (stored?.data) {
        setData(stored.data as ProjectClosureData);
      }
    });
    return unsub;
  }, [projectId]);

  const persist = useCallback((newData: ProjectClosureData) => {
    setData(newData);
    try {
      updateModuleData(projectId, 'project-closure', newData);
    } catch (e) {
      console.error('Failed to persist project closure data:', e);
    }
  }, [projectId, updateModuleData]);

  // === RemainingIssue CRUD ===
  const addRemainingIssue = useCallback((issue: Omit<RemainingIssue, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newIssue: RemainingIssue = {
      ...issue,
      id: generateId(),
      projectId,
      createdAt: now,
      updatedAt: now,
    };
    persist({ ...data, remainingIssues: [...data.remainingIssues, newIssue] });
  }, [data, persist, projectId]);

  const updateRemainingIssue = useCallback((id: string, updates: Partial<RemainingIssue>) => {
    persist({
      ...data,
      remainingIssues: data.remainingIssues.map(ri =>
        ri.id === id ? { ...ri, ...updates, updatedAt: new Date().toISOString() } : ri
      ),
    });
  }, [data, persist]);

  const deleteRemainingIssue = useCallback((id: string) => {
    persist({ ...data, remainingIssues: data.remainingIssues.filter(ri => ri.id !== id) });
  }, [data, persist]);

  // === FollowUpInvestment CRUD ===
  const addFollowUpInvestment = useCallback((investment: Omit<FollowUpInvestment, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newInvestment: FollowUpInvestment = {
      ...investment,
      id: generateId(),
      projectId,
      createdAt: now,
      updatedAt: now,
    };
    persist({ ...data, followUpInvestments: [...data.followUpInvestments, newInvestment] });
  }, [data, persist, projectId]);

  const updateFollowUpInvestment = useCallback((id: string, updates: Partial<FollowUpInvestment>) => {
    persist({
      ...data,
      followUpInvestments: data.followUpInvestments.map(fu =>
        fu.id === id ? { ...fu, ...updates, updatedAt: new Date().toISOString() } : fu
      ),
    });
  }, [data, persist]);

  const deleteFollowUpInvestment = useCallback((id: string) => {
    persist({ ...data, followUpInvestments: data.followUpInvestments.filter(fu => fu.id !== id) });
  }, [data, persist]);

  return {
    data,
    addRemainingIssue,
    updateRemainingIssue,
    deleteRemainingIssue,
    addFollowUpInvestment,
    updateFollowUpInvestment,
    deleteFollowUpInvestment,
  };
}
