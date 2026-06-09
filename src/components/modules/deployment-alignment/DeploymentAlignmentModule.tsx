import React, { useState } from 'react';
import { useModuleData } from '@/hooks/useModuleData';
import { cn } from '@/utils/helpers';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { BaseModal } from '@/components/common/BaseModal';
import {
  MapPin,
  Route,
  Star,
  Navigation,
  Clock,
  TrendingUp,
  Signal,
  Cloud,
  Thermometer,
  Camera,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Plus,
  X,
  Trash2,
  Gauge,
  Timer,
  LayoutGrid,
  Car,
  Sun,
  Landmark,
  Users,
  Wrench,
  Server,
  ChevronDown,
} from 'lucide-react';

interface DeploymentAlignmentModuleProps {
  projectId: string;
}

type TabType = 'route-detail' | 'route-score';

const tabs = [
  { key: 'route-detail' as TabType, label: '线路详情', icon: Route },
  { key: 'route-score' as TabType, label: '线路评分', icon: Star },
];

interface DeploymentAlignmentState {
  routes: RouteInfo[];
  selectedRoadTypes: string[];
  categories: ScoreCategory[];
}

const DEFAULT_CATEGORIES: ScoreCategory[] = [
  {
    id: '1',
    name: '基础通行能力',
    items: [
      { id: '1-1', name: 'U型掉头', score: 4, description: '', checked: false, children: [
        { id: '1-1-1', name: '转弯半径小', score: 2, description: '', checked: false },
        { id: '1-1-2', name: '转弯半径正常', score: 1, description: '', checked: false },
        { id: '1-1-3', name: '转弯半径大', score: 1, description: '', checked: false },
      ]},
      { id: '1-2', name: '狭窄区域通行', score: 4, description: '', checked: false, children: [
        { id: '1-2-1', name: '实际可通行宽度小', score: 2, description: '', checked: false },
        { id: '1-2-2', name: '实际可通行宽度中', score: 1, description: '', checked: false },
        { id: '1-2-3', name: '实际可通行宽度大', score: 1, description: '', checked: false },
      ]},
      { id: '1-3', name: '坡道', score: 4, description: '', checked: false, children: [
        { id: '1-3-1', name: '驻坡', score: 2, description: '', checked: false },
        { id: '1-3-2', name: '坡起', score: 1, description: '', checked: false },
        { id: '1-3-3', name: '溜坡', score: 1, description: '', checked: false },
      ]},
      { id: '1-4', name: '隧道', score: 3, description: '', checked: false, children: [
        { id: '1-4-1', name: '隧道会车', score: 2, description: '', checked: false },
        { id: '1-4-2', name: '狭窄隧道', score: 1, description: '', checked: false },
      ]},
      { id: '1-5', name: '路口通行', score: 4, description: '', checked: false, children: [
        { id: '1-5-1', name: '无信号灯交叉路口', score: 4, description: '', checked: false },
      ]},
      { id: '1-6', name: '空旷区域不规则通道', score: 3, description: '', checked: false, children: [
        { id: '1-6-1', name: '车辆行驶轨迹不可预测', score: 3, description: '', checked: false },
      ]},
      { id: '1-7', name: '坑洼 / 破损路面', score: 4, description: '', checked: false },
      { id: '1-8', name: '井盖、排水沟盖板凹凸', score: 4, description: '', checked: false },
    ],
  },
  {
    id: '2',
    name: '环境适应能力',
    items: [
      { id: '2-1', name: '扬尘 / 浓雾 / 蒸汽', score: 4, description: '', checked: false },
      { id: '2-2', name: '夜间运营', score: 4, description: '', checked: false, children: [
        { id: '2-2-1', name: '夜间灯光条件', score: 4, description: '', checked: false },
      ]},
      { id: '2-3', name: '冷启动', score: 3, description: '', checked: false, children: [
        { id: '2-3-1', name: '室内冷启动', score: 2, description: '', checked: false },
        { id: '2-3-2', name: '充电区冷启动', score: 1, description: '', checked: false },
      ]},
      { id: '2-4', name: '限速', score: 4, description: '', checked: false, children: [
        { id: '2-4-1', name: '盲区限速', score: 1, description: '', checked: false },
        { id: '2-4-2', name: '天气限速', score: 1, description: '', checked: false },
        { id: '2-4-3', name: '路网限速', score: 1, description: '', checked: false },
        { id: '2-4-4', name: '重载下坡限速', score: 1, description: '', checked: false },
      ]},
    ],
  },
  {
    id: '3',
    name: '设施交互能力',
    items: [
      { id: '3-1', name: '卷帘门', score: 4, description: '', checked: false, children: [
        { id: '3-1-1', name: '地磁', score: 1, description: '', checked: false },
        { id: '3-1-2', name: '红外', score: 1, description: '', checked: false },
        { id: '3-1-3', name: '激光', score: 1, description: '', checked: false },
        { id: '3-1-4', name: '云控', score: 1, description: '', checked: false },
      ]},
      { id: '3-2', name: '闸机', score: 4, description: '', checked: false, children: [
        { id: '3-2-1', name: '人工识别', score: 1, description: '', checked: false },
        { id: '3-2-2', name: '车牌识别', score: 2, description: '', checked: false },
        { id: '3-2-3', name: '云控', score: 1, description: '', checked: false },
      ]},
      { id: '3-3', name: '红绿灯', score: 4, description: '', checked: false, children: [
        { id: '3-3-1', name: '云控', score: 2, description: '', checked: false },
        { id: '3-3-2', name: '协同', score: 1, description: '', checked: false },
        { id: '3-3-3', name: '识别', score: 1, description: '', checked: false },
      ]},
      { id: '3-4', name: '精准停靠', score: 3, description: '', checked: false, children: [
        { id: '3-4-1', name: '精度', score: 1, description: '', checked: false },
        { id: '3-4-2', name: '正向进站对接月台', score: 1, description: '', checked: false },
        { id: '3-4-3', name: '倒车对接平台', score: 1, description: '', checked: false },
      ]},
    ],
  },
  {
    id: '4',
    name: '人车 / 异种车辆交互能力',
    items: [
      { id: '4-1', name: '室内可移动货物', score: 4, description: '', checked: false, children: [
        { id: '4-1-1', name: '是否遮挡雷达', score: 4, description: '', checked: false },
      ]},
      { id: '4-2', name: '大货车通行', score: 4, description: '', checked: false, children: [
        { id: '4-2-1', name: '倒车场景', score: 2, description: '', checked: false },
        { id: '4-2-2', name: '超车场景', score: 2, description: '', checked: false },
      ]},
      { id: '4-3', name: 'AGV 交互', score: 4, description: '', checked: false, children: [
        { id: '4-3-1', name: '稳定感知', score: 2, description: '', checked: false },
        { id: '4-3-2', name: '避障能力', score: 2, description: '', checked: false },
      ]},
      { id: '4-4', name: '行人无序穿插', score: 3, description: '', checked: false },
    ],
  },
  {
    id: '5',
    name: '作业执行能力',
    items: [
      { id: '5-1', name: '自动脱挂钩', score: 4, description: '', checked: false, children: [
        { id: '5-1-1', name: '纯脱钩', score: 2, description: '', checked: false },
        { id: '5-1-2', name: '脱挂钩', score: 2, description: '', checked: false },
      ]},
      { id: '5-2', name: '自动充电', score: 4, description: '', checked: false },
    ],
  },
  {
    id: '6',
    name: '云平台与调度',
    items: [
      { id: '6-1', name: '多车协同', score: 3, description: '', checked: false, children: [
        { id: '6-1-1', name: '云端协同', score: 1, description: '', checked: false },
        { id: '6-1-2', name: '空闲站点识别', score: 1, description: '', checked: false },
        { id: '6-1-3', name: 'stop sign 观察', score: 1, description: '', checked: false },
      ]},
      { id: '6-2', name: '私有云部署', score: 3, description: '', checked: false },
      { id: '6-3', name: '云端调度', score: 3, description: '', checked: false },
      { id: '6-4', name: '线路切换', score: 3, description: '', checked: false, children: [
        { id: '6-4-1', name: '备选路线重规划', score: 3, description: '', checked: false },
      ]},
    ],
  },
  {
    id: '7',
    name: '临时动态工况',
    items: [
      { id: '7-1', name: '临时动态工况', score: 5, description: '', checked: false, children: [
        { id: '7-1-1', name: '临时占道 / 物料堆垛', score: 2, description: '', checked: false },
        { id: '7-1-2', name: '道路施工 / 封路检修', score: 2, description: '', checked: false },
        { id: '7-1-3', name: '遗落障碍物', score: 1, description: '', checked: false },
      ]},
    ],
  },
];

