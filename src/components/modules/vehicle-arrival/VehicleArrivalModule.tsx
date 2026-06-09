import React, { useState } from 'react';
import { useModuleData } from '@/hooks/useModuleData';
import { Car, Package, AlertCircle, Bug, Plus, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { LiquidDatePicker } from '@/components/common/LiquidDatePicker';
import { BaseModal } from '@/components/common/BaseModal';
import { RichRemarkInput } from '@/components/common/RichRemarkInput';

interface RichMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
}

interface VehicleArrivalModuleProps {
  projectId: string;
}

type TabType = 'inspection' | 'materials' | 'missing' | 'issues';

const tabs = [
  { key: 'inspection' as TabType, label: '车辆到场检查', icon: Car },
  { key: 'materials' as TabType, label: '物料清单', icon: Package },
  { key: 'missing' as TabType, label: '缺失物料', icon: AlertCircle },
  { key: 'issues' as TabType, label: '问题管理', icon: Bug },
];

interface VehicleArrivalState {
  categories: CheckCategory[];
  materials: VehicleMaterial[];
  missingItems: MissingItem[];
  issues: VehicleIssue[];
}

interface MissingItem {
  id: string;
  name: string;
  quantity: number;
  priority: 'high' | 'medium';
}

interface VehicleIssue {
  id: string;
  title: string;
  description: string;
  link: string;
  priority: 'high' | 'medium';
  status: 'resolved' | 'unresolved';
  assignee: string;
  createdAt: string;
}

const getDefaultVehicleArrivalData = (): VehicleArrivalState => ({
  categories: [
    { id: 'vehicle-appearance', title: '车辆外观', description: '无外观损坏，无粘附物、封条完好，充电口关闭，天线组完好，急停按钮弹起，胎压正常，无变形破损，车内面板无损，座椅完好', status: '完成', remark: '', media: [] },
    { id: 'electrical-system', title: '电气系统', description: '可正常上电进入ready模式，转弯反馈正常无卡顿异响虚位，刹车力度适中，油门加速适中，灯光可正常切换喇叭响亮，双闪正常，脱钩/点动按钮正常', status: '完成', remark: '', media: [] },
    { id: 'peripheral', title: '外设', description: '车身标识贴纸外观完好，灭火器外观完好压力正常保险丝完整', status: '完成', remark: '', media: [] },
    { id: 'hardware-software', title: '硬件及软件', description: '激光雷达基座无变形松动旋转稳定无异响，摄像头/GPS无遮挡硬件连接稳定，HMI正常上电可正常操控，console后台可正常查看车辆上线及状态信息', status: '完成', remark: '', media: [] },
  ],
  materials: [
    { id: '1', name: '激光雷达配件包', quantity: 2, unit: '套', status: '已到现场', remark: '' },
    { id: '2', name: '摄像头防护罩', quantity: 4, unit: '个', status: '已到现场', remark: '' },
    { id: '3', name: '备用轮胎', quantity: 1, unit: '个', status: '未到现场', remark: '待采购' },
    { id: '4', name: '车载充电器', quantity: 2, unit: '个', status: '延期发货', remark: '还差1个' },
  ],
  missingItems: [
    { id: '1', name: '备用电池', quantity: 2, priority: 'high' as const },
    { id: '2', name: '电源线缆', quantity: 1, priority: 'medium' as const },
  ],
  issues: [
    {
      id: '1',
      title: '左侧摄像头角度偏移',
      description: '左侧摄像头安装角度需要调整',
      link: '',
      priority: 'high' as const,
      status: 'unresolved' as const,
      assignee: '现场工程师',
      createdAt: '2024-01-16',
    },
  ],
});

