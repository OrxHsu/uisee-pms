import React, { useState } from 'react';
import { useModuleData } from '@/hooks/useModuleData';
import { cn } from '@/utils/helpers';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { LiquidDatePicker } from '@/components/common/LiquidDatePicker';
import { BaseModal } from '@/components/common/BaseModal';
import {
  Rocket,
  Map,
  Network,
  TestTube,
  Settings,
  CheckSquare,
  Square,
  Plus,
  X,
  Edit2,
  Trash2,
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  HardDrive,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  Truck,
  Bus,
  Box,
  ChevronRight,
} from 'lucide-react';

interface DeploymentManagementModuleProps {
  projectId: string;
}

type TabType = 'localization-deploy' | 'roadnet-version' | 'roadnet-test' | 'function-deploy';

const tabs = [
  { key: 'localization-deploy' as TabType, label: '定位地图部署', icon: Map },
  { key: 'roadnet-version' as TabType, label: '路网版本管理', icon: Network },
  { key: 'roadnet-test' as TabType, label: '路网测试管理', icon: TestTube },
  { key: 'function-deploy' as TabType, label: '功能项部署管理', icon: Settings },
];

interface FunctionDeployData {
  aetFunctions: FunctionItem[];
  busFunctions: FunctionItem[];
  uboxFunctions: FunctionItem[];
}

interface DeploymentManagementState {
  checkItems: LocalizationCheckItem[];
  roadnetItems: RoadnetVersionItem[];
  qualityItems: QualityItem[];
  iterationItems: IterationItem[];
  logItems: LogItem[];
  functionDeploy: FunctionDeployData;
}

const DEFAULT_CHECK_ITEMS: LocalizationCheckItem[] = [
  { id: '1', name: '视觉定位地图已生成', description: '视觉特征地图已完成建图并通过质量校验', checked: false },
  { id: '2', name: '激光定位地图已生成', description: '激光点云地图已完成建图并通过质量校验', checked: false },
  { id: '3', name: '语义定位地图已生成', description: '语义标注地图已完成并验证通过', checked: false },
  { id: '4', name: '融合定位配置已确认', description: '多源融合定位参数已配置并生效', checked: false },
  { id: '5', name: '定位精度满足要求', description: '定位精度达到项目要求指标（±10cm以内）', checked: false },
  { id: '6', name: '地图版本已锁定', description: '当前部署地图版本已锁定，禁止非授权修改', checked: false },
  { id: '7', name: '地图数据已上传至车端', description: '地图数据包已成功推送至目标车辆', checked: false },
  { id: '8', name: '车端地图加载验证通过', description: '车辆端已成功加载地图并完成初始化验证', checked: false },
];

const DEFAULT_ROADNET_ITEMS: RoadnetVersionItem[] = [
  { id: '1', versionName: '南沙港-盐田港干线路网', versionNo: 'v3.2.1', updateDate: '2024-03-25', changeLog: '新增G4W广澳高速双向车道变更，修复S3沿江高速限速区段', status: '已生效', checked: false },
  { id: '2', versionName: '前海-松山湖支线路网', versionNo: 'v2.1.0', updateDate: '2024-03-28', changeLog: '优化莞深高速匝道拓扑，新增新城大道红绿灯数据', status: '待验证', checked: false },
  { id: '3', versionName: '盐田港内部作业路网', versionNo: 'v1.5.3', updateDate: '2024-04-05', changeLog: '补充港区内部车道变更数据，修正堆场边界', status: '草稿', checked: false },
];

const DEFAULT_QUALITY_ITEMS: QualityItem[] = [
  { id: '1', testRoute: '南沙港-盐田港干线', totalDistance: '86.5 km', positioningAccuracy: '±8.2 cm', successRate: '99.2%', testDate: '2024-03-25', status: '通过' },
  { id: '2', testRoute: '前海-松山湖支线', totalDistance: '62.3 km', positioningAccuracy: '±12.5 cm', successRate: '97.8%', testDate: '2024-03-28', status: '不通过' },
  { id: '3', testRoute: '盐田港内部作业区', totalDistance: '12.8 km', positioningAccuracy: '±6.8 cm', successRate: '99.5%', testDate: '2024-04-05', status: '通过' },
];

const DEFAULT_ITERATION_ITEMS: IterationItem[] = [
  { id: '1', iterationName: '南沙港匝道拓扑修正', versionFrom: 'v3.1.0', versionTo: 'v3.2.0', changeType: '拓扑修正', changeCount: '12处', updateDate: '2024-03-20', status: '已合并' },
  { id: '2', iterationName: '莞深高速新增互通', versionFrom: 'v2.0.0', versionTo: 'v2.1.0', changeType: '新增路段', changeCount: '3段', updateDate: '2024-03-25', status: '待审核' },
  { id: '3', iterationName: '盐田港限速属性更新', versionFrom: 'v1.5.0', versionTo: 'v1.5.3', changeType: '属性更新', changeCount: '28处', updateDate: '2024-04-01', status: '开发中' },
];

