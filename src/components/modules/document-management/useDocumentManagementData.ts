import { useState, useCallback, useEffect } from 'react';
import { useModuleStore } from '@/stores/projectStore';
import {
  DocumentManagementData,
  Document,
} from '@/types/module';
import { generateId } from '@/utils/helpers';

const EMPTY_DATA: DocumentManagementData = {
  documents: [],
};

function getSampleData(projectId: string): DocumentManagementData {
  const now = new Date().toISOString();
  return {
    documents: [
      {
        id: 'doc-1',
        projectId,
        title: 'AET自动驾驶系统技术规格书',
        category: 'technical',
        description: '包含AET车型自动驾驶系统的完整技术规格说明，涵盖感知、决策、控制模块',
        url: 'https://docs.example.com/aet-tech-spec-v2.1',
        tags: ['AET', '技术规格', '自动驾驶'],
        status: 'published',
        uploadedBy: '张工',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'doc-2',
        projectId,
        title: '项目安全管理规范',
        category: 'safety',
        description: '项目实施过程中的安全管理规范和操作流程文档',
        url: 'https://docs.example.com/safety-management-guide',
        tags: ['安全', '管理规范'],
        status: 'published',
        uploadedBy: '王安全',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'doc-3',
        projectId,
        title: '路网测试用例集合',
        category: 'testing',
        description: '路网测试阶段的全量测试用例集，包含边界条件和回归测试',
        url: 'https://docs.example.com/road-network-test-cases',
        tags: ['测试', '路网', '用例'],
        status: 'draft',
        uploadedBy: '李测试',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'doc-4',
        projectId,
        title: '项目周报模板',
        category: 'management',
        description: '项目周报编写模板，包含进度跟踪、风险预警和下周计划',
        url: 'https://docs.example.com/weekly-report-template',
        tags: ['周报', '模板'],
        status: 'archived',
        uploadedBy: '陈管理',
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

export function useDocumentManagementData(projectId: string) {
  const { getModuleData, updateModuleData } = useModuleStore();

  const loadData = useCallback((): DocumentManagementData => {
    const stored = getModuleData(projectId, 'document-management');
    if (stored?.data) {
      return stored.data as DocumentManagementData;
    }
    // ★ 首次访问该模块：返回示例数据但不立即持久化
    return getSampleData(projectId);
  }, [projectId, getModuleData]);

  const [data, setData] = useState<DocumentManagementData>(loadData);

  useEffect(() => {
    setData(loadData());
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 监听 store 中该模块数据变化（外部更新同步）
  useEffect(() => {
    const unsub = useModuleStore.subscribe((state) => {
      const key = `${projectId}-document-management`;
      const stored = state.moduleData[key];
      if (stored?.data) {
        setData(stored.data as DocumentManagementData);
      }
    });
    return unsub;
  }, [projectId]);

  const persist = useCallback((newData: DocumentManagementData) => {
    setData(newData);
    try {
      updateModuleData(projectId, 'document-management', newData);
    } catch (e) {
      console.error('Failed to persist document management data:', e);
    }
  }, [projectId, updateModuleData]);

  // === Document CRUD ===
  const addDocument = useCallback((doc: Omit<Document, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newDoc: Document = {
      ...doc,
      id: generateId(),
      projectId,
      createdAt: now,
      updatedAt: now,
    };
    persist({ ...data, documents: [...data.documents, newDoc] });
  }, [data, persist, projectId]);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    persist({
      ...data,
      documents: data.documents.map(doc =>
        doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
      ),
    });
  }, [data, persist]);

  const deleteDocument = useCallback((id: string) => {
    persist({ ...data, documents: data.documents.filter(doc => doc.id !== id) });
  }, [data, persist]);

  return {
    data,
    addDocument,
    updateDocument,
    deleteDocument,
  };
}
