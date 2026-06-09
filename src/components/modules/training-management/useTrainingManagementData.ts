import { useState, useCallback, useEffect } from 'react';
import { useModuleStore } from '@/stores/projectStore';
import {
  TrainingManagementData,
  TrainingRecord,
  Attachment,
} from '@/types/module';
import { generateId } from '@/utils/helpers';

const EMPTY_DATA: TrainingManagementData = {
  trainingRecords: [],
};

function getSampleData(projectId: string): TrainingManagementData {
  const now = new Date().toISOString();
  return {
    trainingRecords: [
      {
        id: 'tr-1',
        projectId,
        title: '自动驾驶安全操作培训',
        date: '2024-06-10',
        startTime: '09:00',
        endTime: '12:00',
        location: '深圳总部培训室A',
        trainer: '王安全',
        participants: ['张工', '李工', '赵工', '钱工'],
        content: '1. 自动驾驶安全规范讲解\n2. 紧急情况处理流程\n3. 实车操作演示\n4. 学员实操练习',
        category: 'safety',
        status: 'completed',
        attachments: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'tr-2',
        projectId,
        title: 'AET车辆调试培训',
        date: '2024-06-15',
        startTime: '14:00',
        endTime: '17:00',
        location: '南沙港测试场',
        trainer: '刘调试',
        participants: ['孙工', '周工', '吴工'],
        content: '1. AET车辆系统架构介绍\n2. 调试工具使用方法\n3. 常见故障排查\n4. 现场调试演练',
        category: 'commissioning',
        status: 'in-progress',
        attachments: [],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'tr-3',
        projectId,
        title: '日常维护保养培训',
        date: '2024-07-01',
        startTime: '10:00',
        endTime: '11:30',
        location: '维修车间',
        trainer: '陈维护',
        participants: ['郑工', '黄工'],
        content: '1. 传感器日常清洁维护\n2. 电池管理系统检查\n3. 轮胎与制动系统保养',
        category: 'maintenance',
        status: 'planned',
        attachments: [],
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

export function useTrainingManagementData(projectId: string) {
  const { getModuleData, updateModuleData } = useModuleStore();

  const loadData = useCallback((): TrainingManagementData => {
    const stored = getModuleData(projectId, 'training-management');
    if (stored?.data) {
      return stored.data as TrainingManagementData;
    }
    // ★ 首次访问该模块：返回示例数据但不立即持久化
    return getSampleData(projectId);
  }, [projectId, getModuleData]);

  const [data, setData] = useState<TrainingManagementData>(loadData);

  useEffect(() => {
    setData(loadData());
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 监听 store 中该模块数据变化（外部更新同步）
  useEffect(() => {
    const unsub = useModuleStore.subscribe((state) => {
      const key = `${projectId}-training-management`;
      const stored = state.moduleData[key];
      if (stored?.data) {
        setData(stored.data as TrainingManagementData);
      }
    });
    return unsub;
  }, [projectId]);

  const persist = useCallback((newData: TrainingManagementData) => {
    setData(newData);
    try {
      updateModuleData(projectId, 'training-management', newData);
    } catch (e) {
      console.error('Failed to persist training management data:', e);
    }
  }, [projectId, updateModuleData]);

  // === TrainingRecord CRUD ===
  const addTrainingRecord = useCallback((record: Omit<TrainingRecord, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRecord: TrainingRecord = {
      ...record,
      id: generateId(),
      projectId,
      createdAt: now,
      updatedAt: now,
    };
    persist({ ...data, trainingRecords: [...data.trainingRecords, newRecord] });
  }, [data, persist, projectId]);

  const updateTrainingRecord = useCallback((id: string, updates: Partial<TrainingRecord>) => {
    persist({
      ...data,
      trainingRecords: data.trainingRecords.map(tr =>
        tr.id === id ? { ...tr, ...updates, updatedAt: new Date().toISOString() } : tr
      ),
    });
  }, [data, persist]);

  const deleteTrainingRecord = useCallback((id: string) => {
    persist({ ...data, trainingRecords: data.trainingRecords.filter(tr => tr.id !== id) });
  }, [data, persist]);

  // === Attachment CRUD ===
  const addAttachment = useCallback((recordId: string, attachment: Omit<Attachment, 'id'>) => {
    const newAttachment: Attachment = { ...attachment, id: generateId() };
    persist({
      ...data,
      trainingRecords: data.trainingRecords.map(tr =>
        tr.id === recordId
          ? { ...tr, attachments: [...tr.attachments, newAttachment], updatedAt: new Date().toISOString() }
          : tr
      ),
    });
  }, [data, persist]);

  const removeAttachment = useCallback((recordId: string, attachmentId: string) => {
    persist({
      ...data,
      trainingRecords: data.trainingRecords.map(tr =>
        tr.id === recordId
          ? {
              ...tr,
              attachments: tr.attachments.filter(a => a.id !== attachmentId),
              updatedAt: new Date().toISOString(),
            }
          : tr
      ),
    });
  }, [data, persist]);

  return {
    data,
    addTrainingRecord,
    updateTrainingRecord,
    deleteTrainingRecord,
    addAttachment,
    removeAttachment,
  };
}