const mergeCategoriesWithDefaults = (savedCategories: ScoreCategory[]): ScoreCategory[] => {
  return DEFAULT_CATEGORIES.map(defaultCat => {
    const savedCat = savedCategories.find(cat => cat.id === defaultCat.id);
    if (!savedCat) return defaultCat;
    
    const mergedItems = defaultCat.items.map(defaultItem => {
      const savedItem = savedCat.items.find(item => item.id === defaultItem.id);
      if (!savedItem) return defaultItem;
      
      return {
        ...defaultItem,
        checked: savedItem.checked ?? defaultItem.checked,
        children: defaultItem.children?.map(defaultChild => {
          const savedChild = savedItem.children?.find(child => child.id === defaultChild.id);
          return {
            ...defaultChild,
            checked: savedChild?.checked ?? defaultChild.checked,
          };
        }) ?? defaultItem.children,
      };
    });
    
    return {
      ...defaultCat,
      items: mergedItems,
    };
  });
};

const getDefaultDeploymentAlignmentData = (): DeploymentAlignmentState => ({
  routes: [
    {
      id: '1',
      name: '广州南沙港 - 深圳盐田港测试线路',
      startPoint: '广州南沙港集装箱码头',
      endPoint: '深圳盐田港国际集装箱码头',
      totalDistance: '86.5',
      estimatedTime: '1小时42分钟',
      roadType: '高速公路、城市快速路',
      laneCount: '双向6车道',
      speedLimit: '80-120 km/h',
      operatingHours: '06:00-23:59',
    },
    {
      id: '2',
      name: '深圳前海 - 东莞松山湖测试线路',
      startPoint: '深圳前海自贸区',
      endPoint: '东莞松山湖科技产业园',
      totalDistance: '62.3',
      estimatedTime: '1小时15分钟',
      roadType: '城市快速路、开放道路',
      laneCount: '双向4-6车道',
      speedLimit: '60-100 km/h',
      operatingHours: '06:00-12:00',
    },
  ],
  selectedRoadTypes: [],
  categories: DEFAULT_CATEGORIES,
});

