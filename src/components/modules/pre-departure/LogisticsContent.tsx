import React, { useState } from 'react';
import { Plus, Package, Truck } from 'lucide-react';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { BaseModal } from '@/components/common/BaseModal';
import type { MaterialItem, LogisticsItem } from './PreDepartureModule';

// 模拟可查询到物流信息的单号列表（真实环境应调用物流API）
const MOCK_QUERYABLE_NUMBERS = ['SF1234567890', 'SF0987654321'];

const getMaterialStatus = (item: MaterialItem) => {
  if (!item.trackingNumber) {
    return { label: '未发货', color: 'bg-red-500/10 text-red-400' };
  }
  if (!MOCK_QUERYABLE_NUMBERS.includes(item.trackingNumber)) {
    return { label: '待发货', color: 'bg-yellow-500/10 text-yellow-400' };
  }
  return { label: '已发货', color: 'bg-green-500/10 text-green-400' };
};

const getLogisticsStatus = (item: LogisticsItem) => {
  if (!item.trackingNumber) {
    return { label: '未发货', color: 'bg-red-500/10 text-red-400' };
  }
  if (!MOCK_QUERYABLE_NUMBERS.includes(item.trackingNumber)) {
    return { label: '待发货', color: 'bg-yellow-500/10 text-yellow-400' };
  }
  return { label: '已发货', color: 'bg-green-500/10 text-green-400' };
};

interface LogisticsContentProps {
  materials: MaterialItem[];
  setMaterials: React.Dispatch<React.SetStateAction<MaterialItem[]>>;
  logistics: LogisticsItem[];
  setLogistics: React.Dispatch<React.SetStateAction<LogisticsItem[]>>;
}

