import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useTestManagementData } from './useTestManagementData';
import { ParameterConfig } from '@/types/module';
import { formatDate } from '@/utils/helpers';

interface Props {
  projectId: string;
}

interface ParamKV {
  key: string;
  value: string;
}

interface FormData {
  vehicleId: string;
  version: string;
  parameters: ParamKV[];
}

const defaultForm: FormData = {
  vehicleId: '', version: '', parameters: [{ key: '', value: '' }],
};

export const ParameterTab: React.FC<Props> = ({ projectId }) => {
  const { data, addParameterConfig, updateParameterConfig, deleteParameterConfig } = useTestManagementData(projectId);

  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterVersion, setFilterVersion] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  const filtered = data.parameterConfigs.filter(pc => {
    if (filterVehicle && !pc.vehicleId.toLowerCase().includes(filterVehicle.toLowerCase())) return false;
    if (filterVersion && !pc.version.toLowerCase().includes(filterVersion.toLowerCase())) return false;
    return true;
  });

  const openAdd = () => { setForm({ ...defaultForm, parameters: [{ key: '', value: '' }] }); setEditId(null); setShowModal(true); };
  const openEdit = (pc: ParameterConfig) => {
    const params: ParamKV[] = Object.entries(pc.parameters).map(([key, value]) => ({ key, value: String(value) }));
    setForm({ vehicleId: pc.vehicleId, version: pc.version, parameters: params.length > 0 ? params : [{ key: '', value: '' }] });
    setEditId(pc.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId.trim() || !form.version.trim()) return;
    const params: Record<string, any> = {};
    form.parameters.forEach(p => { if (p.key.trim()) params[p.key] = p.value; });
    if (editId) {
      updateParameterConfig(editId, { vehicleId: form.vehicleId, version: form.version, parameters: params });
    } else {
      addParameterConfig({ vehicleId: form.vehicleId, version: form.version, parameters: params });
    }
    setShowModal(false);
  };

  const addParam = () => setForm({ ...form, parameters: [...form.parameters, { key: '', value: '' }] });
  const removeParam = (idx: number) => {
    if (form.parameters.length <= 1) return;
    setForm({ ...form, parameters: form.parameters.filter((_, i) => i !== idx) });
  };
  const updateParam = (idx: number, field: 'key' | 'value', val: string) => {
    setForm({ ...form, parameters: form.parameters.map((p, i) => i === idx ? { ...p, [field]: val } : p) });
  };

  // 内联编辑键值对
  const updateParamInline = (pcId: string, key: string, newValue: string) => {
    const pc = data.parameterConfigs.find(p => p.id === pcId);
    if (!pc) return;
    const newParams = { ...pc.parameters, [key]: newValue };
    updateParameterConfig(pcId, { parameters: newParams });
  };

  const deleteParamInline = (pcId: string, key: string) => {
    const pc = data.parameterConfigs.find(p => p.id === pcId);
    if (!pc) return;
    const newParams = { ...pc.parameters };
    delete newParams[key];
    updateParameterConfig(pcId, { parameters: newParams });
  };

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)} placeholder="车辆ID" className="liquid-glass-input px-3 py-1.5 text-sm w-[160px]" />
        <input value={filterVersion} onChange={e => setFilterVersion(e.target.value)} placeholder="版本号" className="liquid-glass-input px-3 py-1.5 text-sm w-[160px]" />
        <button onClick={openAdd} className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#C199E0] hover:text-[#A87BC7] transition-colors cursor-pointer">
          <Plus size={14} /> 新增参数组
        </button>
      </div>

      {/* 手风琴卡片 */}
      <div className="space-y-2">
        {filtered.map(pc => {
          const isExpanded = expandedId === pc.id;
          const paramEntries = Object.entries(pc.parameters);
          return (
            <div key={pc.id} className="liquid-glass-card rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-3 cursor-pointer group" onClick={() => setExpandedId(isExpanded ? null : pc.id)}>
                <div className="flex items-center gap-2.5 relative z-10">
                  {isExpanded ? <ChevronDown size={14} className="text-[var(--text-tertiary)]" /> : <ChevronRight size={14} className="text-[var(--text-tertiary)]" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[var(--text-primary)]">{pc.vehicleId}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#C199E0]/10 text-[#C199E0]">{pc.version}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                      {paramEntries.length} 个参数 · 更新于 {formatDate(pc.updatedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-10" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(pc)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" title="编辑"><Edit2 size={13} /></button>
                  <button onClick={() => deleteParameterConfig(pc.id)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-red-500 transition-colors cursor-pointer" title="删除"><Trash2 size={13} /></button>
                </div>
              </div>
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-[var(--glass-border)] relative z-10">
                  <table className="w-full mt-2 text-xs">
                    <thead>
                      <tr className="text-[var(--text-tertiary)]">
                        <th className="text-left py-1 font-medium">参数名</th>
                        <th className="text-left py-1 font-medium">参数值</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paramEntries.map(([key, value]) => (
                        <tr key={key} className="border-t border-[var(--glass-border)]/50">
                          <td className="py-1.5 font-mono text-[var(--text-primary)]">{key}</td>
                          <td className="py-1.5">
                            <input
                              value={String(value)}
                              onChange={e => updateParamInline(pc.id, key, e.target.value)}
                              className="liquid-glass-input px-2 py-0.5 rounded-lg text-xs w-full"
                            />
                          </td>
                          <td className="py-1.5 text-center">
                            <button onClick={() => deleteParamInline(pc.id, key)} className="text-[var(--text-tertiary)] hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={11} /></button>
                          </td>
                        </tr>
                      ))}
                      {paramEntries.length === 0 && (
                        <tr><td colSpan={3} className="py-2 text-center text-[var(--text-tertiary)]">暂无参数</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">暂无匹配的参数配置</div>}
      </div>

      {/* 新增/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="liquid-glass-strong p-5 w-[440px] max-w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{editId ? '编辑参数组' : '新增参数组'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">车辆 ID</label>
                  <input value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} placeholder="如 AET-001" className="liquid-glass-input w-full px-3 py-1.5 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">版本号</label>
                  <input value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} placeholder="如 v2.3.1" className="liquid-glass-input w-full px-3 py-1.5 text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">参数键值对</label>
                <div className="space-y-1.5">
                  {form.parameters.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={p.key} onChange={e => updateParam(i, 'key', e.target.value)} placeholder="参数名" className="liquid-glass-input flex-1 px-2 py-1 rounded-lg text-xs" />
                      <input value={p.value} onChange={e => updateParam(i, 'value', e.target.value)} placeholder="参数值" className="liquid-glass-input flex-1 px-2 py-1 rounded-lg text-xs" />
                      {form.parameters.length > 1 && <button type="button" onClick={() => removeParam(i)} className="text-red-400 hover:text-red-500 cursor-pointer"><Trash2 size={12} /></button>}
                    </div>
                  ))}
                  <button type="button" onClick={addParam} className="liquid-glass-btn w-full py-1 rounded-lg text-xs text-[#C199E0] hover:text-[#A87BC7] transition-colors cursor-pointer">+ 添加参数</button>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="liquid-glass-btn flex-1 px-4 py-2 rounded-xl text-sm text-[var(--text-primary)] transition-transform active:scale-[0.98] cursor-pointer">取消</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl text-sm font-medium transition-colors active:scale-[0.98] cursor-pointer">{editId ? '保存' : '创建'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
