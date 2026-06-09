import { useState, useCallback, useEffect } from 'react';
import { useModuleStore } from '@/stores/projectStore';
import {
  TestManagementData,
  TestItem,
  TestCase,
  TestStep,
  TestLog,
  TestScreenshot,
  ParameterConfig,
  Bug,
  TestReport,
} from '@/types/module';
import { generateId, formatDate } from '@/utils/helpers';
import { TEST_ITEM_CATEGORY_ABBR } from '@/constants/modules';

const EMPTY_DATA: TestManagementData = {
  testItems: [],
  testCases: [],
  testLogs: [],
  testScreenshots: [],
  parameterConfigs: [],
  bugs: [],
  testReports: [],
};

function getSampleData(projectId: string): TestManagementData {
  const now = new Date().toISOString();
  return {
    testItems: [
      {
        id: 'ti-1', projectId, name: '南沙港干线-路网测试',
        category: 'road-network', status: 'passed', assignee: '张工',
        startDate: '2024-03-15', endDate: '2024-03-20',
        createdAt: now, updatedAt: now,
      },
      {
        id: 'ti-2', projectId, name: '前海站-视觉定位地图测试',
        category: 'localization-map', status: 'testing', assignee: '李工',
        startDate: '2024-03-18', endDate: '2024-03-25',
        createdAt: now, updatedAt: now,
      },
      {
        id: 'ti-3', projectId, name: 'AET牵引车-功能项测试',
        category: 'function', status: 'pending', assignee: '王工',
        startDate: '2024-04-01', endDate: '2024-04-10',
        createdAt: now, updatedAt: now,
      },
      {
        id: 'ti-4', projectId, name: '紧急制动-安全性能测试',
        category: 'safety', status: 'failed', assignee: '赵工',
        startDate: '2024-03-10', endDate: '2024-03-15',
        createdAt: now, updatedAt: now,
      },
      {
        id: 'ti-5', projectId, name: '24小时连续运行-压力测试',
        category: 'stress', status: 'pending', assignee: '钱工',
        startDate: '2024-04-15', endDate: '2024-04-16',
        createdAt: now, updatedAt: now,
      },
    ],
    testCases: [
      {
        id: 'tc-1', projectId, name: '直行车道保持测试', caseNumber: 'TC-RN-0001',
        category: 'road-network', testItemId: 'ti-1', preconditions: '车辆已上线，定位正常',
        steps: [
          { step: 1, action: '启动自动驾驶模式', expectedResult: '系统进入自动驾驶状态' },
          { step: 2, action: '沿直行车道行驶2km', expectedResult: '车辆始终保持在车道中央' },
        ],
        expectedResult: '全程无偏出车道', result: 'pass', executedAt: now,
      },
      {
        id: 'tc-2', projectId, name: '路口左转测试', caseNumber: 'TC-RN-0002',
        category: 'road-network', testItemId: 'ti-1', preconditions: '车辆已上线，路口信号灯正常',
        steps: [
          { step: 1, action: '接近左转路口', expectedResult: '系统识别左转信号' },
          { step: 2, action: '执行左转', expectedResult: '安全完成左转，无压线' },
        ],
        expectedResult: '安全完成左转', result: 'pass', executedAt: now,
      },
      {
        id: 'tc-3', projectId, name: '视觉定位精度验证', caseNumber: 'TC-LM-0001',
        category: 'localization-map', testItemId: 'ti-2', preconditions: '视觉定位地图已部署',
        steps: [
          { step: 1, action: '启动车辆，进入测试区域', expectedResult: '视觉定位系统初始化完成' },
          { step: 2, action: '行驶1km记录定位偏差', expectedResult: '偏差≤10cm' },
        ],
        expectedResult: '定位精度满足±10cm要求', result: 'pending',
      },
      {
        id: 'tc-4', projectId, name: '紧急制动响应测试', caseNumber: 'TC-SF-0001',
        category: 'safety', testItemId: 'ti-4', preconditions: '车辆速度30km/h',
        steps: [
          { step: 1, action: '前方出现障碍物', expectedResult: '系统在0.5s内检测到障碍物' },
          { step: 2, action: '触发紧急制动', expectedResult: '车辆在5m内完全停止' },
        ],
        expectedResult: '制动距离≤5m，无碰撞', result: 'fail', executedAt: now,
      },
    ],
    testLogs: [
      {
        id: 'tl-1', projectId, fileName: 'road_test_20240320.log',
        testItemId: 'ti-1', uploadedAt: now, remark: '路网测试全量日志',
      },
      {
        id: 'tl-2', projectId, fileName: 'safety_brake_20240315.log',
        testItemId: 'ti-4', uploadedAt: now, remark: '紧急制动测试日志-制动距离超标',
      },
    ],
    testScreenshots: [
      {
        id: 'ts-1', projectId, fileName: 'brake_failure_001.png',
        testItemId: 'ti-4', bugId: 'bug-1', uploadedAt: now,
        description: '紧急制动时车辆未及时停止，越过障碍物0.5m',
      },
    ],
    parameterConfigs: [
      {
        id: 'pc-1', projectId, vehicleId: 'AET-001', version: 'v2.3.1',
        parameters: { max_speed: '30', safe_distance: '5', brake_force: '80' },
        createdAt: now, updatedAt: now,
      },
      {
        id: 'pc-2', projectId, vehicleId: 'AET-002', version: 'v2.3.1',
        parameters: { max_speed: '30', safe_distance: '5', brake_force: '85' },
        createdAt: now, updatedAt: now,
      },
    ],
    bugs: [
      {
        id: 'bug-1', projectId, vehicleId: 'AET-001', testItemId: 'ti-4',
        title: '紧急制动距离超标', description: '30km/h速度下紧急制动距离达到7.2m，超出5m标准',
        severity: 'critical', status: 'open', createdAt: now, updatedAt: now,
      },
      {
        id: 'bug-2', projectId, vehicleId: 'AET-001', testItemId: 'ti-2',
        title: '视觉定位偶发跳变', description: '在遮挡严重的路口，视觉定位结果出现0.5m跳变',
        severity: 'major', status: 'in-progress', createdAt: now, updatedAt: now,
      },
    ],
    testReports: [],
  };
}