const DEFAULT_LOG_ITEMS: LogItem[] = [
  { id: '1', logName: '南沙港干线_20240325_定位测试', testRoute: '南沙港-盐田港干线', logSize: '12.5 GB', recordDate: '2024-03-25', logType: '定位log', status: '已归档' },
  { id: '2', logName: '莞深高速_20240328_全量测试', testRoute: '前海-松山湖支线', logSize: '28.3 GB', recordDate: '2024-03-28', logType: '全量log', status: '待分析' },
  { id: '3', logName: '盐田港内部_20240405_感知测试', testRoute: '盐田港内部作业区', logSize: '8.7 GB', recordDate: '2024-04-05', logType: '感知log', status: '分析中' },
];

export const DeploymentManagementModule: React.FC<DeploymentManagementModuleProps> = ({ projectId }) => {
  const [moduleData, setModuleData] = useModuleData<DeploymentManagementState>(
    projectId,
    'deployment-management',
    () => ({
      checkItems: DEFAULT_CHECK_ITEMS,
      roadnetItems: DEFAULT_ROADNET_ITEMS,
      qualityItems: DEFAULT_QUALITY_ITEMS,
      iterationItems: DEFAULT_ITERATION_ITEMS,
      logItems: DEFAULT_LOG_ITEMS,
      functionDeploy: {
        aetFunctions: AET_FUNCTIONS,
        busFunctions: BUS_FUNCTIONS,
        uboxFunctions: UBOX_FUNCTIONS,
      },
    })
  );
  const { checkItems, roadnetItems, qualityItems, iterationItems, logItems, functionDeploy } = moduleData;

  const setCheckItems = (action: LocalizationCheckItem[] | ((prev: LocalizationCheckItem[]) => LocalizationCheckItem[])) => {
    setModuleData(prev => ({ ...prev, checkItems: typeof action === 'function' ? action(prev.checkItems) : action }));
  };
  const setRoadnetItems = (action: RoadnetVersionItem[] | ((prev: RoadnetVersionItem[]) => RoadnetVersionItem[])) => {
    setModuleData(prev => ({ ...prev, roadnetItems: typeof action === 'function' ? action(prev.roadnetItems) : action }));
  };
  const setQualityItems = (action: QualityItem[] | ((prev: QualityItem[]) => QualityItem[])) => {
    setModuleData(prev => ({ ...prev, qualityItems: typeof action === 'function' ? action(prev.qualityItems) : action }));
  };
  const setIterationItems = (action: IterationItem[] | ((prev: IterationItem[]) => IterationItem[])) => {
    setModuleData(prev => ({ ...prev, iterationItems: typeof action === 'function' ? action(prev.iterationItems) : action }));
  };
  const setLogItems = (action: LogItem[] | ((prev: LogItem[]) => LogItem[])) => {
    setModuleData(prev => ({ ...prev, logItems: typeof action === 'function' ? action(prev.logItems) : action }));
  };
  const setFunctionDeploy = (action: FunctionDeployData | ((prev: FunctionDeployData) => FunctionDeployData)) => {
    setModuleData(prev => ({ ...prev, functionDeploy: typeof action === 'function' ? action(prev.functionDeploy) : action }));
  };

  const [activeTab, setActiveTab] = useState<TabType>('localization-deploy');

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`liquid-glass-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer outline-none focus:outline-none ${
              activeTab === key
                ? 'text-[var(--text-primary)] ring-1 ring-[#C199E0]/50'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'localization-deploy' && <LocalizationMapDeployContent checkItems={checkItems} setCheckItems={setCheckItems} />}
      {activeTab === 'roadnet-version' && <RoadNetworkVersionContent roadnetItems={roadnetItems} setRoadnetItems={setRoadnetItems} />}
      {activeTab === 'roadnet-test' && <RoadNetworkTestContent qualityItems={qualityItems} setQualityItems={setQualityItems} iterationItems={iterationItems} setIterationItems={setIterationItems} logItems={logItems} setLogItems={setLogItems} />}
      {activeTab === 'function-deploy' && <FunctionDeployContent functionDeploy={functionDeploy} setFunctionDeploy={setFunctionDeploy} />}
    </div>
  );
};

/* ==================== 定位地图部署 ==================== */

interface LocalizationCheckItem {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

interface LocalizationMapDeployContentProps {
  checkItems: LocalizationCheckItem[];
  setCheckItems: (action: LocalizationCheckItem[] | ((prev: LocalizationCheckItem[]) => LocalizationCheckItem[])) => void;
}

const LocalizationMapDeployContent: React.FC<LocalizationMapDeployContentProps> = ({ checkItems, setCheckItems }) => {
  const toggleCheck = (id: string) => {
    setCheckItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const checkedCount = checkItems.filter((i) => i.checked).length;
  const allChecked = checkedCount === checkItems.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">定位地图部署检查清单</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            请逐项确认定位地图部署前置条件，全部通过后可进行一键部署
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            'px-3 py-1 rounded-lg text-sm font-medium',
            allChecked
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          )}>
            {checkedCount} / {checkItems.length}
          </span>
          <button
            disabled={!allChecked}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl transition-colors',
              allChecked
                ? 'bg-[#C199E0] hover:bg-[#A87BC7] text-white'
                : 'liquid-glass-btn text-[var(--text-tertiary)] cursor-not-allowed opacity-50'
            )}
          >
            <Rocket size={16} />
            一键部署
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {checkItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleCheck(item.id)}
            className={cn(
              'liquid-glass-card rounded-xl p-4 cursor-pointer transition-all flex items-start gap-3',
              item.checked
                ? 'ring-1 ring-[#C199E0]/50 bg-[#C199E0]/10'
                : ''
            )}
          >
            <div className="mt-0.5">
              {item.checked ? (
                <CheckSquare size={20} className="text-[#C199E0]" />
              ) : (
                <Square size={20} className="text-[var(--text-tertiary)]" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-[var(--text-primary)]">{item.name}</div>
              <div className="text-sm text-[var(--text-secondary)] mt-0.5">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==================== 路网版本管理 ==================== */

interface RoadnetVersionItem {
  id: string;
  versionName: string;
  versionNo: string;
  updateDate: string;
  changeLog: string;
  status: '已生效' | '待验证' | '草稿';
  checked: boolean;
}

interface RoadNetworkVersionContentProps {
  roadnetItems: RoadnetVersionItem[];
  setRoadnetItems: (action: RoadnetVersionItem[] | ((prev: RoadnetVersionItem[]) => RoadnetVersionItem[])) => void;
}

const RoadNetworkVersionContent: React.FC<RoadNetworkVersionContentProps> = ({ roadnetItems, setRoadnetItems }) => {

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RoadnetVersionItem>({
    id: '',
    versionName: '',
    versionNo: '',
    updateDate: '',
    changeLog: '',
    status: '草稿',
    checked: false,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      id: '',
      versionName: '',
      versionNo: '',
      updateDate: '',
      changeLog: '',
      status: '草稿',
      checked: false,
    });
    setShowModal(true);
  };

  const handleEdit = (item: RoadnetVersionItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setRoadnetItems(roadnetItems.filter((i) => i.id !== deleteId));
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleSave = () => {
    if (!formData.versionName.trim()) return;
    if (isEditing && editingId) {
      setRoadnetItems(roadnetItems.map((i) => (i.id === editingId ? { ...formData, id: editingId } : i)));
    } else {
      setRoadnetItems([...roadnetItems, { ...formData, id: Date.now().toString() }]);
    }
    setShowModal(false);
  };

  const toggleCheck = (id: string) => {
    setRoadnetItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已生效':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '待验证':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case '草稿':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      default:
        return '';
    }
  };

  const checkedCount = roadnetItems.filter((i) => i.checked).length;
  const allChecked = checkedCount === roadnetItems.length && roadnetItems.length > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">路网版本列表</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">请确认所有路网版本正确后，可进行一键部署</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            'px-3 py-1 rounded-lg text-sm font-medium',
            allChecked
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          )}>
            {checkedCount} / {roadnetItems.length}
          </span>
          <button
            disabled={!allChecked}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl transition-colors',
              allChecked
                ? 'bg-[#C199E0] hover:bg-[#A87BC7] text-white'
                : 'liquid-glass-btn text-[var(--text-tertiary)] cursor-not-allowed opacity-50'
            )}
          >
            <Rocket size={16} />
            一键部署
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl transition-colors"
          >
            <Plus size={16} />
            新增版本
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {roadnetItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              'liquid-glass-card rounded-xl p-4 flex items-start justify-between gap-3',
              item.checked
                ? 'ring-1 ring-[#C199E0]/50 bg-[#C199E0]/10'
                : ''
            )}
          >
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={() => toggleCheck(item.id)}
                className="mt-0.5"
              >
                {item.checked ? (
                  <CheckSquare size={20} className="text-[#C199E0]" />
                ) : (
                  <Square size={20} className="text-[var(--text-tertiary)]" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Network size={16} className="text-indigo-500" />
                  <span className="font-semibold text-[var(--text-primary)]">{item.versionName}</span>
                  <span className="text-sm text-[var(--text-secondary)]">{item.versionNo}</span>
                  <span className={cn('px-2 py-0.5 rounded-lg text-xs font-medium', getStatusColor(item.status))}>
                    {item.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-orange-500" />
                    <span>{item.updateDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText size={14} className="text-[var(--text-tertiary)]" />
                    <span className="truncate">{item.changeLog}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(item)}
                className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="liquid-glass-strong p-6 w-full max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {isEditing ? '编辑路网版本' : '新增路网版本'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">版本名称</label>
                <input
                  type="text"
                  value={formData.versionName}
                  onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                  className="liquid-glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">版本号</label>
                  <input
                    type="text"
                    value={formData.versionNo}
                    onChange={(e) => setFormData({ ...formData, versionNo: e.target.value })}
                    className="liquid-glass-input w-full px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">更新日期</label>
                  <LiquidDatePicker value={formData.updateDate} onChange={(v) => setFormData({ ...formData, updateDate: v })} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">变更日志</label>
                <textarea
                  value={formData.changeLog}
                  onChange={(e) => setFormData({ ...formData, changeLog: e.target.value })}
                  className="liquid-glass-input w-full px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">状态</label>
                <LiquidSelect
                  value={formData.status}
                  onChange={(v) => setFormData({ ...formData, status: v as RoadnetVersionItem['status'] })}
                  options={[{ value: '草稿', label: '草稿' }, { value: '待验证', label: '待验证' }, { value: '已生效', label: '已生效' }]}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl"
                >
                  {isEditing ? '保存' : '创建'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="liquid-glass-strong p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">确认删除</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">确定要删除这个路网版本吗？删除后将无法恢复。</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==================== 路网测试管理 ==================== */

type TestSubTab = 'quality' | 'iteration' | 'log';

const testSubTabs = [
  { key: 'quality' as TestSubTab, label: '路网定位质量分析', icon: Activity },
  { key: 'iteration' as TestSubTab, label: '路网迭代管理', icon: Layers },
  { key: 'log' as TestSubTab, label: '路网测试log管理', icon: FileText },
];

/* --- 路网定位质量分析 --- */

interface QualityItem {
  id: string;
  testRoute: string;
  totalDistance: string;
  positioningAccuracy: string;
  successRate: string;
  testDate: string;
  status: '通过' | '不通过' | '待测试';
}

interface QualityAnalysisContentProps {
  qualityItems: QualityItem[];
  setQualityItems: (action: QualityItem[] | ((prev: QualityItem[]) => QualityItem[])) => void;
}

const QualityAnalysisContent: React.FC<QualityAnalysisContentProps> = ({ qualityItems, setQualityItems }) => {

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<QualityItem>({
    id: '',
    testRoute: '',
    totalDistance: '',
    positioningAccuracy: '',
    successRate: '',
    testDate: '',
    status: '待测试',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ id: '', testRoute: '', totalDistance: '', positioningAccuracy: '', successRate: '', testDate: '', status: '待测试' });
    setShowModal(true);
  };

  const handleEdit = (item: QualityItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) setQualityItems(qualityItems.filter((i) => i.id !== deleteId));
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleSave = () => {
    if (!formData.testRoute.trim()) return;
    if (isEditing && editingId) {
      setQualityItems(qualityItems.map((i) => (i.id === editingId ? { ...formData, id: editingId } : i)));
    } else {
      setQualityItems([...qualityItems, { ...formData, id: Date.now().toString() }]);
    }
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '通过':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '不通过':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case '待测试':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">路网定位质量分析</h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl transition-colors"
        >
          <Plus size={16} />
          新增测试记录
        </button>
      </div>

      <div className="space-y-3">
        {qualityItems.map((item) => (
          <div
            key={item.id}
            className="liquid-glass-card rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Activity size={16} className="text-teal-500" />
                <span className="font-semibold text-[var(--text-primary)]">{item.testRoute}</span>
                <span className={cn('px-2 py-0.5 rounded-lg text-xs font-medium', getStatusColor(item.status))}>
                  {item.status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-1">
                  <Network size={14} className="text-blue-500" />
                  <span>{item.totalDistance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span>精度 {item.positioningAccuracy}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className="text-orange-500" />
                  <span>成功率 {item.successRate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} className="text-purple-500" />
                  <span>{item.testDate}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={() => handleEdit(item)}
                className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="liquid-glass-strong p-6 w-full max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{isEditing ? '编辑测试记录' : '新增测试记录'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">测试路线</label>
                <input type="text" value={formData.testRoute} onChange={(e) => setFormData({ ...formData, testRoute: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">总里程</label>
                  <input type="text" value={formData.totalDistance} onChange={(e) => setFormData({ ...formData, totalDistance: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">定位精度</label>
                  <input type="text" value={formData.positioningAccuracy} onChange={(e) => setFormData({ ...formData, positioningAccuracy: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">成功率</label>
                  <input type="text" value={formData.successRate} onChange={(e) => setFormData({ ...formData, successRate: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">测试日期</label>
                  <LiquidDatePicker value={formData.testDate} onChange={(v) => setFormData({ ...formData, testDate: v })} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">状态</label>
                <LiquidSelect value={formData.status} onChange={(v) => setFormData({ ...formData, status: v as QualityItem['status'] })} options={[{ value: '待测试', label: '待测试' }, { value: '通过', label: '通过' }, { value: '不通过', label: '不通过' }]} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]">取消</button>
                <button onClick={handleSave} className="px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl">{isEditing ? '保存' : '创建'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="liquid-glass-strong p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"><AlertTriangle size={20} className="text-red-600 dark:text-red-400" /></div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">确认删除</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">确定要删除这条测试记录吗？删除后将无法恢复。</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]">取消</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- 路网迭代管理 --- */

interface IterationItem {
  id: string;
  iterationName: string;
  versionFrom: string;
  versionTo: string;
  changeType: '新增路段' | '删除路段' | '拓扑修正' | '属性更新';
  changeCount: string;
  updateDate: string;
  status: '已合并' | '待审核' | '开发中';
}

interface IterationManageContentProps {
  items: IterationItem[];
  setItems: (action: IterationItem[] | ((prev: IterationItem[]) => IterationItem[])) => void;
}

const IterationManageContent: React.FC<IterationManageContentProps> = ({ items, setItems }) => {

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<IterationItem>({
    id: '', iterationName: '', versionFrom: '', versionTo: '', changeType: '新增路段', changeCount: '', updateDate: '', status: '开发中',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    setIsEditing(false); setEditingId(null);
    setFormData({ id: '', iterationName: '', versionFrom: '', versionTo: '', changeType: '新增路段', changeCount: '', updateDate: '', status: '开发中' });
    setShowModal(true);
  };

  const handleEdit = (item: IterationItem) => { setIsEditing(true); setEditingId(item.id); setFormData({ ...item }); setShowModal(true); };
  const handleDelete = (id: string) => { setDeleteId(id); setShowDeleteConfirm(true); };
  const confirmDelete = () => { if (deleteId) setItems(items.filter((i) => i.id !== deleteId)); setShowDeleteConfirm(false); setDeleteId(null); };
  const handleSave = () => {
    if (!formData.iterationName.trim()) return;
    if (isEditing && editingId) { setItems(items.map((i) => (i.id === editingId ? { ...formData, id: editingId } : i))); }
    else { setItems([...items, { ...formData, id: Date.now().toString() }]); }
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已合并': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '待审核': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case '开发中': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return '';
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case '新增路段': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
      case '删除路段': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case '拓扑修正': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case '属性更新': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">路网迭代管理</h3>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl transition-colors"><Plus size={16} />新增迭代</button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="liquid-glass-card rounded-xl p-4 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Layers size={16} className="text-indigo-500" />
                <span className="font-semibold text-[var(--text-primary)]">{item.iterationName}</span>
                <span className={cn('px-2 py-0.5 rounded-lg text-xs font-medium', getChangeTypeColor(item.changeType))}>{item.changeType}</span>
                <span className={cn('px-2 py-0.5 rounded-lg text-xs font-medium', getStatusColor(item.status))}>{item.status}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-1"><ChevronRight size={14} className="text-blue-500" /><span>{item.versionFrom} → {item.versionTo}</span></div>
                <div className="flex items-center gap-1"><FileText size={14} className="text-green-500" /><span>变更 {item.changeCount}</span></div>
                <div className="flex items-center gap-1"><Calendar size={14} className="text-orange-500" /><span>{item.updateDate}</span></div>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <button onClick={() => handleEdit(item)} className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="liquid-glass-strong p-6 w-full max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{isEditing ? '编辑迭代' : '新增迭代'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">迭代名称</label>
                <input type="text" value={formData.iterationName} onChange={(e) => setFormData({ ...formData, iterationName: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">原版本</label>
                  <input type="text" value={formData.versionFrom} onChange={(e) => setFormData({ ...formData, versionFrom: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">目标版本</label>
                  <input type="text" value={formData.versionTo} onChange={(e) => setFormData({ ...formData, versionTo: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">变更类型</label>
                  <LiquidSelect value={formData.changeType} onChange={(v) => setFormData({ ...formData, changeType: v as IterationItem['changeType'] })} options={[{ value: '新增路段', label: '新增路段' }, { value: '删除路段', label: '删除路段' }, { value: '拓扑修正', label: '拓扑修正' }, { value: '属性更新', label: '属性更新' }]} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">变更数量</label>
                  <input type="text" value={formData.changeCount} onChange={(e) => setFormData({ ...formData, changeCount: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">更新日期</label>
                <LiquidDatePicker value={formData.updateDate} onChange={(v) => setFormData({ ...formData, updateDate: v })} />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">状态</label>
                <LiquidSelect value={formData.status} onChange={(v) => setFormData({ ...formData, status: v as IterationItem['status'] })} options={[{ value: '开发中', label: '开发中' }, { value: '待审核', label: '待审核' }, { value: '已合并', label: '已合并' }]} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]">取消</button>
                <button onClick={handleSave} className="px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl">{isEditing ? '保存' : '创建'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="liquid-glass-strong p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"><AlertTriangle size={20} className="text-red-600 dark:text-red-400" /></div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">确认删除</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">确定要删除这个迭代吗？删除后将无法恢复。</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]">取消</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- 路网测试log管理 --- */

interface LogItem {
  id: string;
  logName: string;
  testRoute: string;
  logSize: string;
  recordDate: string;
  logType: '定位log' | '感知log' | '规划log' | '控制log' | '全量log';
  status: '已归档' | '待分析' | '分析中';
}

interface LogManageContentProps {
  items: LogItem[];
  setItems: (action: LogItem[] | ((prev: LogItem[]) => LogItem[])) => void;
}

const LogManageContent: React.FC<LogManageContentProps> = ({ items, setItems }) => {

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LogItem>({
    id: '', logName: '', testRoute: '', logSize: '', recordDate: '', logType: '全量log', status: '待分析',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    setIsEditing(false); setEditingId(null);
    setFormData({ id: '', logName: '', testRoute: '', logSize: '', recordDate: '', logType: '全量log', status: '待分析' });
    setShowModal(true);
  };

  const handleEdit = (item: LogItem) => { setIsEditing(true); setEditingId(item.id); setFormData({ ...item }); setShowModal(true); };
  const handleDelete = (id: string) => { setDeleteId(id); setShowDeleteConfirm(true); };
  const confirmDelete = () => { if (deleteId) setItems(items.filter((i) => i.id !== deleteId)); setShowDeleteConfirm(false); setDeleteId(null); };
  const handleSave = () => {
    if (!formData.logName.trim()) return;
    if (isEditing && editingId) { setItems(items.map((i) => (i.id === editingId ? { ...formData, id: editingId } : i))); }
    else { setItems([...items, { ...formData, id: Date.now().toString() }]); }
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已归档': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '待分析': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      case '分析中': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return '';
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case '定位log': return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
      case '感知log': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case '规划log': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case '控制log': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case '全量log': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">路网测试log管理</h3>
        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl transition-colors"><Plus size={16} />新增log记录</button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="liquid-glass-card rounded-xl p-4 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <HardDrive size={16} className="text-blue-500" />
                <span className="font-semibold text-[var(--text-primary)]">{item.logName}</span>
                <span className={cn('px-2 py-0.5 rounded-lg text-xs font-medium', getLogTypeColor(item.logType))}>{item.logType}</span>
                <span className={cn('px-2 py-0.5 rounded-lg text-xs font-medium', getStatusColor(item.status))}>{item.status}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-1"><Network size={14} className="text-teal-500" /><span>{item.testRoute}</span></div>
                <div className="flex items-center gap-1"><HardDrive size={14} className="text-orange-500" /><span>{item.logSize}</span></div>
                <div className="flex items-center gap-1"><Calendar size={14} className="text-purple-500" /><span>{item.recordDate}</span></div>
              </div>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <button onClick={() => handleEdit(item)} className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"><Edit2 size={16} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="liquid-glass-strong p-6 w-full max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{isEditing ? '编辑log记录' : '新增log记录'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">log名称</label>
                <input type="text" value={formData.logName} onChange={(e) => setFormData({ ...formData, logName: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">测试路线</label>
                <input type="text" value={formData.testRoute} onChange={(e) => setFormData({ ...formData, testRoute: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">log大小</label>
                  <input type="text" value={formData.logSize} onChange={(e) => setFormData({ ...formData, logSize: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">记录日期</label>
                  <LiquidDatePicker value={formData.recordDate} onChange={(v) => setFormData({ ...formData, recordDate: v })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">log类型</label>
                  <LiquidSelect value={formData.logType} onChange={(v) => setFormData({ ...formData, logType: v as LogItem['logType'] })} options={[{ value: '定位log', label: '定位log' }, { value: '感知log', label: '感知log' }, { value: '规划log', label: '规划log' }, { value: '控制log', label: '控制log' }, { value: '全量log', label: '全量log' }]} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">状态</label>
                  <LiquidSelect value={formData.status} onChange={(v) => setFormData({ ...formData, status: v as LogItem['status'] })} options={[{ value: '待分析', label: '待分析' }, { value: '分析中', label: '分析中' }, { value: '已归档', label: '已归档' }]} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]">取消</button>
                <button onClick={handleSave} className="px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl">{isEditing ? '保存' : '创建'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="liquid-glass-strong p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"><AlertTriangle size={20} className="text-red-600 dark:text-red-400" /></div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">确认删除</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">确定要删除这条log记录吗？删除后将无法恢复。</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]">取消</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- 路网测试管理主组件 --- */

interface RoadNetworkTestContentProps {
  qualityItems: QualityItem[];
  setQualityItems: (action: QualityItem[] | ((prev: QualityItem[]) => QualityItem[])) => void;
  iterationItems: IterationItem[];
  setIterationItems: (action: IterationItem[] | ((prev: IterationItem[]) => IterationItem[])) => void;
  logItems: LogItem[];
  setLogItems: (action: LogItem[] | ((prev: LogItem[]) => LogItem[])) => void;
}

const RoadNetworkTestContent: React.FC<RoadNetworkTestContentProps> = ({ qualityItems, setQualityItems, iterationItems, setIterationItems, logItems, setLogItems }) => {
  const [activeSubTab, setActiveSubTab] = useState<TestSubTab>('quality');

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {testSubTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSubTab(key)}
            className={`liquid-glass-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer outline-none focus:outline-none ${
              activeSubTab === key
                ? 'text-[var(--text-primary)] ring-1 ring-[#C199E0]/50'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {activeSubTab === 'quality' && <QualityAnalysisContent qualityItems={qualityItems} setQualityItems={setQualityItems} />}
      {activeSubTab === 'iteration' && <IterationManageContent items={iterationItems} setItems={setIterationItems} />}
      {activeSubTab === 'log' && <LogManageContent items={logItems} setItems={setLogItems} />}
    </div>
  );
};