export const VehicleArrivalModule: React.FC<VehicleArrivalModuleProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('inspection');

  const [moduleData, setModuleData] = useModuleData<VehicleArrivalState>(
    projectId,
    'vehicle-arrival',
    getDefaultVehicleArrivalData
  );

  const setCategories = (action: React.SetStateAction<CheckCategory[]>) => {
    setModuleData(prev => ({
      ...prev,
      categories: typeof action === 'function' ? action(prev.categories) : action
    }));
  };

  const setMaterials = (action: React.SetStateAction<VehicleMaterial[]>) => {
    setModuleData(prev => ({
      ...prev,
      materials: typeof action === 'function' ? action(prev.materials) : action
    }));
  };

  const setMissingItems = (action: React.SetStateAction<MissingItem[]>) => {
    setModuleData(prev => ({
      ...prev,
      missingItems: typeof action === 'function' ? action(prev.missingItems) : action
    }));
  };

  const setIssues = (action: React.SetStateAction<VehicleIssue[]>) => {
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

      {activeTab === 'inspection' && <InspectionContent categories={moduleData.categories} setCategories={setCategories} />}
      {activeTab === 'materials' && <MaterialsContent materials={moduleData.materials} setMaterials={setMaterials} />}
      {activeTab === 'missing' && <MissingContent missingItems={moduleData.missingItems} setMissingItems={setMissingItems} />}
      {activeTab === 'issues' && <IssuesContent issues={moduleData.issues} setIssues={setIssues} />}
    </div>
  );
};

type StatusType = '完成' | '延期' | '缺失' | '其他';

interface CheckCategory {
  id: string;
  title: string;
  description: string;
  status: StatusType;
  remark: string;
  media: RichMedia[];
}

const getStatusColor = (status: StatusType) => {
  switch (status) {
    case '完成': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
    case '延期': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
    case '缺失': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
    case '其他': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
  }
};

interface InspectionContentProps {
  categories: CheckCategory[];
  setCategories: React.Dispatch<React.SetStateAction<CheckCategory[]>>;
}

