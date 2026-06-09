import React, { useState } from 'react';
import { useModuleData } from '@/hooks/useModuleData';
import { cn } from '@/utils/helpers';
import { ClipboardCheck, TrendingUp, Bug, Truck } from 'lucide-react';
import { ChecklistContent } from './ChecklistContent';
import { CheckContent } from './CheckContent';
import { IssuesContent } from './IssuesContent';
import { LogisticsContent } from './LogisticsContent';
import { DEFAULT_DEPARTURE_CHECKLIST } from '@/constants/modules';

type TabType = 'checklist' | 'check' | 'issues' | 'logistics';

interface PreDepartureModuleProps {
  projectId: string;
}

// ===== Pre-departure 整体持久化状态 =====

export type StatusType = '完成' | '延期' | '缺失' | '其他';

export interface RichMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
}

export interface CheckItem {
  id: string;
  title: string;
  description: string;
  status: StatusType;
  remark: string;
  media: RichMedia[];
}

interface SubCategory {
  id: string;
  title: string;
  items: CheckItem[];
}

export interface MainCategory {
  id: string;
  title: string;
  subCategories?: SubCategory[];
  items?: CheckItem[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  status: StatusType;
  remark: string;
  media: RichMedia[];
}

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  remark: string;
  trackingNumber: string;
  company: string;
}

export interface LogisticsItem {
  id: string;
  company: string;
  truckNumber: string;
  driver: string;
  phone: string;
  departureTime: string;
  arrivalTime: string;
  remark: string;
  trackingNumber: string;
}

type DefectStatus = '未解决' | '已解决' | '分析中';

export interface Issue {
  id: string;
  title: string;
  category: string;
  description: string;
  defectLink: string;
  defectStatus: DefectStatus;
  status: 'open' | 'resolved';
}

export interface PreDepartureState {
  mainCategories: MainCategory[];
  checklistItems: ChecklistItem[];
  materials: MaterialItem[];
  logistics: LogisticsItem[];
  issues: Issue[];
}

const defaultMainCategories: MainCategory[] = [
  {
    id: 'vehicle-appearance',
    title: '车辆外观',
    items: [
      { id: 'front', title: '车前侧', description: '无外观损坏，无粘附物、封条完好', status: '完成', remark: '', media: [] },
      { id: 'side', title: '车身侧面', description: '无外观损坏，无粘附物、充电口关闭', status: '完成', remark: '', media: [] },
      { id: 'roof', title: '车顶部', description: '无外观损坏，无粘附物、天线组完好', status: '完成', remark: '', media: [] },
      { id: 'rear', title: '车辆尾部', description: '无外观损坏，无粘附物、急停按钮弹起', status: '完成', remark: '', media: [] },
      { id: 'tire', title: '轮胎', description: '胎压正常，无变形破损、纹路明显', status: '完成', remark: '', media: [] },
      { id: 'panel', title: '车内面板', description: '无损坏、按钮全部弹起', status: '完成', remark: '', media: [] },
      { id: 'seat', title: '座椅', description: '无外观损坏，车厢内没有违禁物品', status: '完成', remark: '', media: [] },
    ]
  },
  {
    id: 'electrical-system',
    title: '电气系统',
    items: [
      { id: 'power', title: '电源', description: '表显%，可正常上电、车辆进入ready模式', status: '完成', remark: '', media: [] },
      { id: 'steering', title: '转向系统', description: '转弯反馈正常，无明显卡顿、异响或虚位', status: '完成', remark: '', media: [] },
      { id: 'brake', title: '刹车系统', description: '刹车力度适中，无失效现象', status: '完成', remark: '', media: [] },
      { id: 'power-system', title: '动力系统', description: '油门加速适中，无异常加速', status: '完成', remark: '', media: [] },
      { id: 'lights', title: '灯光附件', description: '前灯光可正常切换，喇叭响亮，倒车灯光正常鸣笛响', status: '完成', remark: '', media: [] },
      { id: 'special-button', title: '特殊按钮', description: '双闪按钮功能正常', status: '完成', remark: '', media: [] },
      { id: 'electrical-other', title: '其他', description: '脱钩装置点动运动正常无卡顿、车辆点动按钮正常无卡顿失效', status: '完成', remark: '', media: [] },
    ]
  },
  {
    id: 'peripheral',
    title: '外设',
    items: [
      { id: 'body-marking', title: '车身标识', description: '安装或粘贴的标识、贴纸等外观完好', status: '完成', remark: '', media: [] },
      { id: 'fire-extinguisher', title: '灭火器', description: '灭火器外观完好，压力正常，保险丝完整', status: '完成', remark: '', media: [] },
      { id: 'peripheral-other', title: '其他', description: '', status: '完成', remark: '', media: [] },
    ]
  },
  {
    id: 'standby-check',
    title: '硬件及软件',
    subCategories: [
      {
        id: 'sensor',
        title: '传感器',
        items: [
          { id: 'lidar', title: '激光雷达', description: '基座无变形无松动、工作噪声低、旋转稳定无异响', status: '完成', remark: '', media: [] },
          { id: 'camera', title: '摄像头', description: '无遮挡', status: '完成', remark: '', media: [] },
          { id: 'gps', title: 'GPS', description: '无遮挡、硬件连接稳定', status: '完成', remark: '', media: [] },
        ]
      },
      {
        id: 'hmi',
        title: 'HMI',
        items: [
          { id: 'hmi-appearance', title: '外观', description: '正常上电、无显示问题，屏幕可正常操控', status: '完成', remark: '', media: [] },
          { id: 'hmi-software', title: '软件', description: '在无人驾驶线路内可以进入自动驾驶运营；确认车辆在待机位置显示和实际位置一致', status: '完成', remark: '', media: [] },
        ]
      },
      {
        id: 'backend',
        title: '云服务',
        items: [
          { id: 'web-status', title: 'console', description: '后台网页可以正常查看车辆上线；车辆位置以及状态信息无误', status: '完成', remark: '', media: [] },
        ]
      }
    ]
  }
];

