import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { useTestManagementData } from './useTestManagementData';
import { Bug } from '@/types/module';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { BaseModal } from '@/components/common/BaseModal';
import {
  BUG_SEVERITY_NAMES,
  BUG_SEVERITY_COLORS,
  BUG_STATUS_NAMES,
  BUG_STATUS_COLORS,
} from '@/constants/modules';
import { formatDate } from '@/utils/helpers';

interface Props {
  projectId: string;
}

type BugSeverity = 'critical' | 'major' | 'minor';
type BugStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

const SEVERITIES: BugSeverity[] = ['critical', 'major', 'minor'];
const STATUSES: BugStatus[] = ['open', 'in-progress', 'resolved', 'closed'];

interface FormData {
  title: string;
  description: string;
  vehicleId: string;
  testItemId: string;
  severity: BugSeverity;
  status: BugStatus;
}

const defaultForm: FormData = {
  title: '', description: '', vehicleId: '', testItemId: '',
  severity: 'major', status: 'open',
};

export const BugTab: React.FC<Props> = ({ projectId }) => {
  const {
    data, addBug, updateBug, deleteBug, transitionBugStatus,
  } = useTestManagementData(projectId);

  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterItem, setFilterItem] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  const filtered = data.bugs.filter(b => {
    if (filterVehicle && (!b.vehicleId || !b.vehicleId.toLowerCase().includes(filterVehicle.toLowerCase()))) return false;
    if (filterItem !== 'all' && b.testItemId !== filterItem) return false;
    if (filterSeverity !== 'all' && b.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (b: Bug) => {
    setForm({
      title: b.title, description: b.description,
      vehicleId: b.vehicleId || '', testItemId: b.testItemId || '',
      severity: b.severity, status: b.status,
    });
    setEditId(b.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editId) {
      updateBug(editId, { ...form, vehicleId: form.vehicleId || undefined, testItemId: form.testItemId || undefined });
    } else {
      addBug({ ...form, vehicleId: form.vehicleId || undefined, testItemId: form.testItemId || undefined });
    }
    setShowModal(false);
  };

  const getNextStatusLabel = (status: BugStatus): string | null => {
    const order: BugStatus[] = ['open', 'in-progress', 'resolved', 'closed'];
    const idx = order.indexOf(status);
    return idx < order.length - 1 ? BUG_STATUS_NAMES[order[idx + 1]] : null;
  };

  // 统计
  const statsBySeverity = SEVERITIES.reduce((acc, s) => ({ ...acc, [s]: data.bugs.filter(b => b.severity === s).length }), {} as Record<string, number>);
  const statsByStatus = STATUSES.reduce((acc, s) => ({ ...acc, [s]: data.bugs.filter(b => b.status === s).length }), {} as Record<string, number>);

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索 Bug..." className="liquid-glass-input w-full pl-8 pr-3 py-1.5 text-sm" />
        </div>
        <input value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)} placeholder="车辆ID" className="liquid-glass-input px-3 py-1.5 text-sm w-[120px]" />
        <LiquidSelect value={filterItem} onChange={v => setFilterItem(v)} compact options={[{ value: 'all', label: '全部测试项' }, ...data.testItems.map(ti => ({ value: ti.id, label: ti.name }))]} />
        <LiquidSelect value={filterSeverity} onChange={v => setFilterSeverity(v)} compact options={[{ value: 'all', label: '全部严重程度' }, ...SEVERITIES.map(s => ({ value: s, label: BUG_SEVERITY_NAMES[s] }))]} />
        <LiquidSelect value={filterStatus} onChange={v => setFilterStatus(v)} compact options={[{ value: 'all', label: '全部状态' }, ...STATUSES.map(s => ({ value: s, label: BUG_STATUS_NAMES[s] }))]} />
        <button onClick={openAdd} className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#C199E0] hover:text-[#A87BC7] transition-colors cursor-pointer">
          <Plus size={14} /> 新增 Bug
        </button>
      </div>

      {/* 统计 */}
      <div className="flex gap-3 mb-4">
        {SEVERITIES.map(s => (
          <div key={s} className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[70px]">
            <div className="text-lg font-semibold text-[var(--text-primary)]">{statsBySeverity[s]}</div>
            <div className={`text-[10px] ${BUG_SEVERITY_COLORS[s].split(' ')[1]}`}>{BUG_SEVERITY_NAMES[s]}</div>
          </div>
        ))}
        <div className="w-px bg-[var(--glass-border)]" />
        {STATUSES.map(s => (
          <div key={s} className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[70px]">
            <div className="text-lg font-semibold text-[var(--text-primary)]">{statsByStatus[s]}</div>
            <div className={`text-[10px] ${BUG_STATUS_COLORS[s].split(' ')[1]}`}>{BUG_STATUS_NAMES[s]}</div>
          </div>
        ))}
      </div>

      {/* Bug 列表 */}
      <div className="space-y-2">
        {filtered.map(b => {
          const testItem = data.testItems.find(ti => ti.id === b.testItemId);
          const nextLabel = getNextStatusLabel(b.status as BugStatus);
          return (
            <div key={b.id} className="liquid-glass-card p-3 rounded-xl group">
              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-[var(--text-primary)] truncate">{b.title}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${BUG_SEVERITY_COLORS[b.severity]}`}>{BUG_SEVERITY_NAMES[b.severity]}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${BUG_STATUS_COLORS[b.status]}`}>{BUG_STATUS_NAMES[b.status]}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mb-1">{b.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[var(--text-tertiary)]">
                    {b.vehicleId && <span>车辆: {b.vehicleId}</span>}
                    {testItem && <span>测试项: {testItem.name}</span>}
                    <span>{formatDate(b.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  {nextLabel && (
                    <button onClick={() => transitionBugStatus(b.id)} className="liquid-glass-btn flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-[#C199E0] hover:text-[#A87BC7] transition-colors cursor-pointer" title={`转为${nextLabel}`}>
                      <ArrowRight size={11} /> {nextLabel}
                    </button>
                  )}
                  <button onClick={() => openEdit(b)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" title="编辑"><Edit2 size={13} /></button>
                  <button onClick={() => deleteBug(b.id)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-red-500 transition-colors cursor-pointer" title="删除"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">暂无匹配的 Bug</div>}
      </div>

      {/* 新增/编辑模态框 */}
      <BaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editId ? '编辑 Bug' : '新增 Bug'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">标题</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" required />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">描述</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="liquid-glass-input w-full px-3 py-1.5 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">关联车辆</label>
              <input value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} placeholder="如 AET-001" className="liquid-glass-input w-full px-3 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">关联测试项</label>
              <LiquidSelect value={form.testItemId} onChange={v => setForm({ ...form, testItemId: v })} compact placeholder="-- 选择 --" options={data.testItems.map(ti => ({ value: ti.id, label: ti.name }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">严重程度</label>
              <LiquidSelect value={form.severity} onChange={v => setForm({ ...form, severity: v as BugSeverity })} compact options={SEVERITIES.map(s => ({ value: s, label: BUG_SEVERITY_NAMES[s] }))} />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">状态</label>
              <LiquidSelect value={form.status} onChange={v => setForm({ ...form, status: v as BugStatus })} compact options={STATUSES.map(s => ({ value: s, label: BUG_STATUS_NAMES[s] }))} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="liquid-glass-btn flex-1 px-4 py-2 rounded-xl text-sm text-[var(--text-primary)] transition-transform active:scale-[0.98] cursor-pointer">取消</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl text-sm font-medium transition-colors active:scale-[0.98] cursor-pointer">{editId ? '保存' : '创建'}</button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
};