const InspectionContent: React.FC<InspectionContentProps> = ({ categories, setCategories }) => {

  const updateStatus = (id: string, status: StatusType) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, status, remark: status === '完成' ? '' : cat.remark } : cat
    ));
  };

  const updateRemark = (id: string, remark: string) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, remark } : cat
    ));
  };

  const updateMedia = (id: string, media: RichMedia[]) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, media } : cat
    ));
  };

  const completedCount = categories.filter(cat => cat.status === '完成').length;
  const totalCount = categories.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div>
      {/* 进度条 */}
      <div className="liquid-glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#C199E0]">检查进度</h3>
            <p className="text-sm text-[var(--text-secondary)]">{completedCount}/{totalCount} 项已完成</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#C199E0]">{progress}%</div>
          </div>
        </div>
      </div>

      <div className="h-3 bg-[var(--glass-border)] rounded-full mb-6">
        <div
          className="h-3 bg-[#C199E0] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 大项列表 */}
      <div className="space-y-3">
        {categories.map(cat => (
          <div key={cat.id} className="liquid-glass-card rounded-xl p-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="font-bold text-[var(--text-primary)]">{cat.title}</div>
                <div className="text-sm text-[var(--text-secondary)] mt-1">{cat.description}</div>
              </div>

              <LiquidSelect
                value={cat.status}
                onChange={(v) => updateStatus(cat.id, v as StatusType)}
                options={[
                  { value: '完成', label: '完成' },
                  { value: '延期', label: '延期' },
                  { value: '缺失', label: '缺失' },
                  { value: '其他', label: '其他' },
                ]}
              />
            </div>
            
            <RichRemarkInput
              value={cat.remark}
              media={cat.media}
              onChange={(remark) => updateRemark(cat.id, remark)}
              onMediaChange={(media) => updateMedia(cat.id, media)}
              placeholder="请输入备注..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};

type ArrivalStatus = '已到现场' | '未到现场' | '延期发货';

interface VehicleMaterial {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: ArrivalStatus;
  remark: string;
}

const getArrivalStatusColor = (status: ArrivalStatus) => {
  switch (status) {
    case '已到现场': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
    case '未到现场': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
    case '延期发货': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
  }
};

interface MaterialsContentProps {
  materials: VehicleMaterial[];
  setMaterials: React.Dispatch<React.SetStateAction<VehicleMaterial[]>>;
}

const MaterialsContent: React.FC<MaterialsContentProps> = ({ materials, setMaterials }) => {

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', quantity: '', unit: '' });

  const updateStatus = (id: string, status: ArrivalStatus) => {
    setMaterials(materials.map(item =>
      item.id === id ? { ...item, status } : item
    ));
  };

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.quantity || !formData.unit) return;

    const newMaterial: VehicleMaterial = {
      id: String(Date.now()),
      name: formData.name,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      status: '未到现场',
      remark: '',
    };
    setMaterials([newMaterial, ...materials]);
    setFormData({ name: '', quantity: '', unit: '' });
    setShowModal(false);
  };

  const arrivedCount = materials.filter(item => item.status === '已到现场').length;
  const totalCount = materials.length;
  const progress = Math.round((arrivedCount / totalCount) * 100);

  return (
    <div>
      {/* 进度条 */}
      <div className="liquid-glass-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#C199E0]">物料到场进度</h3>
            <p className="text-sm text-[var(--text-secondary)]">{arrivedCount}/{totalCount} 项已到现场</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#C199E0]">{progress}%</div>
          </div>
        </div>
      </div>

      <div className="h-3 bg-[var(--glass-border)] rounded-full mb-6">
        <div
          className="h-3 bg-[#C199E0] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 表头 */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-[var(--text-secondary)]">
          共 {totalCount} 项物料
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl"
        >
          <Plus size={16} />
          添加非清单物料
        </button>
      </div>

      {/* 物料卡片 */}
      <div className="space-y-3">
        {materials.map((item) => (
          <div key={item.id} className="liquid-glass-card rounded-xl p-4 flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Package size={18} className="text-[var(--text-tertiary)] shrink-0" />
              <div>
                <div className="font-medium text-[var(--text-primary)]">{item.name}</div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {item.quantity} {item.unit}
                  {item.remark && <span className="ml-2">· {item.remark}</span>}
                </div>
              </div>
            </div>

            <LiquidSelect
              value={item.status}
              onChange={(v) => updateStatus(item.id, v as ArrivalStatus)}
              options={[
                { value: '已到现场', label: '已到现场' },
                { value: '未到现场', label: '未到现场' },
                { value: '延期发货', label: '延期发货' },
              ]}
            />
          </div>
        ))}
      </div>

      {/* 添加非清单物料弹窗 */}
      <BaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="添加非清单物料"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">物料名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入物料名称"
              className="liquid-glass-input w-full px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-[var(--text-secondary)] mb-1">数量 *</label>
              <LiquidSelect
                value={formData.quantity}
                onChange={(v) => setFormData({ ...formData, quantity: v })}
                options={Array.from({ length: 99 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
                placeholder="请选择数量"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[var(--text-secondary)] mb-1">单位 *</label>
              <LiquidSelect
                value={formData.unit}
                onChange={(v) => setFormData({ ...formData, unit: v })}
                options={[
                  { value: '个', label: '个' },
                  { value: '套', label: '套' },
                  { value: '件', label: '件' },
                  { value: '辆', label: '辆' },
                  { value: '台', label: '台' },
                  { value: '把', label: '把' },
                ]}
                placeholder="请选择单位"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowModal(false)}
            className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]"
          >
            取消
          </button>
          <button
            onClick={handleAdd}
            disabled={!formData.name.trim() || !formData.quantity || !formData.unit}
            className="px-4 py-2 bg-[#C199E0] text-white rounded-xl hover:bg-[#A87BC7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认添加
          </button>
        </div>
      </BaseModal>
    </div>
  );
};

interface MissingContentProps {
  missingItems: MissingItem[];
  setMissingItems: React.Dispatch<React.SetStateAction<MissingItem[]>>;
}

const MissingContent: React.FC<MissingContentProps> = ({ missingItems, setMissingItems }) => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', quantity: '', priority: 'medium' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openAddModal = () => {
    setIsEditing(false); setEditingId(null);
    setFormData({ name: '', quantity: '', priority: 'medium' });
    setShowModal(true);
  };

  const openEditModal = (item: typeof missingItems[0]) => {
    setIsEditing(true); setEditingId(item.id);
    setFormData({ name: item.name, quantity: String(item.quantity), priority: item.priority });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.quantity) return;
    if (isEditing && editingId) {
      setMissingItems(missingItems.map(item =>
        item.id === editingId
          ? { ...item, name: formData.name, quantity: parseInt(formData.quantity), priority: formData.priority as 'high' | 'medium' }
          : item
      ));
    } else {
      const newItem: MissingItem = {
        id: String(Date.now()),
        name: formData.name,
        quantity: parseInt(formData.quantity),
        priority: formData.priority as 'high' | 'medium',
      };
      setMissingItems([newItem, ...missingItems]);
    }
    setFormData({ name: '', quantity: '', priority: 'medium' });
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const openDeleteConfirm = (id: string) => { setDeletingId(id); setShowDeleteConfirm(true); };
  const handleDelete = () => {
    if (!deletingId) return;
    setMissingItems(missingItems.filter(item => item.id !== deletingId));
    setShowDeleteConfirm(false);
    setDeletingId(null);
  };
  const closeModal = () => {
    setShowModal(false); setIsEditing(false); setEditingId(null);
    setFormData({ name: '', quantity: '', priority: 'medium' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">缺失物料记录</h3>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700"
        >
          <Plus size={16} />
          添加缺失项
        </button>
      </div>

      <div className="space-y-4">
        {missingItems.map((item) => (
          <div key={item.id} className="liquid-glass-card rounded-xl p-4 ring-1 ring-pink-300/50 bg-pink-50/30 dark:ring-pink-900/30 dark:bg-pink-900/10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-[var(--text-primary)]">{item.name}</h4>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    item.priority === 'high'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  )}>
                    {item.priority === 'high' ? '紧急' : '普通'}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">缺失数量: {item.quantity}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => openDeleteConfirm(item.id)}
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

      {/* 添加/编辑缺失物料弹窗 */}
      <BaseModal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? '编辑缺失物料' : '添加缺失物料'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">物料名称 *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="请输入物料名称" className="liquid-glass-input w-full px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-[var(--text-secondary)] mb-1">缺失数量 *</label>
              <LiquidSelect
                value={formData.quantity}
                onChange={(v) => setFormData({ ...formData, quantity: v })}
                options={Array.from({ length: 99 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
                placeholder="请选择数量"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[var(--text-secondary)] mb-1">优先级 *</label>
              <LiquidSelect
                value={formData.priority}
                onChange={(v) => setFormData({ ...formData, priority: v })}
                options={[
                  { value: 'high', label: '紧急' },
                  { value: 'medium', label: '普通' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={closeModal} className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]">取消</button>
          <button onClick={handleSave} disabled={!formData.name.trim() || !formData.quantity} className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isEditing ? '保存修改' : '确认添加'}
          </button>
        </div>
      </BaseModal>

      {/* 删除确认弹窗 */}
      <BaseModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeletingId(null); }}
        title="确认删除"
        size="sm"
      >
        <p className="text-[var(--text-secondary)] mb-6">
          确定要删除这条缺失物料记录吗？此操作无法撤销。
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => { setShowDeleteConfirm(false); setDeletingId(null); }} className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]">取消</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">确认删除</button>
        </div>
      </BaseModal>
    </div>
  );
};

interface IssuesContentProps {
  issues: VehicleIssue[];
  setIssues: React.Dispatch<React.SetStateAction<VehicleIssue[]>>;
}

const IssuesContent: React.FC<IssuesContentProps> = ({ issues, setIssues }) => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', link: '', priority: 'medium' as 'high' | 'medium', status: 'unresolved' as 'resolved' | 'unresolved', assignee: '', createdAt: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openModal = () => {
    setIsEditing(false); setEditingId(null);
    setFormData({ title: '', description: '', link: '', priority: 'medium', status: 'unresolved', assignee: '', createdAt: '' });
    setShowModal(true);
  };

  const openEditModal = (issue: typeof issues[0]) => {
    setIsEditing(true); setEditingId(issue.id);
    setFormData({ title: issue.title, description: issue.description, link: issue.link, priority: issue.priority, status: issue.status, assignee: issue.assignee, createdAt: issue.createdAt });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false); setIsEditing(false); setEditingId(null);
    setFormData({ title: '', description: '', link: '', priority: 'medium', status: 'unresolved', assignee: '', createdAt: '' });
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.assignee.trim() || !formData.createdAt) return;
    if (isEditing && editingId) {
      setIssues(issues.map(issue =>
        issue.id === editingId
          ? { ...issue, ...formData }
          : issue
      ));
    } else {
      const newIssue = { id: String(Date.now()), ...formData };
      setIssues([newIssue, ...issues]);
    }
    closeModal();
  };

  const openDeleteConfirm = (id: string) => { setDeletingId(id); setShowDeleteConfirm(true); };
  const handleDelete = () => {
    if (!deletingId) return;
    setIssues(issues.filter(issue => issue.id !== deletingId));
    setShowDeleteConfirm(false);
    setDeletingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">车辆到场问题管理</h3>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
        >
          <Plus size={16} />
          新建问题
        </button>
      </div>

      <div className="space-y-4">
        {issues.map((issue) => (
          <div key={issue.id} className="liquid-glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-[var(--text-primary)]">{issue.title}</h4>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    issue.priority === 'high'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  )}>
                    {issue.priority === 'high' ? '紧急' : '普通'}
                  </span>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    issue.status === 'resolved'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  )}>
                    {issue.status === 'resolved' ? '已解决' : '未解决'}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-2">{issue.description}</p>
                <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                  <span>负责人: {issue.assignee}</span>
                  <span>创建时间: {issue.createdAt}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(issue)} className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors" title="编辑">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => openDeleteConfirm(issue.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="删除">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 新建问题弹窗 */}
      <BaseModal
        isOpen={showModal}
        onClose={closeModal}
        title={isEditing ? '编辑问题' : '新建问题'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">问题概述 *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="请输入问题概述" className="liquid-glass-input w-full px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">问题详情</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="请输入问题详情" rows={3} className="liquid-glass-input w-full resize-none" />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">缺陷链接</label>
            <input type="text" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="请输入缺陷链接" className="liquid-glass-input w-full px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">紧急程度 *</label>
              <LiquidSelect
                value={formData.priority}
                onChange={(v) => setFormData({ ...formData, priority: v as 'high' | 'medium' })}
                options={[
                  { value: 'high', label: '紧急' },
                  { value: 'medium', label: '普通' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">当前状态 *</label>
              <LiquidSelect
                value={formData.status}
                onChange={(v) => setFormData({ ...formData, status: v as 'resolved' | 'unresolved' })}
                options={[
                  { value: 'unresolved', label: '未解决' },
                  { value: 'resolved', label: '已解决' },
                ]}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">问题Owner *</label>
              <input type="text" value={formData.assignee} onChange={(e) => setFormData({ ...formData, assignee: e.target.value })} placeholder="请输入负责人" className="liquid-glass-input w-full px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">创建时间 *</label>
              <LiquidDatePicker value={formData.createdAt} onChange={(v) => setFormData({ ...formData, createdAt: v })} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={closeModal} className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]">取消</button>
          <button onClick={handleSave} disabled={!formData.title.trim() || !formData.assignee.trim() || !formData.createdAt} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isEditing ? '保存修改' : '确认添加'}
          </button>
        </div>
      </BaseModal>

      {/* 删除确认弹窗 */}
      <BaseModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeletingId(null); }}
        title="确认删除"
        size="sm"
      >
        <p className="text-[var(--text-secondary)] mb-6">
          确定要删除这条问题记录吗？此操作无法撤销。
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => { setShowDeleteConfirm(false); setDeletingId(null); }} className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]">取消</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">确认删除</button>
        </div>
      </BaseModal>
    </div>
  );
};