const getDefaultPreDepartureData = (): PreDepartureState => ({
  mainCategories: defaultMainCategories,
  checklistItems: DEFAULT_DEPARTURE_CHECKLIST.map((title, index) => ({
    id: String(index + 1),
    title,
    status: '完成' as StatusType,
    remark: '',
    media: []
  })),
  materials: [
    { id: '1', name: '激光雷达配件包', quantity: 2, unit: '套', remark: '', trackingNumber: 'SF1234567890', company: '顺丰物流' },
    { id: '2', name: '摄像头防护罩', quantity: 4, unit: '个', remark: '', trackingNumber: 'SF0987654321', company: '顺丰物流' },
    { id: '3', name: '备用轮胎', quantity: 1, unit: '个', remark: '待采购', trackingNumber: '', company: '' },
    { id: '4', name: '车载充电器', quantity: 2, unit: '个', remark: '还差1个', trackingNumber: 'PENDING001', company: '顺丰物流' },
  ],
  logistics: [
    { id: '1', company: '顺丰物流', truckNumber: '京A12345', driver: '张师傅', phone: '138****1234', departureTime: '2024-01-15 08:00', arrivalTime: '2024-01-16 18:00', remark: '', trackingNumber: 'SF1234567890' },
    { id: '2', company: '德邦物流', truckNumber: '沪B67890', driver: '李师傅', phone: '139****5678', departureTime: '2024-01-16 09:00', arrivalTime: '', remark: '等待装车', trackingNumber: '' },
  ],
  issues: [
    { id: '1', title: '传感器校准偏差', category: 'pre-departure', description: '激光雷达校准存在偏差，需要重新校准', defectLink: '', defectStatus: '分析中', status: 'open' },
    { id: '2', title: '软件版本不匹配', category: 'pre-departure', description: '车载软件版本与测试环境不一致', defectLink: '', defectStatus: '已解决', status: 'resolved' },
  ],
});

const tabs = [
  { key: 'check' as TabType, label: '检查清单', icon: ClipboardCheck },
  { key: 'checklist' as TabType, label: '发车进度', icon: TrendingUp },
  { key: 'issues' as TabType, label: '发车问题', icon: Bug },
  { key: 'logistics' as TabType, label: '物流管理', icon: Truck },
];

export const PreDepartureModule: React.FC<PreDepartureModuleProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('check');

  const [moduleData, setModuleData] = useModuleData<PreDepartureState>(
    projectId,
    'pre-departure',
    getDefaultPreDepartureData
  );

  const setMainCategories = (action: React.SetStateAction<MainCategory[]>) => {
    setModuleData(prev => ({
      ...prev,
      mainCategories: typeof action === 'function' ? action(prev.mainCategories) : action
    }));
  };

  const setChecklistItems = (action: React.SetStateAction<ChecklistItem[]>) => {
    setModuleData(prev => ({
      ...prev,
      checklistItems: typeof action === 'function' ? action(prev.checklistItems) : action
    }));
  };

  const setMaterials = (action: React.SetStateAction<MaterialItem[]>) => {
    setModuleData(prev => ({
      ...prev,
      materials: typeof action === 'function' ? action(prev.materials) : action
    }));
  };

  const setLogistics = (action: React.SetStateAction<LogisticsItem[]>) => {
    setModuleData(prev => ({
      ...prev,
      logistics: typeof action === 'function' ? action(prev.logistics) : action
    }));
  };

  const setIssues = (action: React.SetStateAction<Issue[]>) => {
    setModuleData(prev => ({
      ...prev,
      issues: typeof action === 'function' ? action(prev.issues) : action
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

      {activeTab === 'checklist' && <ChecklistContent items={moduleData.checklistItems} setItems={setChecklistItems} />}
      {activeTab === 'check' && <CheckContent data={moduleData.mainCategories} setData={setMainCategories} />}
      {activeTab === 'issues' && <IssuesContent issues={moduleData.issues} setIssues={setIssues} />}
      {activeTab === 'logistics' && <LogisticsContent materials={moduleData.materials} setMaterials={setMaterials} logistics={moduleData.logistics} setLogistics={setLogistics} />}
    </div>
  );
};