export const DeploymentAlignmentModule: React.FC<DeploymentAlignmentModuleProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('route-detail');

  const [moduleData, setModuleData] = useModuleData<DeploymentAlignmentState>(
    projectId,
    'deployment-alignment',
    getDefaultDeploymentAlignmentData
  );

  const mergedCategories = mergeCategoriesWithDefaults(moduleData.categories);

  const setRoutes = (action: React.SetStateAction<RouteInfo[]>) => {
    setModuleData(prev => ({
      ...prev,
      routes: typeof action === 'function' ? action(prev.routes) : action
    }));
  };

  const setSelectedRoadTypes = (action: React.SetStateAction<string[]>) => {
    setModuleData(prev => ({
      ...prev,
      selectedRoadTypes: typeof action === 'function' ? action(prev.selectedRoadTypes) : action
    }));
  };

  const setCategories = (action: React.SetStateAction<ScoreCategory[]>) => {
    setModuleData(prev => ({
      ...prev,
      categories: typeof action === 'function' ? action(prev.categories) : action
    }));
  };

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

      {activeTab === 'route-detail' && <RouteDetailContent routes={moduleData.routes} setRoutes={setRoutes} selectedRoadTypes={moduleData.selectedRoadTypes} setSelectedRoadTypes={setSelectedRoadTypes} />}
      {activeTab === 'route-score' && <RouteScoreContent categories={mergedCategories} setCategories={setCategories} />}
    </div>
  );
};