/* ==================== 功能项部署管理 ==================== */

type ProductType = 'AET' | 'BUS' | 'UBOX';

interface FunctionItem {
  id: string;
  name: string;
  description: string;
  checked: boolean;
}

interface ProductFunctionGroup {
  product: ProductType;
  icon: any;
  functions: FunctionItem[];
}

const AET_FUNCTIONS: FunctionItem[] = [
  { id: 'aet-1', name: '自动避障', description: '实时检测障碍物并自动规划绕行路径', checked: false },
  { id: 'aet-2', name: '自主泊车', description: '支持指定区域自动泊入/泊出', checked: false },
  { id: 'aet-3', name: '路径规划', description: '基于高精地图的最优路径动态规划', checked: false },
  { id: 'aet-4', name: '货物装载检测', description: '自动检测挂车连接状态及货物固定情况', checked: false },
  { id: 'aet-5', name: '自动充电', description: '低电量自动前往充电站并完成充电对接', checked: false },
  { id: 'aet-6', name: '远程监控', description: '云端实时监控车辆状态及运行轨迹', checked: false },
  { id: 'aet-7', name: '多车协同调度', description: '支持多辆牵引车协同作业与调度优化', checked: false },
  { id: 'aet-8', name: '交通信号识别', description: '识别红绿灯及交通标志并合规通行', checked: false },
  { id: 'aet-9', name: '行人检测', description: '实时检测行人及非机动车并主动避让', checked: false },
  { id: 'aet-10', name: '限速控制', description: '根据道路限速自动调整行驶速度', checked: false },
  { id: 'aet-11', name: '紧急制动', description: '紧急情况自动触发安全制动', checked: false },
  { id: 'aet-12', name: '雨雪天气适应', description: '恶劣天气下的感知增强与行驶策略调整', checked: false },
];

