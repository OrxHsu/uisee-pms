import React, { useState, useRef } from 'react';
import { useModuleData } from '@/hooks/useModuleData';
import { cn } from '@/utils/helpers';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { LiquidDatePicker } from '@/components/common/LiquidDatePicker';
import { BaseModal } from '@/components/common/BaseModal';
import {
  Database,
  Map,
  Network,
  Eye,
  Scan,
  FileText,
  Combine,
  Edit2,
  Plus,
  X,
  Trash2,
  AlertTriangle,
  HardDrive,
  Calendar,
  CheckCircle2,
  Check,
  FolderOpen,
  File,
  Link,
} from 'lucide-react';

interface DataManagementModuleProps {
  projectId: string;
}

type TabType = 'collection-data' | 'localization-map' | 'road-network';

const tabs = [
  { key: 'collection-data' as TabType, label: '采集数据管理', icon: Database },
  { key: 'localization-map' as TabType, label: '定位地图管理', icon: Map },
  { key: 'road-network' as TabType, label: '路网管理', icon: Network },
];

export const DataManagementModule: React.FC<DataManagementModuleProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('collection-data');
  const [moduleData, setModuleData] = useModuleData<DataManagementState>(
    projectId,
    'data-management',
    () => defaultDataManagementState
  );

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

      {activeTab === 'collection-data' && <CollectionDataContent moduleData={moduleData} setModuleData={setModuleData} />}
      {activeTab === 'localization-map' && <LocalizationMapContent moduleData={moduleData} setModuleData={setModuleData} />}
      {activeTab === 'road-network' && <RoadNetworkContent moduleData={moduleData} setModuleData={setModuleData} />}
    </div>
  );
};

/* ==================== 数据类型多选组件 ==================== */

const DATA_TYPE_OPTIONS = [
  { value: 'Lidar数据', label: 'Lidar数据' },
  { value: 'Camera数据', label: 'Camera数据' },
  { value: 'CAN数据', label: 'CAN数据' },
  { value: 'GPS数据', label: 'GPS数据' },
];