/* ==================== 线路详情 ==================== */

interface RouteInfo {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  totalDistance: string;
  estimatedTime: string;
  roadType: string;
  laneCount: string;
  speedLimit: string;
  operatingHours: string;
}

const ROAD_TYPE_OPTIONS = ['封闭道路', '开放道路', '城市快速路', '高速公路', '无人驾驶专用道路', '封闭但人车穿行道路', '未交付道路'];

interface RouteDetailContentProps {
  routes: RouteInfo[];
  setRoutes: React.Dispatch<React.SetStateAction<RouteInfo[]>>;
  selectedRoadTypes: string[];
  setSelectedRoadTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

const RouteDetailContent: React.FC<RouteDetailContentProps> = ({ routes, setRoutes, selectedRoadTypes, setSelectedRoadTypes }) => {

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RouteInfo>({
    id: '',
    name: '',
    startPoint: '',
    endPoint: '',
    totalDistance: '',
    estimatedTime: '',
    roadType: '',
    laneCount: '',
    speedLimit: '',
    operatingHours: '',
  });
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const parseEstimatedTime = (timeStr: string) => {
    const hMatch = timeStr.match(/(\d+)小时/);
    const mMatch = timeStr.match(/(\d+)分钟/);
    return {
      h: hMatch ? hMatch[1] : '',
      m: mMatch ? mMatch[1] : '',
    };
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      id: '', name: '', startPoint: '', endPoint: '', totalDistance: '', estimatedTime: '', roadType: '', laneCount: '', speedLimit: '', operatingHours: '',
    });
    setHours('');
    setMinutes('');
    setSelectedRoadTypes([]);
    setShowModal(true);
  };

  const openEditModal = (route: RouteInfo) => {
    setIsEditing(true);
    setEditingId(route.id);
    setFormData({ ...route });
    const { h, m } = parseEstimatedTime(route.estimatedTime);
    setHours(h);
    setMinutes(m);
    setSelectedRoadTypes(route.roadType ? route.roadType.split('、') : []);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setHours('');
    setMinutes('');
    setSelectedRoadTypes([]);
  };

  const toggleRoadType = (type: string) => {
    setSelectedRoadTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setRoutes(routes.filter((r) => r.id !== deleteId));
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.startPoint.trim() || !formData.endPoint.trim()) return;
    const estimatedTimeStr = `${hours ? hours + '小时' : ''}${minutes ? minutes + '分钟' : ''}` || '0分钟';
    const roadTypeStr = selectedRoadTypes.join('、');
    const dataToSave = {
      ...formData,
      estimatedTime: estimatedTimeStr,
      roadType: roadTypeStr,
    };
    if (isEditing && editingId) {
      setRoutes(routes.map((r) => (r.id === editingId ? { ...dataToSave, id: editingId } : r)));
    } else {
      const newRoute = { ...dataToSave, id: String(Date.now()) };
      setRoutes([...routes, newRoute]);
    }
    closeModal();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-[var(--text-secondary)]">共 {routes.length} 条线路</div>
        <button
          onClick={openAddModal}
          className="px-3 py-1.5 text-sm bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl transition-colors flex items-center gap-1"
        >
          <Plus size={16} />
          新增线路
        </button>
      </div>

      <div className="space-y-3">
        {routes.map((route) => (
          <div
            key={route.id}
            className="liquid-glass-card rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation size={18} className="text-[#C199E0]" />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{route.name}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-green-600" />
                    <span className="truncate">{route.startPoint}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-red-600" />
                    <span className="truncate">{route.endPoint}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Route size={12} className="text-blue-600" />
                    <span>{route.totalDistance} km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-blue-600" />
                    <span>{route.estimatedTime}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 text-xs text-[var(--text-tertiary)]">
                  <div className="flex items-center gap-1">
                    <Route size={12} className="text-orange-600" />
                    <span>道路类型：{route.roadType}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LayoutGrid size={12} className="text-purple-600" />
                    <span>车道：{route.laneCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge size={12} className="text-red-600" />
                    <span>限速：{route.speedLimit}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Timer size={12} className="text-teal-600" />
                    <span>运营时段：{route.operatingHours}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                <button
                  onClick={() => openEditModal(route)}
                  className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(route.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <BaseModal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? '编辑线路' : '新增线路'}
        size="xl"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">线路名称</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">起点</label>
            <input type="text" value={formData.startPoint} onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">终点</label>
            <input type="text" value={formData.endPoint} onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">总里程 (km)</label>
            <input type="text" value={formData.totalDistance} onChange={(e) => setFormData({ ...formData, totalDistance: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">预计用时</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                <input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="0" className="liquid-glass-input w-full px-3 py-2 text-sm" />
                <span className="text-sm text-[var(--text-secondary)] whitespace-nowrap">小时</span>
              </div>
              <div className="flex-1 flex items-center gap-2">
                <input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="0" className="liquid-glass-input w-full px-3 py-2 text-sm" />
                <span className="text-sm text-[var(--text-secondary)] whitespace-nowrap">分钟</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">道路类型</label>
            <div className="flex flex-wrap gap-2">
              {ROAD_TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleRoadType(type)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm border transition-colors outline-none focus:outline-none',
                    selectedRoadTypes.includes(type)
                      ? 'bg-[#C199E0] text-white border-[#C199E0]'
                      : 'liquid-glass-btn text-[var(--text-secondary)] border-[var(--glass-border)] hover:text-[var(--text-primary)]'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">车道数量</label>
            <input type="text" value={formData.laneCount} onChange={(e) => setFormData({ ...formData, laneCount: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">限速范围</label>
            <input type="text" value={formData.speedLimit} onChange={(e) => setFormData({ ...formData, speedLimit: e.target.value })} className="liquid-glass-input w-full px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">运营时段</label>
            <div className="flex items-center gap-2">
              <LiquidSelect
                value={formData.operatingHours.split('-')[0] || ''}
                onChange={(v) => {
                  const end = formData.operatingHours.split('-')[1] || '';
                  setFormData({ ...formData, operatingHours: v + (end ? '-' + end : '') });
                }}
                className="flex-1"
                placeholder="开始时间"
                options={Array.from({ length: 48 }, (_, i) => {
                  const h = Math.floor(i / 2).toString().padStart(2, '0');
                  const m = (i % 2 === 0 ? '00' : '30');
                  return { value: `${h}:${m}`, label: `${h}:${m}` };
                })}
              />
              <span className="text-[var(--text-secondary)] font-medium">-</span>
              <LiquidSelect
                value={formData.operatingHours.split('-')[1] || ''}
                onChange={(v) => {
                  const start = formData.operatingHours.split('-')[0] || '';
                  setFormData({ ...formData, operatingHours: (start ? start + '-' : '') + v });
                }}
                className="flex-1"
                placeholder="结束时间"
                options={Array.from({ length: 48 }, (_, i) => {
                  const h = Math.floor(i / 2).toString().padStart(2, '0');
                  const m = (i % 2 === 0 ? '00' : '30');
                  return { value: `${h}:${m}`, label: `${h}:${m}` };
                })}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!formData.name.trim() || !formData.startPoint.trim() || !formData.endPoint.trim()}
            className="px-4 py-2 bg-[#C199E0] text-white rounded-xl hover:bg-[#A87BC7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? '保存修改' : '确认添加'}
          </button>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        size="sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">确认删除</h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          确定要删除这条线路信息吗？删除后将无法恢复。
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={cancelDelete}
            className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]"
          >
            取消
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            确认删除
          </button>
        </div>
      </BaseModal>
    </div>
  );
};

/* ==================== 线路评分 ==================== */

type Difficulty = '简单' | '一般' | '困难';

interface ScoreItem {
  id: string;
  name: string;
  score: number;
  description: string;
  checked: boolean;
  children?: ScoreItem[];
}

interface ScoreCategory {
  id: string;
  name: string;
  items: ScoreItem[];
}

interface RouteScoreContentProps {
  categories: ScoreCategory[];
  setCategories: React.Dispatch<React.SetStateAction<ScoreCategory[]>>;
}

/* ==================== ScoreItemComponent — 父项/子项卡片 ==================== */

const CATEGORY_ACCENTS: Record<string, string> = {
  '1': '#7CB8E4', '2': '#E4C87C', '3': '#C4A8E8', '4': '#E8B4CC', '5': '#7CE4B4', '6': '#A4B8E8', '7': '#E8A4A4',
};

const ScoreItemComponent: React.FC<{
  item: ScoreItem;
  categoryId: string;
  onToggle: (categoryId: string, itemId: string) => void;
}> = ({ item, categoryId, onToggle }) => {
  const hasChildren = !!(item.children && item.children.length > 0);
  const [isExpanded, setIsExpanded] = useState(true);
  const accentColor = CATEGORY_ACCENTS[categoryId] || '#C199E0';

  const childrenChecked = item.children?.filter(c => c.checked).length ?? 0;
  const childrenTotal = item.children?.length ?? 0;
  const childrenScore = item.children?.reduce((s, c) => s + (c.checked ? c.score : 0), 0) ?? 0;
  const isParentExpanded = hasChildren && isExpanded;
  const isActive = isParentExpanded ? childrenChecked > 0 : item.checked;
  const displayScore = isParentExpanded ? (childrenScore || item.score) : item.score;

  return (
    <div className="space-y-2">
      {/* 父项卡片 — 纯liquid-glass材质，勾选态不改变任何着色 */}
      <div
        className="relative rounded-xl p-3.5 transition-all cursor-pointer overflow-hidden liquid-glass-card"
        onClick={() => { if (!isParentExpanded) onToggle(categoryId, item.id); }}
      >
        <div className="flex items-center gap-3">
          {/* 展开/收起按钮 */}
          {hasChildren ? (
            <button
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded-md transition-all flex-shrink-0 outline-none focus:outline-none',
                isExpanded ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'bg-[var(--glass-border)] text-[var(--text-tertiary)] hover:bg-[var(--accent)]/10'
              )}
            >
              <ChevronDown size={15} className={cn('transition-transform duration-200', isExpanded ? '' : '-rotate-90')} />
            </button>
          ) : (
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]/50" />
            </div>
          )}

          {/* 名称 — 始终统一色 */}
          <span className="text-sm font-medium flex-1 min-w-0 text-[var(--text-primary)]">
            {item.name}
          </span>

          {/* 分数徽章 — 始终统一色 */}
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold flex-shrink-0 tabular-nums bg-[var(--glass-border)]/60 text-[var(--text-tertiary)]">
            -{displayScore}分
          </span>

          {/* 勾选按钮 / 子项统计 */}
          {isParentExpanded ? (
            <span className="text-xs font-medium flex-shrink-0 tabular-nums text-[var(--text-tertiary)]">
              {childrenChecked}/{childrenTotal}
            </span>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(categoryId, item.id); }}
              className={cn(
                'w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all outline-none focus:outline-none',
                item.checked
                  ? 'bg-[var(--accent)] border-[var(--accent)]'
                  : 'border-[var(--text-tertiary)]/60 hover:border-[var(--accent)] bg-transparent'
              )}
            >
              {item.checked && <CheckCircle2 size={13} className="text-white" />}
            </button>
          )}
        </div>
      </div>

      {/* 子项列表 — 树形连接线 + 缩进子卡片（三级间距） */}
      {hasChildren && isExpanded && (
        <div className="relative ml-5 space-y-1.5">
          {/* 树形连接线 — 渐变光晕 */}
          <div className="absolute left-[7px] top-0 bottom-3 w-px"
            style={{ background: `linear-gradient(to bottom, ${accentColor}50, ${accentColor}30)` }} />
          {item.children!.map((child, idx) => (
            <div key={child.id} className="relative flex items-stretch">
              {/* 水平连接线 */}
              <div
                className="absolute left-[7px] w-3 h-px"
                style={{ top: '14px', background: `linear-gradient(to right, ${accentColor}40, transparent)` }}
              />
              <div
                className="absolute left-[5px] w-[5px] h-[5px] rounded-full"
                style={{ top: '12px', backgroundColor: accentColor + '35' }}
              />
              {/* 子项卡片 — 纯liquid-glass材质，勾选态不改变任何着色 */}
              <div
                className="ml-6 flex-1 rounded-xl p-2.5 transition-all cursor-pointer liquid-glass-card"
                onClick={() => onToggle(categoryId, child.id)}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-medium flex-1 min-w-0 text-[var(--text-primary)]">
                    {child.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums bg-[var(--glass-border)]/50 text-[var(--text-tertiary)]">
                    -{child.score}分
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggle(categoryId, child.id); }}
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all outline-none focus:outline-none',
                      child.checked
                        ? 'bg-[var(--accent)] border-[var(--accent)]'
                        : 'border-[var(--text-tertiary)]/50 hover:border-[var(--accent)] bg-transparent'
                    )}
                  >
                    {child.checked && <CheckCircle2 size={11} className="text-white" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ==================== RouteScoreContent ==================== */

const RouteScoreContent: React.FC<RouteScoreContentProps> = ({ categories, setCategories }) => {

  const toggleItemRecursive = (items: ScoreItem[], itemId: string): ScoreItem[] => {
    return items.map((item) => {
      if (item.id === itemId) {
        // 如果是父项且有子项，切换父项时也切换所有子项
        const newChecked = !item.checked;
        if (item.children) {
          return {
            ...item,
            checked: newChecked,
            children: item.children.map(c => ({ ...c, checked: newChecked })),
          };
        }
        return { ...item, checked: newChecked };
      }
      if (item.children) {
        return { ...item, children: toggleItemRecursive(item.children, itemId) };
      }
      return item;
    });
  };

  const toggleItem = (categoryId: string, itemId: string) => {
    // 基于已合并的 categories props 计算，而非 localStorage 旧数据
    const newCategories = categories.map((cat) =>
      cat.id === categoryId
        ? {
            ...cat,
            items: toggleItemRecursive(cat.items, itemId),
          }
        : cat
    );
    setCategories(newCategories);
  };

  // 减分制：计算需扣除的总分（仅统计叶子项/展开的父项）
  const calculateDeduction = (items: ScoreItem[]): number => {
    return items.reduce((sum, item) => {
      if (item.children) {
        // 有子项的：扣除所有已勾选子项的分数
        return sum + item.children.reduce((s, c) => s + (c.checked ? c.score : 0), 0);
      }
      // 无子项的叶子节点：勾选则扣除
      return sum + (item.checked ? item.score : 0);
    }, 0);
  };

  const totalDeduction = categories.reduce((sum, cat) => sum + calculateDeduction(cat.items), 0);
  const totalScore = Math.max(0, 100 - totalDeduction);

  // 统计勾选数量（只统计叶子项）
  const countCheckedLeaves = (items: ScoreItem[]): { total: number; checked: number } => {
    return items.reduce((acc, item) => {
      if (item.children) {
        const childCounts = countCheckedLeaves(item.children);
        return { total: acc.total + childCounts.total, checked: acc.checked + childCounts.checked };
      }
      return {
        total: acc.total + 1,
        checked: acc.checked + (item.checked ? 1 : 0),
      };
    }, { total: 0, checked: 0 });
  };

  const { total: totalItems, checked: checkedItems } = categories.reduce(
    (acc, cat) => {
      const counts = countCheckedLeaves(cat.items);
      return { total: acc.total + counts.total, checked: acc.checked + counts.checked };
    },
    { total: 0, checked: 0 }
  );

  const getOverallDifficulty = (score: number): Difficulty => {
    if (score >= 70) return '简单';
    if (score >= 40) return '一般';
    return '困难';
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case '简单':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '一般':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case '困难':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  const overallDifficulty = getOverallDifficulty(totalScore);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - totalScore / 100);

  const CATEGORY_ICONS: Record<string, React.ElementType> = {
    '1': Car,
    '2': Sun,
    '3': Landmark,
    '4': Users,
    '5': Wrench,
    '6': Server,
    '7': AlertTriangle,
  };

  // 每个分类的扣分统计
  const getCategoryStats = (cat: ScoreCategory) => {
    const deduction = calculateDeduction(cat.items);
    const { total, checked } = countCheckedLeaves(cat.items);
    return { deduction, total, checked };
  };

  return (
    <div className="space-y-6">
      {/* ★ 综合评分 — 大视觉区域 */}
      <div className="liquid-glass-strong rounded-2xl p-6 flex items-center gap-8">
        {/* 环形进度条 */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg width="96" height="96" className="-rotate-90">
            <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="4.5" className="text-[var(--glass-border)]" />
            <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round"
              className="text-[var(--accent)] transition-all duration-700 ease-out"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">{totalScore}</span>
            <span className="text-[11px] text-[var(--text-tertiary)]">满分 100</span>
          </div>
        </div>
        {/* 评分摘要 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-lg font-semibold text-[var(--text-primary)]">线路综合评分</div>
            <span className={cn(
              'px-3 py-1 text-xs rounded-full font-semibold',
              getDifficultyColor(overallDifficulty)
            )}>{overallDifficulty}</span>
          </div>
          <div className="text-sm text-[var(--text-secondary)] mb-3 tabular-nums">
            已扣除 {totalDeduction} 分 · 已勾选 {checkedItems}/{totalItems} 项
          </div>
          {/* 进度条 */}
          <div className="w-full h-3 bg-[var(--glass-border)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${totalScore}%`, backgroundColor: totalScore >= 70 ? '#22C55E60' : totalScore >= 40 ? '#F9731660' : '#EF444460' }}
            />
          </div>
        </div>
      </div>

      {/* ★ 分类评分 — 每个分类一个独立区块 */}
      <div className="space-y-6">
        {categories.map((category) => {
          const stats = getCategoryStats(category);
          const IconComponent = CATEGORY_ICONS[category.id];
          const accentColor = CATEGORY_ACCENTS[category.id] || '#C199E0';
          return (
            <div key={category.id}>
              {/* 分类头部 — 纯liquid-glass材质 */}
              <div className="liquid-glass-card rounded-xl px-4 py-3 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  {IconComponent && (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: accentColor + '15' }}>
                      <IconComponent size={16} style={{ color: accentColor }} />
                    </div>
                  )}
                  <span className="text-base font-semibold text-[var(--text-primary)] flex-1">{category.name}</span>
                  <span className="text-xs font-semibold text-[var(--text-tertiary)] tabular-nums flex-shrink-0">
                    扣{stats.deduction}分 · {stats.checked}/{stats.total}项
                  </span>
                </div>
                {/* 分类迷你进度条 */}
                <div className="w-full h-1.5 bg-[var(--glass-border)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(0, 100 - stats.deduction)}%`,
                      backgroundColor: accentColor + '60'
                    }} />
                </div>
              </div>
              {/* 分类下的评分项 — 二级间距 */}
              <div className="space-y-3 pl-1">
                {category.items.map((item) => (
                  <ScoreItemComponent
                    key={item.id}
                    item={item}
                    categoryId={category.id}
                    onToggle={toggleItem}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