const BUS_FUNCTIONS: FunctionItem[] = [
  { id: 'bus-1', name: '自主导航', description: '基于高精地图的自主导航与路径跟踪', checked: false },
  { id: 'bus-2', name: '自主避障', description: '动态障碍物检测与智能绕行', checked: false },
  { id: 'bus-3', name: '智能调度', description: '云端调度系统实时优化发车间隔', checked: false },
  { id: 'bus-4', name: '自动停靠', description: '精准停靠站点，对齐候车区域', checked: false },
  { id: 'bus-5', name: '乘客上下车检测', description: '检测乘客上下车完成状态，安全关门', checked: false },
  { id: 'bus-6', name: '语音播报', description: '站点信息、安全提示自动语音播报', checked: false },
  { id: 'bus-7', name: '一键召车', description: '支持APP或站点一键召车请求', checked: false },
  { id: 'bus-8', name: '车道保持', description: '实时车道线识别与居中行驶控制', checked: false },
  { id: 'bus-9', name: '自适应巡航', description: '根据前车距离自动调整车速', checked: false },
  { id: 'bus-10', name: '自动变道', description: '安全条件下自主完成车道变换', checked: false },
  { id: 'bus-11', name: '站点到达提醒', description: '即将到站时自动提醒乘客准备下车', checked: false },
  { id: 'bus-12', name: '紧急情况处理', description: '突发状况自动靠边停车并报警', checked: false },
];

