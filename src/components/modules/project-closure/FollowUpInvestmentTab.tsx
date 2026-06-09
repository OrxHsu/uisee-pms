import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, TrendingUp, User, Calendar, DollarSign, Package,
} from 'lucide-react';
import { useProjectClosureData } from './useProjectClosureData';
import { FollowUpInvestment, FollowUpCategory, FollowUpStatus } from '@/types/module';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { LiquidDatePicker } from '@/components/common/LiquidDatePicker';
import {
  FOLLOW_UP_CATEGORY_NAMES,
  FOLLOW_UP_CATEGORY_COLORS,
  FOLLOW_UP_STATUS_NAMES,
  FOLLOW_UP_STATUS_COLORS,
} from '@/constants/modules';
import { formatDate } from '@/utils/helpers';

interface Props {
  projectId: string;
}

const CATEGORIES: FollowUpCategory[] = ['personnel', 'equipment', 'material', 'technical', 'other'];
const STATUSES: FollowUpStatus[] = ['planned', 'in-progress', 'completed', 'cancelled'];

interface FormData {
  title: string;
  category: FollowUpCategory;
  description: string;
  quantity: number;
  unit: string;
  estimatedCost: string;
  responsiblePerson: string;
  planDate: string;
  status: FollowUpStatus;
}

const defaultForm: FormData = {
  title: '', category: 'personnel', description: '', quantity: 1,
  unit: '项', estimatedCost: '', responsiblePerson: '', planDate: '', status: 'planned',
};

export const FollowUpInvestmentTab: React.FC<Props> = ({ projectId }) => {
  const { data, addFollowUpInvestment, updateFollowUpInvestment, deleteFollowUpInvestment } = useProjectClosureData(projectId);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = data.followUpInvestments.filter(fu => {
    if (filterCategory !== 'all' && fu.category !== filterCategory) return false;
    if (filterStatus !== 'all' && fu.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return fu.title.toLowerCase().includes(s) ||
        fu.description.toLowerCase().includes(s) ||
        fu.responsiblePerson.toLowerCase().includes(s);
    }
    return true;
  });

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (fu: FollowUpInvestment) => {
    setForm({
      title: fu.title, category: fu.category, description: fu.description,
      quantity: fu.quantity, unit: fu.unit, estimatedCost: fu.estimatedCost,
      responsiblePerson: fu.responsiblePerson, planDate: fu.planDate, status: fu.status,
    });
    setEditId(fu.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editId) {
      updateFollowUpInvestment(editId, form);
    } else {
      addFollowUpInvestment(form);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteFollowUpInvestment(id);
    setDeleteConfirm(null);
  };

  const stats = {
    planned: data.followUpInvestments.filter(i => i.status === 'planned').length,
    'in-progress': data.followUpInvestments.filter(i => i.status === 'in-progress').length,
    completed: data.followUpInvestments.filter(i => i.status === 'completed').length,
    cancelled: data.followUpInvestments.filter(i => i.status === 'cancelled').length,
  };

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索后续投入..."
            className="liquid-glass-input w-full pl-8 pr-3 py-1.5 text-sm"
          />
        </div>
        <LiquidSelect
          value={filterCategory} onChange={v => setFilterCategory(v)}
          compact options={[{ value: 'all', label: '全部分类' }, ...CATEGORIES.map(c => ({ value: c, label: FOLLOW_UP_CATEGORY_NAMES[c] }))]}
        />
        <LiquidSelect
          value={filterStatus} onChange={v => setFilterStatus(v)}
          compact options={[{ value: 'all', label: '全部状态' }, ...STATUSES.map(s => ({ value: s, label: FOLLOW_UP_STATUS_NAMES[s] }))]}
        />
        <button onClick={openAdd} className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-amber-500 hover:text-amber-400 transition-colors cursor-pointer">
          <Plus size={14} /> 新增后续投入
        </button>
      </div>

      {/* 统计摘要 */}
      <div className="flex gap-3 mb-4">
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-gray-500">{stats.planned}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">计划中</div>
        </div>
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-blue-500">{stats['in-progress']}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">进行中</div>
        </div>
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-green-600">{stats.completed}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">已完成</div>
        </div>
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-red-500">{stats.cancelled}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">已取消</div>
        </div>
      </div>

      {/* 卡片列表 */}
      <div className="space-y-2">
        {filtered.map(fu => (
          <div key={fu.id} className="liquid-glass-card p-3 rounded-xl group">
            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <TrendingUp size={14} className="text-amber-500 shrink-0" />
                  <span className="font-medium text-sm text-[var(--text-primary)]">{fu.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${FOLLOW_UP_CATEGORY_COLORS[fu.category]}`}>
                    {FOLLOW_UP_CATEGORY_NAMES[fu.category]}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${FOLLOW_UP_STATUS_COLORS[fu.status]}`}>
                    {FOLLOW_UP_STATUS_NAMES[fu.status]}
                  </span>
                </div>
                {fu.description && (
                  <p className="text-xs text-[var(--text-secondary)] mb-1.5 line-clamp-2">{fu.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1"><Package size={11} /> {fu.quantity}{fu.unit}</span>
                  {fu.estimatedCost && (
                    <span className="flex items-center gap-1 text-amber-500"><DollarSign size={11} /> 预估 {fu.estimatedCost}</span>
                  )}
                  {fu.responsiblePerson && (
                    <span className="flex items-center gap-1"><User size={11} /> {fu.responsiblePerson}</span>
                  )}
                  {fu.planDate && (
                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(fu.planDate)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                <button onClick={() => openEdit(fu)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" title="编辑">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => setDeleteConfirm(fu.id)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-red-500 transition-colors cursor-pointer" title="删除">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">暂无匹配的后续投入</div>
        )}
      </div>

      {/* 新增/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="liquid-glass-strong p-5 w-[560px] max-w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{editId ? '编辑后续投入' : '新增后续投入'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">投入标题</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" placeholder="请输入投入标题" required />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">投入描述</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm min-h-[60px] resize-y" placeholder="请描述投入详情" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">投入分类</label>
                  <LiquidSelect value={form.category} onChange={v => setForm({ ...form, category: v as FollowUpCategory })} compact options={CATEGORIES.map(c => ({ value: c, label: FOLLOW_UP_CATEGORY_NAMES[c] }))} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">状态</label>
                  <LiquidSelect value={form.status} onChange={v => setForm({ ...form, status: v as FollowUpStatus })} compact options={STATUSES.map(s => ({ value: s, label: FOLLOW_UP_STATUS_NAMES[s] }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">数量</label>
                  <input type="number" min={0} value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">单位</label>
                  <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" placeholder="如：人、套、项" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">预估费用</label>
                  <input value={form.estimatedCost} onChange={e => setForm({ ...form, estimatedCost: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" placeholder="如：5万" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">负责人</label>
                  <input value={form.responsiblePerson} onChange={e => setForm({ ...form, responsiblePerson: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" placeholder="请输入负责人" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">计划日期</label>
                  <LiquidDatePicker value={form.planDate} onChange={v => setForm({ ...form, planDate: v })} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="liquid-glass-btn flex-1 px-4 py-2 rounded-xl text-sm text-[var(--text-primary)] transition-transform active:scale-[0.98] cursor-pointer">取消</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors active:scale-[0.98] cursor-pointer">{editId ? '保存' : '创建'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除确认 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="liquid-glass-strong p-5 w-[360px] max-w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">确认删除</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">确定要删除该后续投入吗？此操作不可撤销。</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="liquid-glass-btn flex-1 px-4 py-2 rounded-xl text-sm text-[var(--text-primary)] cursor-pointer">取消</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