export const LogisticsContent: React.FC<LogisticsContentProps> = ({ materials, setMaterials, logistics, setLogistics }) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'logistics'>('materials');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'material' | 'truck'>('material');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [expandedMaterialId, setExpandedMaterialId] = useState<string | null>(null);
  const [expandedLogisticsId, setExpandedLogisticsId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: '',
    trackingNumber: '',
    company: '',
    truckNumber: '',
    driver: '',
    phone: '',
    departureTime: '',
    arrivalTime: '',
    remark: ''
  });

  const handleOpenModal = (type: 'material' | 'truck', itemId: string | null = null) => {
    setModalType(type);
    setIsEditing(itemId !== null);
    setEditingItemId(itemId);
    
    if (itemId) {
      if (type === 'material') {
        const item = materials.find(m => m.id === itemId);
        if (item) {
          setFormData({
            name: item.name,
            quantity: String(item.quantity),
            unit: item.unit,
            trackingNumber: item.trackingNumber,
            company: item.company,
            truckNumber: '',
            driver: '',
            phone: '',
            departureTime: '',
            arrivalTime: '',
            remark: item.remark
          });
        }
      } else {
        const item = logistics.find(l => l.id === itemId);
        if (item) {
          setFormData({
            name: '',
            quantity: '',
            unit: '',
            trackingNumber: item.trackingNumber,
            company: item.company,
            truckNumber: item.truckNumber,
            driver: item.driver,
            phone: item.phone,
            departureTime: item.departureTime,
            arrivalTime: item.arrivalTime,
            remark: item.remark
          });
        }
      }
    } else {
      setFormData({
        name: '',
        quantity: '',
        unit: '',
        trackingNumber: '',
        company: '',
        truckNumber: '',
        driver: '',
        phone: '',
        departureTime: '',
        arrivalTime: '',
        remark: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (modalType === 'material') {
      if (!formData.name.trim() || !formData.quantity || !formData.unit) return;
      
      if (isEditing && editingItemId) {
        setMaterials(materials.map(item => 
          item.id === editingItemId 
            ? { ...item, name: formData.name, quantity: parseInt(formData.quantity), unit: formData.unit, trackingNumber: formData.trackingNumber, company: formData.company, remark: formData.remark }
            : item
        ));
      } else {
        const newMaterial: MaterialItem = {
          id: String(Date.now()),
          name: formData.name,
          quantity: parseInt(formData.quantity),
          unit: formData.unit,
          remark: formData.remark,
          trackingNumber: formData.trackingNumber,
          company: formData.company
        };
        setMaterials([newMaterial, ...materials]);
      }
    } else {
      if (!formData.company.trim() || !formData.driver.trim() || !formData.phone.trim()) return;
      
      if (isEditing && editingItemId) {
        setLogistics(logistics.map(item => 
          item.id === editingItemId 
            ? { ...item, company: formData.company, truckNumber: formData.truckNumber, driver: formData.driver, phone: formData.phone, departureTime: formData.departureTime, arrivalTime: formData.arrivalTime, trackingNumber: formData.trackingNumber, remark: formData.remark }
            : item
        ));
      } else {
        const newLogistics: LogisticsItem = {
          id: String(Date.now()),
          company: formData.company,
          truckNumber: formData.truckNumber,
          driver: formData.driver,
          phone: formData.phone,
          departureTime: formData.departureTime,
          arrivalTime: formData.arrivalTime,
          remark: formData.remark,
          trackingNumber: formData.trackingNumber
        };
        setLogistics([newLogistics, ...logistics]);
      }
    }
    setShowModal(false);
    setIsEditing(false);
    setEditingItemId(null);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter(item => item.id !== id));
  };

  const handleDeleteLogistics = (id: string) => {
    setLogistics(logistics.filter(item => item.id !== id));
  };

  const tabs = [
    { key: 'materials' as const, label: '配件物料', icon: Package },
    { key: 'logistics' as const, label: '拖车物流', icon: Truck },
  ];

  return (
    <div>
      {/* 标签切换 */}
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
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* 配件物料 */}
      {activeTab === 'materials' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-[var(--text-secondary)]">
              共 {materials.length} 项物料
            </div>
            <button 
              onClick={() => handleOpenModal('material')}
              className="px-3 py-1 text-sm text-[#C199E0] hover:text-[#A87BC7] flex items-center gap-1"
            >
              <Plus size={16} />
              添加物料
            </button>
          </div>

          {materials.map((item) => (
            <div key={item.id} className="liquid-glass-card rounded-xl p-4 cursor-pointer">
              <div 
                className="flex items-center justify-between mb-2"
                onClick={() => setExpandedMaterialId(expandedMaterialId === item.id ? null : item.id)}
              >
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-[var(--text-tertiary)]" />
                  <span className="font-medium text-[var(--text-primary)]">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getMaterialStatus(item).color}`}>
                    {getMaterialStatus(item).label}
                  </span>
                </div>
              </div>
              
              {expandedMaterialId === item.id && (
                <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                  <div className="text-sm text-[var(--text-secondary)] space-y-2 mb-4">
                    <div>数量：{item.quantity} {item.unit}</div>
                    {item.company && <div>物流公司：{item.company}</div>}
                    {item.trackingNumber && (
                      <div className="text-[#C199E0] font-medium">物流单号：{item.trackingNumber}</div>
                    )}
                    {item.trackingNumber && MOCK_QUERYABLE_NUMBERS.includes(item.trackingNumber) && (
                      <div className="mt-3 liquid-glass-card rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium text-green-400">运输中</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="text-[var(--text-tertiary)] shrink-0">当前:</span>
                            <span className="text-[var(--text-primary)]">[深圳转运中心]快件已到达，等待下一站中转</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-[var(--text-tertiary)] shrink-0">更新:</span>
                            <span className="text-[var(--text-secondary)]">2024-01-15 14:30:24</span>
                          </div>
                          <div className="border-l-2 border-[#C199E0]/30 pl-3 space-y-1.5">
                            <div className="text-[var(--text-secondary)]">• 14:30 [深圳转运中心] 快件已到达</div>
                            <div className="text-[var(--text-secondary)]">• 08:20 [广州分拨中心] 快件已发出，下一站【深圳转运中心】</div>
                            <div className="text-[var(--text-secondary)]">• 06:15 [广州收件点] 快件已被收件员揽收</div>
                            <div className="text-[var(--text-secondary)]">• 2024-01-14 [广州] 商家正在通知快递公司揽件</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {item.remark && <div>备注：{item.remark}</div>}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal('material', item.id);
                      }}
                      className="liquid-glass-btn px-3 py-1.5 text-sm rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      编辑
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMaterial(item.id);
                      }}
                      className="px-3 py-1.5 text-sm bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 拖车物流 */}
      {activeTab === 'logistics' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-[var(--text-secondary)]">
              共 {logistics.length} 条拖车信息
            </div>
            <button 
              onClick={() => handleOpenModal('truck')}
              className="px-3 py-1 text-sm text-[#C199E0] hover:text-[#A87BC7] flex items-center gap-1"
            >
              <Plus size={16} />
              添加拖车
            </button>
          </div>

          {logistics.map((item) => (
            <div key={item.id} className="liquid-glass-card rounded-xl p-4 cursor-pointer">
              <div 
                className="flex items-center justify-between mb-2"
                onClick={() => setExpandedLogisticsId(expandedLogisticsId === item.id ? null : item.id)}
              >
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-[var(--text-tertiary)]" />
                  <span className="font-medium text-[var(--text-primary)]">{item.company}</span>
                  <span className="text-sm text-[var(--text-secondary)]">({item.truckNumber})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getLogisticsStatus(item).color}`}>
                    {getLogisticsStatus(item).label}
                  </span>
                </div>
              </div>
              
              {expandedLogisticsId === item.id && (
                <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                  <div className="text-sm text-[var(--text-secondary)] space-y-2 mb-4">
                    <div>司机：{item.driver}</div>
                    <div>电话：{item.phone}</div>
                    <div>预计出发：{item.departureTime}</div>
                    {item.arrivalTime && <div>预计到达：{item.arrivalTime}</div>}
                    {item.trackingNumber && (
                      <div className="text-[#C199E0] font-medium">物流单号：{item.trackingNumber}</div>
                    )}
                    {item.trackingNumber && MOCK_QUERYABLE_NUMBERS.includes(item.trackingNumber) && (
                      <div className="mt-3 liquid-glass-card rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium text-green-400">运输中</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="text-[var(--text-tertiary)] shrink-0">当前:</span>
                            <span className="text-[var(--text-primary)]">[广州] 等待装车中，预计明早出发</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-[var(--text-tertiary)] shrink-0">更新:</span>
                            <span className="text-[var(--text-secondary)]">2024-01-15 16:20:10</span>
                          </div>
                          <div className="border-l-2 border-[#C199E0]/30 pl-3 space-y-1.5">
                            <div className="text-[var(--text-secondary)]">• 16:20 [广州] 货物已到达广州中转站，等待装车</div>
                            <div className="text-[var(--text-secondary)]">• 12:35 [广州] 货物已装车完毕，等待出发</div>
                            <div className="text-[var(--text-secondary)]">• 09:10 [高速服务区] 已行驶320公里，预计5小时后到达</div>
                            <div className="text-[var(--text-secondary)]">• 08:00 [出发地] 车辆已出发</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {item.remark && <div>备注：{item.remark}</div>}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal('truck', item.id);
                      }}
                      className="liquid-glass-btn px-3 py-1.5 text-sm rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      编辑
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLogistics(item.id);
                      }}
                      className="px-3 py-1.5 text-sm bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 弹窗 */}
      <BaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'material' ? (isEditing ? '编辑物料' : '添加物料') : (isEditing ? '编辑拖车' : '添加拖车')}
        size="md"
      >
        <div className="space-y-4">
          {modalType === 'material' ? (
            <>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  物料名称 *
                </label>
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
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">
                    数量 *
                  </label>
                  <LiquidSelect
                    value={formData.quantity}
                    onChange={(v) => setFormData({ ...formData, quantity: v })}
                    placeholder="请选择数量"
                    options={Array.from({ length: 99 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">
                    单位 *
                  </label>
                  <LiquidSelect
                    value={formData.unit}
                    onChange={(v) => setFormData({ ...formData, unit: v })}
                    placeholder="请选择单位"
                    options={[{ value: '个', label: '个' }, { value: '套', label: '套' }, { value: '件', label: '件' }, { value: '辆', label: '辆' }, { value: '台', label: '台' }, { value: '把', label: '把' }]}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  物流公司
                </label>
                <LiquidSelect
                  value={formData.company}
                  onChange={(v) => setFormData({ ...formData, company: v })}
                  placeholder="请选择物流公司"
                  options={[{ value: '顺丰物流', label: '顺丰物流' }, { value: '德邦物流', label: '德邦物流' }, { value: '中通快递', label: '中通快递' }, { value: '圆通速递', label: '圆通速递' }, { value: '申通快递', label: '申通快递' }, { value: '韵达快递', label: '韵达快递' }, { value: 'EMS', label: 'EMS' }, { value: '京东物流', label: '京东物流' }, { value: '百世快递', label: '百世快递' }, { value: '天天快递', label: '天天快递' }, { value: '优速快递', label: '优速快递' }, { value: '国通快递', label: '国通快递' }, { value: '全峰快递', label: '全峰快递' }, { value: '快捷快递', label: '快捷快递' }, { value: '其他', label: '其他' }]}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  物流单号
                </label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  placeholder="请输入物流单号"
                  className="liquid-glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  备注
                </label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  placeholder="请输入备注（可选）"
                  rows={2}
                  className="liquid-glass-input w-full resize-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  物流公司 *
                </label>
                <LiquidSelect
                  value={formData.company}
                  onChange={(v) => setFormData({ ...formData, company: v })}
                  placeholder="请选择物流公司"
                  options={[{ value: '顺丰物流', label: '顺丰物流' }, { value: '德邦物流', label: '德邦物流' }, { value: '中通快递', label: '中通快递' }, { value: '圆通速递', label: '圆通速递' }, { value: '申通快递', label: '申通快递' }, { value: '韵达快递', label: '韵达快递' }, { value: 'EMS', label: 'EMS' }, { value: '京东物流', label: '京东物流' }, { value: '百世快递', label: '百世快递' }, { value: '天天快递', label: '天天快递' }, { value: '优速快递', label: '优速快递' }, { value: '国通快递', label: '国通快递' }, { value: '全峰快递', label: '全峰快递' }, { value: '快捷快递', label: '快捷快递' }, { value: '其他', label: '其他' }]}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  车牌号
                </label>
                <input
                  type="text"
                  value={formData.truckNumber}
                  onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                  placeholder="请输入车牌号"
                  className="liquid-glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">
                    司机姓名
                  </label>
                  <input
                    type="text"
                    value={formData.driver}
                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                    placeholder="请输入司机姓名"
                    className="liquid-glass-input w-full px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">
                    联系电话
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="请输入联系电话"
                    className="liquid-glass-input w-full px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  预计出发时间
                </label>
                <input
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  className="liquid-glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  预计到达时间
                </label>
                <input
                  type="datetime-local"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  className="liquid-glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  物流单号
                </label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  placeholder="请输入物流单号"
                  className="liquid-glass-input w-full px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">
                  备注
                </label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  placeholder="请输入备注（可选）"
                  rows={2}
                  className="liquid-glass-input w-full resize-none"
                />
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowModal(false)}
            className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={modalType === 'material' ? (!formData.name.trim() || !formData.quantity || !formData.unit) : (!formData.company.trim() || !formData.driver.trim() || !formData.phone.trim())}
            className="px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? '保存修改' : '确认添加'}
          </button>
        </div>
      </BaseModal>
    </div>
  );
};