const UBOX_FUNCTIONS: FunctionItem[] = [
  { id: 'ubox-1', name: '自主配送', description: '按订单地址自动完成货物配送', checked: false },
  { id: 'ubox-2', name: '自主巡检', description: '按预设路线自动执行园区/街道巡检', checked: false },
  { id: 'ubox-3', name: '自主清扫', description: '自动执行道路或园区清扫作业', checked: false },
  { id: 'ubox-4', name: '一键召车', description: 'APP远程召唤车辆至指定位置', checked: false },
  { id: 'ubox-5', name: '一键泊车', description: '远程指令车辆自动寻找车位停放', checked: false },
  { id: 'ubox-6', name: '远程监控', description: '云端实时监控车辆位置与状态', checked: false },
  { id: 'ubox-7', name: '自主充电', description: '低电量自动返回充电桩对接充电', checked: false },
  { id: 'ubox-8', name: '物品识别', description: '配送过程中识别货物状态与完整性', checked: false },
  { id: 'ubox-9', name: '路径规划', description: '动态路径规划，支持多任务串联', checked: false },
  { id: 'ubox-10', name: '避障绕行', description: '复杂场景下的智能避障与绕行', checked: false },
  { id: 'ubox-11', name: '夜间模式', description: '夜间低光照环境下的感知增强', checked: false },
  { id: 'ubox-12', name: '多场景适配', description: '城中村、闹市区、园区等多场景自适应', checked: false },
];

