import { useState, useCallback, useEffect } from 'react';
import { useModuleStore } from '@/stores/projectStore';
import { ModuleType } from '@/types/module';

/**
 * 通用模块数据持久化 Hook
 * 替代 useState，自动同步到 useModuleStore + localStorage
 * 
 * @param projectId 项目ID
 * @param moduleType 模块类型
 * @param getDefaultData 获取默认/示例数据的函数
 * @returns [data, setData] — 与 useState 接口一致，但变更自动持久化
 */
export function useModuleData<T>(
  projectId: string,
  moduleType: ModuleType,
  getDefaultData: () => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const { getModuleData, updateModuleData } = useModuleStore();

  const loadData = useCallback((): T => {
    const stored = getModuleData(projectId, moduleType);
    if (stored?.data) return stored.data as T;
    // ★ 首次访问：返回示例数据但不立即持久化
    return getDefaultData();
  }, [projectId, moduleType, getModuleData]); // eslint-disable-line react-hooks/exhaustive-deps

  const [data, setData] = useState<T>(loadData);

  // projectId 变化时重新加载
  useEffect(() => {
    setData(loadData());
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 监听 store 中该模块数据变化（外部更新同步）
  useEffect(() => {
    const unsub = useModuleStore.subscribe((state) => {
      const key = `${projectId}-${moduleType}`;
      const stored = state.moduleData[key];
      if (stored?.data) setData(stored.data as T);
    });
    return unsub;
  }, [projectId, moduleType]);

  // 包装 setData：同时持久化到 store + localStorage
  const persistedSetData = useCallback((action: T | ((prev: T) => T)) => {
    setData(prev => {
      const newData = action instanceof Function ? action(prev) : action;
      try {
        updateModuleData(projectId, moduleType, newData);
      } catch (e) {
        console.error(`Failed to persist ${moduleType} data:`, e);
      }
      return newData;
    });
  }, [projectId, moduleType, updateModuleData]);

  return [data, persistedSetData];
}