export function useTestManagementData(projectId: string) {
  const { getModuleData, updateModuleData } = useModuleStore();

  const loadData = useCallback((): TestManagementData => {
    const stored = getModuleData(projectId, 'test-management');
    if (stored?.data) {
      return stored.data as TestManagementData;
    }
    // ★ 首次访问该模块：返回示例数据但不立即持久化，避免覆盖 localStorage 中可能存在的数据
    return getSampleData(projectId);
  }, [projectId, getModuleData]);

  const [data, setData] = useState<TestManagementData>(loadData);

  // projectId 变化时重新加载
  useEffect(() => {
    setData(loadData());
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 监听 store 中该模块数据变化（外部更新同步）
  useEffect(() => {
    const unsub = useModuleStore.subscribe((state) => {
      const key = `${projectId}-test-management`;
      const stored = state.moduleData[key];
      if (stored?.data) {
        setData(stored.data as TestManagementData);
      }
    });
    return unsub;
  }, [projectId]);

  const persist = useCallback((newData: TestManagementData) => {
    setData(newData);
    try {
      updateModuleData(projectId, 'test-management', newData);
    } catch (e) {
      console.error('Failed to persist test management data:', e);
    }
  }, [projectId, updateModuleData]);

  // === TestItem CRUD ===
  const addTestItem = useCallback((item: Omit<TestItem, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newItem: TestItem = {
      ...item, id: generateId(), projectId, createdAt: now, updatedAt: now,
    };
    persist({ ...data, testItems: [...data.testItems, newItem] });
  }, [data, persist, projectId]);

  const updateTestItem = useCallback((id: string, updates: Partial<TestItem>) => {
    persist({
      ...data,
      testItems: data.testItems.map(ti => ti.id === id ? { ...ti, ...updates, updatedAt: new Date().toISOString() } : ti),
    });
  }, [data, persist]);

  const deleteTestItem = useCallback((id: string) => {
    persist({ ...data, testItems: data.testItems.filter(ti => ti.id !== id) });
  }, [data, persist]);

  // === TestCase CRUD ===
  const addTestCase = useCallback((tc: Omit<TestCase, 'id' | 'projectId'>) => {
    const newTc: TestCase = { ...tc, id: generateId(), projectId };
    persist({ ...data, testCases: [...data.testCases, newTc] });
  }, [data, persist, projectId]);

  const updateTestCase = useCallback((id: string, updates: Partial<TestCase>) => {
    persist({
      ...data,
      testCases: data.testCases.map(tc => tc.id === id ? { ...tc, ...updates } : tc),
    });
  }, [data, persist]);

  const deleteTestCase = useCallback((id: string) => {
    persist({ ...data, testCases: data.testCases.filter(tc => tc.id !== id) });
  }, [data, persist]);

  // === TestLog CRUD ===
  const addTestLog = useCallback((log: Omit<TestLog, 'id' | 'projectId' | 'uploadedAt'>) => {
    const newLog: TestLog = {
      ...log, id: generateId(), projectId, uploadedAt: new Date().toISOString(),
    };
    persist({ ...data, testLogs: [...data.testLogs, newLog] });
  }, [data, persist, projectId]);

  const deleteTestLog = useCallback((id: string) => {
    persist({ ...data, testLogs: data.testLogs.filter(tl => tl.id !== id) });
  }, [data, persist]);

  // === TestScreenshot CRUD ===
  const addTestScreenshot = useCallback((ss: Omit<TestScreenshot, 'id' | 'projectId' | 'uploadedAt'>) => {
    const newSs: TestScreenshot = {
      ...ss, id: generateId(), projectId, uploadedAt: new Date().toISOString(),
    };
    persist({ ...data, testScreenshots: [...data.testScreenshots, newSs] });
  }, [data, persist, projectId]);

  const deleteTestScreenshot = useCallback((id: string) => {
    persist({ ...data, testScreenshots: data.testScreenshots.filter(ts => ts.id !== id) });
  }, [data, persist]);

  // === ParameterConfig CRUD ===
  const addParameterConfig = useCallback((pc: Omit<ParameterConfig, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPc: ParameterConfig = { ...pc, id: generateId(), projectId, createdAt: now, updatedAt: now };
    persist({ ...data, parameterConfigs: [...data.parameterConfigs, newPc] });
  }, [data, persist, projectId]);

  const updateParameterConfig = useCallback((id: string, updates: Partial<ParameterConfig>) => {
    persist({
      ...data,
      parameterConfigs: data.parameterConfigs.map(pc =>
        pc.id === id ? { ...pc, ...updates, updatedAt: new Date().toISOString() } : pc
      ),
    });
  }, [data, persist]);

  const deleteParameterConfig = useCallback((id: string) => {
    persist({ ...data, parameterConfigs: data.parameterConfigs.filter(pc => pc.id !== id) });
  }, [data, persist]);

  // === Bug CRUD ===
  const addBug = useCallback((bug: Omit<Bug, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBug: Bug = { ...bug, id: generateId(), projectId, createdAt: now, updatedAt: now };
    persist({ ...data, bugs: [...data.bugs, newBug] });
  }, [data, persist, projectId]);

  const updateBug = useCallback((id: string, updates: Partial<Bug>) => {
    persist({
      ...data,
      bugs: data.bugs.map(b =>
        b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
      ),
    });
  }, [data, persist]);

  const deleteBug = useCallback((id: string) => {
    persist({ ...data, bugs: data.bugs.filter(b => b.id !== id) });
  }, [data, persist]);

  const transitionBugStatus = useCallback((id: string) => {
    const order: Array<Bug['status']> = ['open', 'in-progress', 'resolved', 'closed'];
    persist({
      ...data,
      bugs: data.bugs.map(b => {
        if (b.id !== id) return b;
        const idx = order.indexOf(b.status);
        const next = idx < order.length - 1 ? order[idx + 1] : b.status;
        return { ...b, status: next, updatedAt: new Date().toISOString() };
      }),
    });
  }, [data, persist]);

  // === Report Generation ===
  const generateTestItemReport = useCallback((testItemId: string): TestReport => {
    const item = data.testItems.find(ti => ti.id === testItemId);
    const cases = data.testCases.filter(tc => tc.testItemId === testItemId);
    const passed = cases.filter(c => c.result === 'pass').length;
    const failed = cases.filter(c => c.result === 'fail').length;
    const pending = cases.filter(c => c.result === 'pending').length;

    const report: TestReport = {
      id: generateId(),
      projectId,
      title: `${item?.name || '未知测试项'} - 测试报告`,
      sourceType: 'test-item',
      sourceId: testItemId,
      summary: `测试项「${item?.name}」共包含 ${cases.length} 个用例，通过 ${passed} 个，失败 ${failed} 个，待测试 ${pending} 个。`,
      totalCases: cases.length,
      passedCases: passed,
      failedCases: failed,
      pendingCases: pending,
      generatedAt: new Date().toISOString(),
    };

    persist({ ...data, testReports: [...data.testReports, report] });
    return report;
  }, [data, persist, projectId]);

  const generateTestCaseReport = useCallback((caseId: string): TestReport => {
    const tc = data.testCases.find(c => c.id === caseId);
    const report: TestReport = {
      id: generateId(),
      projectId,
      title: `用例 ${tc?.caseNumber || ''} - 执行报告`,
      sourceType: 'test-case',
      sourceId: caseId,
      summary: `用例「${tc?.name}」(${tc?.caseNumber}) 执行结果：${tc?.result === 'pass' ? '通过' : tc?.result === 'fail' ? '失败' : '待测试'}`,
      totalCases: 1,
      passedCases: tc?.result === 'pass' ? 1 : 0,
      failedCases: tc?.result === 'fail' ? 1 : 0,
      pendingCases: tc?.result === 'pending' ? 1 : 0,
      generatedAt: new Date().toISOString(),
    };

    persist({ ...data, testReports: [...data.testReports, report] });
    return report;
  }, [data, persist, projectId]);

  // === Helper: 生成用例编号 ===
  const getNextCaseNumber = useCallback((category: string): string => {
    const abbr = TEST_ITEM_CATEGORY_ABBR[category] || 'XX';
    const existing = data.testCases.filter(tc => tc.category === category);
    const num = existing.length + 1;
    return `TC-${abbr}-${String(num).padStart(4, '0')}`;
  }, [data.testCases]);

  return {
    data,
    addTestItem, updateTestItem, deleteTestItem,
    addTestCase, updateTestCase, deleteTestCase,
    addTestLog, deleteTestLog,
    addTestScreenshot, deleteTestScreenshot,
    addParameterConfig, updateParameterConfig, deleteParameterConfig,
    addBug, updateBug, deleteBug, transitionBugStatus,
    generateTestItemReport, generateTestCaseReport,
    getNextCaseNumber,
  };
}