interface FunctionDeployContentProps {
  functionDeploy: FunctionDeployData;
  setFunctionDeploy: (action: FunctionDeployData | ((prev: FunctionDeployData) => FunctionDeployData)) => void;
}

const FunctionDeployContent: React.FC<FunctionDeployContentProps> = ({ functionDeploy, setFunctionDeploy }) => {
  const [activeProduct, setActiveProduct] = useState<ProductType>('AET');
  const { aetFunctions, busFunctions, uboxFunctions } = functionDeploy;

  const getFunctions = () => {
    switch (activeProduct) {
      case 'AET': return aetFunctions;
      case 'BUS': return busFunctions;
      case 'UBOX': return uboxFunctions;
    }
  };

  const setFunctions = (funcs: FunctionItem[]) => {
    switch (activeProduct) {
      case 'AET': setFunctionDeploy(prev => ({ ...prev, aetFunctions: funcs })); break;
      case 'BUS': setFunctionDeploy(prev => ({ ...prev, busFunctions: funcs })); break;
      case 'UBOX': setFunctionDeploy(prev => ({ ...prev, uboxFunctions: funcs })); break;
    }
  };

  const toggleFunction = (id: string) => {
    setFunctions(getFunctions().map((f) => (f.id === id ? { ...f, checked: !f.checked } : f)));
  };

  const functions = getFunctions();
  const checkedCount = functions.filter((f) => f.checked).length;
  const allChecked = checkedCount === functions.length;

  const products: { key: ProductType; label: string; icon: any }[] = [
    { key: 'AET', label: 'AET 无人牵引车', icon: Truck },
    { key: 'BUS', label: 'BUS 无人驾驶巴士', icon: Bus },
    { key: 'UBOX', label: 'UBOX 城市服务无人车', icon: Box },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">功能项部署管理</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">选择产品类型，勾选需要部署的功能项</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            'px-3 py-1 rounded-lg text-sm font-medium',
            allChecked
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          )}>
            {checkedCount} / {functions.length}
          </span>
          <button
            disabled={!allChecked}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl transition-colors',
              allChecked
                ? 'bg-[#C199E0] hover:bg-[#A87BC7] text-white'
                : 'liquid-glass-btn text-[var(--text-tertiary)] cursor-not-allowed opacity-50'
            )}
          >
            <Rocket size={16} />
            一键部署
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {products.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveProduct(key)}
            className={`liquid-glass-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer outline-none focus:outline-none ${
              activeProduct === key
                ? 'text-[var(--text-primary)] ring-1 ring-[#C199E0]/50'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {functions.map((func) => (
          <div
            key={func.id}
            onClick={() => toggleFunction(func.id)}
            className={cn(
              'liquid-glass-card rounded-xl p-4 cursor-pointer transition-all flex items-start gap-3',
              func.checked
                ? 'ring-1 ring-[#C199E0]/50 bg-[#C199E0]/10'
                : ''
            )}
          >
            <div className="mt-0.5">
              {func.checked ? (
                <CheckSquare size={20} className="text-[#C199E0]" />
              ) : (
                <Square size={20} className="text-[var(--text-tertiary)]" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-[var(--text-primary)]">{func.name}</div>
              <div className="text-sm text-[var(--text-secondary)] mt-0.5">{func.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