const DataTypeMultiSelect: React.FC<{
  value: string[];
  onChange: (value: string[]) => void;
}> = ({ value, onChange }) => {
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  return (
    <div className="liquid-glass-input w-full p-2 flex flex-wrap gap-2">
      {DATA_TYPE_OPTIONS.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer',
              selected
                ? 'bg-[#C199E0]/20 text-[#C199E0] ring-1 ring-[#C199E0]/30'
                : 'bg-[var(--glass-border)]/30 text-[var(--text-secondary)] hover:bg-[var(--glass-border)]/50'
            )}
          >
            <div className={cn(
              'w-4 h-4 rounded-md flex items-center justify-center border transition-all',
              selected
                ? 'bg-[#C199E0] border-[#C199E0]'
                : 'border-[var(--glass-border)] bg-transparent'
            )}>
              {selected && <Check size={10} className="text-white" />}
            </div>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

/* ==================== 采集数据管理 ==================== */

interface CollectionDataItem {
  id: string;
  batchName: string;
  dataType: string[];
  localPath: string;
  loshuBackupUrl: string;
  collectDate: string;
  dataSize: string;
  dataStatus: '已上传至交付群' | '已上传建图平台' | '中台建图处理中' | '中台已完成建图' | '此数据不可用';
  remark: string;
}

const CollectionDataContent: React.FC<SubComponentProps> = ({ moduleData, setModuleData }) => {
  const { collectionItems: items } = moduleData;

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<CollectionDataItem>({
    id: '',
    batchName: '',
    dataType: [],
    localPath: '',
    loshuBackupUrl: '',
    collectDate: '',
    dataSize: '',
    dataStatus: '已上传至交付群',
    remark: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      id: '',
      batchName: '',
      dataType: [],
      localPath: '',
      loshuBackupUrl: '',
      collectDate: '',
      dataSize: '',
      dataStatus: '已上传至交付群',
      remark: '',
    });
    setShowModal(true);
  };

  const handleEdit = (item: CollectionDataItem) => {
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
      setModuleData(prev => ({ ...prev, collectionItems: prev.collectionItems.filter((i) => i.id !== deleteId) }));
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleSave = () => {
    if (!formData.batchName.trim()) return;
    if (isEditing && editingId) {
      setModuleData(prev => ({ ...prev, collectionItems: prev.collectionItems.map((i) => (i.id === editingId ? { ...formData, id: editingId } : i)) }));
    } else {
      setModuleData(prev => ({ ...prev, collectionItems: [...prev.collectionItems, { ...formData, id: Date.now().toString() }] }));
    }
    setShowModal(false);
  };

  /** 从文件夹名解析采集日期，格式：YYYY-MM-DD-HH-mm-SS-mmm */
  const parseDateFromPath = (filePath: string): string => {
    if (!filePath) return '';
    const basename = filePath.split('/').pop()?.split('\\').pop() || '';
    // 匹配 YYYY-MM-DD-HH-mm-SS-mmm 格式
    const match = basename.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{3})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    // 尝试匹配路径中任何包含该格式的子串
    const partial = filePath.match(/(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{3})/);
    if (partial) {
      return `${partial[1]}-${partial[2]}-${partial[3]}`;
    }
    return '';
  };

  /** 将字节数格式化为人类可读大小 */
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const val = bytes / Math.pow(1024, i);
    return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  };

  /** 选择本地文件/文件夹 */
  const handleSelectPath = async () => {
    const isElectronEnv = typeof window !== 'undefined' && !!window.electronAPI;
    if (isElectronEnv) {
      try {
        const result = await window.electronAPI.showOpenDialog({
          title: '选择采集数据文件或文件夹',
          properties: ['openFile', 'openDirectory'],
        });
        if (!result.canceled && result.filePaths.length > 0) {
          const selectedPath = result.filePaths[0];
          const updates: Partial<CollectionDataItem> = { localPath: selectedPath };

          // 自动解析采集日期
          const dateStr = parseDateFromPath(selectedPath);
          if (dateStr) updates.collectDate = dateStr;

          // 自动计算数据大小
          try {
            const sizeBytes = await window.electronAPI.getPathSize(selectedPath);
            if (sizeBytes > 0) updates.dataSize = formatBytes(sizeBytes);
          } catch {}

          setFormData(prev => ({ ...prev, ...updates }));
        }
      } catch (err) {
        console.error('选择文件/文件夹失败:', err);
      }
    } else {
      // Web 模式 fallback：触发隐藏的 file input
      fileInputRef.current?.click();
    }
  };

  /** Web 模式下 file input 选择后的处理 */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const filePath = file.webkitRelativePath || file.name;
      const updates: Partial<CollectionDataItem> = { localPath: filePath };

      // 自动解析采集日期
      const dateStr = parseDateFromPath(filePath);
      if (dateStr) updates.collectDate = dateStr;

      // 自动计算大小（仅单文件）
      if (file.size > 0) updates.dataSize = formatBytes(file.size);

      setFormData(prev => ({ ...prev, ...updates }));
    }
    // 重置 input 以便再次选择同一文件
    e.target.value = '';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '中台已完成建图':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '中台建图处理中':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case '已上传至交付群':
        return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';
      case '已上传建图平台':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case '此数据不可用':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">采集数据列表</h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl transition-colors"
        >
          <Plus size={16} />
          新增采集数据
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="liquid-glass-card rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <HardDrive size={16} className="text-blue-500" />
                <span className="font-semibold text-[var(--text-primary)]">{item.batchName}</span>
                <span className={cn('px-2 py-0.5 rounded-lg text-xs font-medium', getStatusColor(item.dataStatus))}>
                  {item.dataStatus}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Database size={14} className="text-orange-500 flex-shrink-0" />
                  <span className="flex flex-wrap gap-1">
                    {item.dataType.map((t, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded-md text-xs bg-[var(--glass-border)]/40 text-[var(--text-secondary)]">{t}</span>
                    ))}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" title={item.localPath}>
                  <FolderOpen size={14} className="text-amber-500 flex-shrink-0" />
                  <span className="truncate">{item.localPath || '未指定'}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" title={item.loshuBackupUrl}>
                  <Link size={14} className="text-sky-500 flex-shrink-0" />
                  <span className="truncate">{item.loshuBackupUrl || '未备份'}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Calendar size={14} className="text-teal-500" />
                  <span>{item.collectDate}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <HardDrive size={14} className="text-purple-500" />
                  <span>{item.dataSize}</span>
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
        <BaseModal isOpen={true} onClose={() => setShowModal(false)} title={isEditing ? '编辑采集数据' : '新增采集数据'} size="md">
            {/* Web模式隐藏的文件选择器 */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              // webkitdirectory 允许选择文件夹
              {...({ webkitdirectory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
            />
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">数据名称</label>
                <input
                  type="text"
                  value={formData.batchName}
                  onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                  className="liquid-glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">数据本地存放地址</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <FolderOpen size={14} className="text-amber-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={formData.localPath}
                      onChange={(e) => setFormData({ ...formData, localPath: e.target.value })}
                      placeholder="点击右侧按钮选择或手动输入路径"
                      className="liquid-glass-input w-full px-3 py-2 text-sm min-w-0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectPath}
                    className="liquid-glass-btn px-4 py-2 rounded-xl text-sm font-medium text-[#C199E0] hover:bg-[#C199E0]/10 transition-colors flex-shrink-0 cursor-pointer"
                  >
                    选择路径
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">数据Loshu备份地址</label>
                <div className="flex items-center gap-2">
                  <Link size={14} className="text-sky-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={formData.loshuBackupUrl}
                    readOnly
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      setFormData({ ...formData, loshuBackupUrl: pastedText });
                    }}
                    placeholder="仅支持粘贴链接"
                    className="liquid-glass-input w-full px-3 py-2 text-sm min-w-0 cursor-text select-all"
                    style={{ caretColor: 'transparent' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">数据类型</label>
                <DataTypeMultiSelect
                  value={formData.dataType}
                  onChange={(v) => setFormData({ ...formData, dataType: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">采集日期</label>
                  <LiquidDatePicker value={formData.collectDate} onChange={(v) => setFormData({ ...formData, collectDate: v })} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">数据大小</label>
                  <div className="liquid-glass-input w-full px-3 py-2 text-sm flex items-center gap-2">
                    {formData.dataSize ? (
                      <span className="text-[var(--text-primary)]">{formData.dataSize}</span>
                    ) : (
                      <span className="text-[var(--text-tertiary)]">选择路径后自动计算</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">数据状态</label>
                <LiquidSelect
                  value={formData.dataStatus}
                  onChange={(v) => setFormData({ ...formData, dataStatus: v as CollectionDataItem['dataStatus'] })}
                  options={[
                    { value: '已上传至交付群', label: '已上传至交付群' },
                    { value: '已上传建图平台', label: '已上传建图平台' },
                    { value: '中台建图处理中', label: '中台建图处理中' },
                    { value: '中台已完成建图', label: '中台已完成建图' },
                    { value: '此数据不可用', label: '此数据不可用' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="liquid-glass-input w-full px-3 py-2 text-sm"
                  rows={2}
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
        </BaseModal>
      )}

      {showDeleteConfirm && (
        <BaseModal isOpen={true} onClose={() => setShowDeleteConfirm(false)} title="确认删除" size="sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm text-[var(--text-secondary)]">确定要删除这条采集数据吗？删除后将无法恢复。</p>
            </div>
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
        </BaseModal>
      )}
    </div>
  );
};

/* ==================== 定位地图管理 ==================== */

type MapType = 'visual' | 'lidar' | 'semantic' | 'coldstart';

const MAP_TYPE_CONFIG: Record<MapType, { label: string; icon: typeof Eye; color: string }> = {
  visual: { label: '视觉定位地图', icon: Eye, color: '#3B82F6' },
  lidar: { label: '激光定位地图', icon: Scan, color: '#10B981' },
  semantic: { label: '语义定位地图', icon: FileText, color: '#F59E0B' },
  coldstart: { label: '冷启动重定位地图', icon: Combine, color: '#8B5CF6' },
};

interface MapItem {
  id: string;
  mapType: MapType;
  mapName: string;
  mapArea: string;
  mapVersion: '首次建图' | '补充采集' | '定位重建';
  roadNetworkVersion: string;
  updateDate: string;
  currentStatus: '等待建图' | '建图中' | '建图完成' | '已上传地图管理平台' | '已更新至车端' | '地图验证中' | '地图验证完成';
}

const LocalizationMapContent: React.FC<SubComponentProps> = ({ moduleData, setModuleData }) => {
  const { mapItems } = moduleData;

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeMapType, setActiveMapType] = useState<MapType>('visual');
  const [formData, setFormData] = useState<MapItem>({
    id: '',
    mapType: 'visual',
    mapName: '',
    mapArea: '',
    mapVersion: '首次建图',
    roadNetworkVersion: 'RC1',
    updateDate: '',
    currentStatus: '等待建图',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = (mapType: MapType) => {
    setIsEditing(false);
    setEditingId(null);
    setActiveMapType(mapType);
    setFormData({
      id: '',
      mapType,
      mapName: '',
      mapArea: '',
      mapVersion: '首次建图',
      roadNetworkVersion: 'RC1',
      updateDate: '',
      currentStatus: '等待建图',
    });
    setShowModal(true);
  };

  const handleEdit = (item: MapItem) => {
    setIsEditing(true);
    setEditingId(item.id);
    setActiveMapType(item.mapType);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setModuleData(prev => ({ ...prev, mapItems: prev.mapItems.filter((i) => i.id !== deleteId) }));
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleSave = () => {
    if (!formData.mapName.trim()) return;
    if (isEditing && editingId) {
      setModuleData(prev => ({ ...prev, mapItems: prev.mapItems.map((i) => (i.id === editingId ? { ...formData, id: editingId } : i)) }));
    } else {
      setModuleData(prev => ({ ...prev, mapItems: [...prev.mapItems, { ...formData, id: Date.now().toString() }] }));
    }
    setShowModal(false);
  };


  const getMapStatusColor = (status: string) => {
    switch (status) {
      case '地图验证完成':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '已更新至车端':
        return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';
      case '已上传地图管理平台':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case '建图完成':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case '地图验证中':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case '建图中':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case '等待建图':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      default:
        return '';
    }
  };

  const typeConfig = MAP_TYPE_CONFIG[activeMapType];

  return (
    <div className="space-y-6">
      {/* 四个分类列表 */}
      {(Object.keys(MAP_TYPE_CONFIG) as MapType[]).map((mapType) => {
        const config = MAP_TYPE_CONFIG[mapType];
        const IconComp = config.icon;
        const filteredItems = mapItems.filter((item) => item.mapType === mapType);

        return (
          <div key={mapType}>
            {/* 分类头部 — 图标 + 名称 + 新增按钮 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: config.color + '18' }}
                >
                  <IconComp size={15} style={{ color: config.color }} />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {config.label}列表
                </h3>
                <span className="text-xs text-[var(--text-tertiary)] tabular-nums">
                  {filteredItems.length}
                </span>
              </div>
              <button
                onClick={() => handleAdd(mapType)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                style={{ color: config.color, backgroundColor: config.color + '12' }}
              >
                <Plus size={14} />
                新增{config.label}
              </button>
            </div>

            {/* 列表 */}
            {filteredItems.length === 0 ? (
              <div className="liquid-glass-card rounded-xl p-6 text-center text-sm text-[var(--text-tertiary)]">
                暂无{config.label}数据
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="liquid-glass-card rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Map size={16} style={{ color: config.color }} />
                        <span className="font-semibold text-[var(--text-primary)]">{item.mapName}</span>
                        <span className={cn('px-2 py-0.5 rounded-lg text-xs font-medium', getMapStatusColor(item.currentStatus))}>
                          {item.currentStatus}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Network size={14} className="text-blue-500" />
                          <span>{item.mapArea}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <CheckCircle2 size={14} className="text-green-500" />
                          <span>{item.mapVersion}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Network size={14} className="text-indigo-500" />
                          <span>{item.roadNetworkVersion}</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Calendar size={14} className="text-orange-500" />
                          <span>{item.updateDate}</span>
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
            )}
          </div>
        );
      })}

      {/* 新增/编辑弹窗 */}
      {showModal && (
        <BaseModal isOpen={true} onClose={() => setShowModal(false)}
          title={isEditing ? `编辑${typeConfig.label}` : `新增${typeConfig.label}`} size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">地图名称</label>
              <input
                type="text"
                value={formData.mapName}
                onChange={(e) => setFormData({ ...formData, mapName: e.target.value })}
                className="liquid-glass-input w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">地图区域</label>
              <input
                type="text"
                value={formData.mapArea}
                onChange={(e) => setFormData({ ...formData, mapArea: e.target.value })}
                className="liquid-glass-input w-full px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">地图版本</label>
                <LiquidSelect
                  value={formData.mapVersion}
                  onChange={(v) => setFormData({ ...formData, mapVersion: v as MapItem['mapVersion'] })}
                  options={[
                    { value: '首次建图', label: '首次建图' },
                    { value: '补充采集', label: '补充采集' },
                    { value: '定位重建', label: '定位重建' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">随地图发布路网版本</label>
                <LiquidSelect
                  value={formData.roadNetworkVersion}
                  onChange={(v) => setFormData({ ...formData, roadNetworkVersion: v })}
                  options={Array.from({ length: 99 }, (_, i) => ({
                    value: `RC${i + 1}`,
                    label: `RC${i + 1}`,
                  }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">当前状态</label>
              <LiquidSelect
                value={formData.currentStatus}
                onChange={(v) => setFormData({ ...formData, currentStatus: v as MapItem['currentStatus'] })}
                options={[
                  { value: '等待建图', label: '等待建图' },
                  { value: '建图中', label: '建图中' },
                  { value: '建图完成', label: '建图完成' },
                  { value: '已上传地图管理平台', label: '已上传地图管理平台' },
                  { value: '已更新至车端', label: '已更新至车端' },
                  { value: '地图验证中', label: '地图验证中' },
                  { value: '地图验证完成', label: '地图验证完成' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">更新日期</label>
              <LiquidDatePicker value={formData.updateDate} onChange={(v) => setFormData({ ...formData, updateDate: v })} />
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
        </BaseModal>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <BaseModal isOpen={true} onClose={() => setShowDeleteConfirm(false)} title="确认删除" size="sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">确定要删除这条地图数据吗？删除后将无法恢复。</p>
          </div>
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
        </BaseModal>
      )}
    </div>
  );
};

/* ==================== 路网管理 ==================== */

interface RoadNetworkItem {
  id: string;
  networkName: string;
  segmentCount: string;
  totalLength: string;
  updateDate: string;
  status: '已生效' | '待更新' | '草稿';
  remark: string;
}

/* ==================== 模块持久化状态 ==================== */

interface DataManagementState {
  collectionItems: CollectionDataItem[];
  mapItems: MapItem[];
  roadNetworkItems: RoadNetworkItem[];
}

const defaultDataManagementState: DataManagementState = {
  collectionItems: [
    {
      id: '1',
      batchName: '南沙港线束采集-2024Q1',
      dataType: ['Lidar数据', 'Camera数据'],
      localPath: '/data/collect/2024-03-15-09-30-12-050',
      loshuBackupUrl: 'https://loshu.uisee.com/data/nansha-2024q1',
      collectDate: '2024-03-15',
      dataSize: '2.4 TB',
      dataStatus: '中台已完成建图',
      remark: '覆盖全程86.5公里，晴天工况',
    },
    {
      id: '2',
      batchName: '松山湖环线采集-2024Q1',
      dataType: ['Lidar数据', 'Camera数据', 'GPS数据'],
      localPath: '/data/collect/2024-03-22-14-22-08-320',
      loshuBackupUrl: 'https://loshu.uisee.com/data/songshanhu-2024q1',
      collectDate: '2024-03-22',
      dataSize: '1.8 TB',
      dataStatus: '已上传建图平台',
      remark: '覆盖全程62.3公里，多云工况',
    },
    {
      id: '3',
      batchName: '盐田港夜间采集-2024Q2',
      dataType: ['Lidar数据', 'Camera数据', 'CAN数据'],
      localPath: '/data/collect/2024-04-10-21-15-33-180',
      loshuBackupUrl: '',
      collectDate: '2024-04-10',
      dataSize: '3.1 TB',
      dataStatus: '中台建图处理中',
      remark: '夜间低光照工况，持续采集中',
    },
  ],
  mapItems: [
    {
      id: '1',
      mapType: 'visual' as MapType,
      mapName: '南沙港视觉特征地图-v2.1',
      mapArea: '广州南沙港集装箱码头全域',
      mapVersion: '定位重建' as MapItem['mapVersion'],
      roadNetworkVersion: 'RC3',
      updateDate: '2024-03-20',
      currentStatus: '已更新至车端' as MapItem['currentStatus'],
    },
    {
      id: '2',
      mapType: 'visual' as MapType,
      mapName: '盐田港视觉特征地图-v1.8',
      mapArea: '深圳盐田港国际集装箱码头',
      mapVersion: '补充采集' as MapItem['mapVersion'],
      roadNetworkVersion: 'RC2',
      updateDate: '2024-02-15',
      currentStatus: '地图验证中' as MapItem['currentStatus'],
    },
    {
      id: '3',
      mapType: 'lidar' as MapType,
      mapName: '南沙港激光点云地图-v3.0',
      mapArea: '广州南沙港集装箱码头全域',
      mapVersion: '首次建图' as MapItem['mapVersion'],
      roadNetworkVersion: 'RC5',
      updateDate: '2024-03-18',
      currentStatus: '地图验证完成' as MapItem['currentStatus'],
    },
    {
      id: '4',
      mapType: 'semantic' as MapType,
      mapName: '南沙港语义地图-v1.2',
      mapArea: '广州南沙港集装箱码头全域',
      mapVersion: '补充采集' as MapItem['mapVersion'],
      roadNetworkVersion: 'RC4',
      updateDate: '2024-03-22',
      currentStatus: '建图完成' as MapItem['currentStatus'],
    },
    {
      id: '5',
      mapType: 'coldstart' as MapType,
      mapName: '南沙港冷启动重定位地图-v1.0',
      mapArea: '广州南沙港集装箱码头全域',
      mapVersion: '首次建图' as MapItem['mapVersion'],
      roadNetworkVersion: 'RC1',
      updateDate: '2024-04-01',
      currentStatus: '建图中' as MapItem['currentStatus'],
    },
  ],
  roadNetworkItems: [
    {
      id: '1',
      networkName: '南沙港-盐田港干线路网',
      segmentCount: '156',
      totalLength: '86.5 km',
      updateDate: '2024-03-25',
      status: '已生效',
      remark: '覆盖G4W广澳高速、S3广深沿江高速',
    },
    {
      id: '2',
      networkName: '前海-松山湖支线路网',
      segmentCount: '98',
      totalLength: '62.3 km',
      updateDate: '2024-03-28',
      status: '已生效',
      remark: '覆盖莞深高速、新城大道',
    },
    {
      id: '3',
      networkName: '盐田港内部作业路网',
      segmentCount: '45',
      totalLength: '12.8 km',
      updateDate: '2024-04-05',
      status: '待更新',
      remark: '港区内部道路，需补充最新车道变更',
    },
  ],
};

interface SubComponentProps {
  moduleData: DataManagementState;
  setModuleData: React.Dispatch<React.SetStateAction<DataManagementState>>;
}

const RoadNetworkContent: React.FC<SubComponentProps> = ({ moduleData, setModuleData }) => {
  const { roadNetworkItems: items } = moduleData;

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RoadNetworkItem>({
    id: '',
    networkName: '',
    segmentCount: '',
    totalLength: '',
    updateDate: '',
    status: '草稿',
    remark: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      id: '',
      networkName: '',
      segmentCount: '',
      totalLength: '',
      updateDate: '',
      status: '草稿',
      remark: '',
    });
    setShowModal(true);
  };

  const handleEdit = (item: RoadNetworkItem) => {
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
      setModuleData(prev => ({ ...prev, roadNetworkItems: prev.roadNetworkItems.filter((i) => i.id !== deleteId) }));
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleSave = () => {
    if (!formData.networkName.trim()) return;
    if (isEditing && editingId) {
      setModuleData(prev => ({ ...prev, roadNetworkItems: prev.roadNetworkItems.map((i) => (i.id === editingId ? { ...formData, id: editingId } : i)) }));
    } else {
      setModuleData(prev => ({ ...prev, roadNetworkItems: [...prev.roadNetworkItems, { ...formData, id: Date.now().toString() }] }));
    }
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已生效':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '待更新':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case '草稿':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">路网列表</h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl transition-colors"
        >
          <Plus size={16} />
          新增路网
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="liquid-glass-card rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Network size={16} className="text-indigo-500" />
                <span className="font-semibold text-[var(--text-primary)]">{item.networkName}</span>
                <span className={cn('px-2 py-0.5 rounded-lg text-xs font-medium', getStatusColor(item.status))}>
                  {item.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Map size={14} className="text-blue-500" />
                  <span>{item.segmentCount} 个路段</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Network size={14} className="text-green-500" />
                  <span>{item.totalLength}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Calendar size={14} className="text-orange-500" />
                  <span>{item.updateDate}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <FileText size={14} className="text-[var(--text-tertiary)]" />
                  <span className="truncate">{item.remark}</span>
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
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {isEditing ? '编辑路网' : '新增路网'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">路网名称</label>
                <input
                  type="text"
                  value={formData.networkName}
                  onChange={(e) => setFormData({ ...formData, networkName: e.target.value })}
                  className="liquid-glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">路段数量</label>
                  <input
                    type="text"
                    value={formData.segmentCount}
                    onChange={(e) => setFormData({ ...formData, segmentCount: e.target.value })}
                    className="liquid-glass-input w-full px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">总长度</label>
                  <input
                    type="text"
                    value={formData.totalLength}
                    onChange={(e) => setFormData({ ...formData, totalLength: e.target.value })}
                    className="liquid-glass-input w-full px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">更新日期</label>
                <LiquidDatePicker value={formData.updateDate} onChange={(v) => setFormData({ ...formData, updateDate: v })} />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">状态</label>
                <LiquidSelect
                  value={formData.status}
                  onChange={(v) => setFormData({ ...formData, status: v as RoadNetworkItem['status'] })}
                  options={[
                    { value: '草稿', label: '草稿' },
                    { value: '待更新', label: '待更新' },
                    { value: '已生效', label: '已生效' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="liquid-glass-input w-full px-3 py-2 text-sm"
                  rows={2}
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
            <p className="text-sm text-[var(--text-secondary)] mb-6">确定要删除这条路网数据吗？删除后将无法恢复。</p>
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
