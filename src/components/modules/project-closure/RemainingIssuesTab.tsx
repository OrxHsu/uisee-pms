import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, AlertTriangle, User, Calendar, Clock,
} from 'lucide-react';
import { useProjectClosureData } from './useProjectClosureData';
import { RemainingIssue, RemainingIssueCategory, RemainingIssueStatus } from '@/types/module';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { LiquidDatePicker } from '@/components/common/LiquidDatePicker';
import {
  REMAINING_ISSUE_CATEGORY_NAMES,
  REMAINING_ISSUE_CATEGORY_COLORS,
  REMAINING_ISSUE_STATUS_NAMES,
  REMAINING_ISSUE_STATUS_COLORS,
  REMAINING_ISSUE_PRIORITY_NAMES,
  REMAINING_ISSUE_PRIORITY_COLORS,
} from '@/constants/modules';
import { formatDate } from '@/utils/helpers';

interface Props {
  projectId: string;
}

const CATEGORIES: RemainingIssueCategory[] = ['hardware', 'software', 'process', 'safety', 'other'];
const STATUSES: RemainingIssueStatus[] = ['open', 'in-progress', 'resolved', 'closed'];
const PRIORITIES: Array<'critical' | 'major' | 'minor'> = ['critical', 'major', 'minor'];

interface FormData {
  title: string;
  description: string;
  category: RemainingIssueCategory;
  priority: 'critical' | 'major' | 'minor';
  status: RemainingIssueStatus;
  assignee: string;
  deadline: string;
  resolution: string;
}

const defaultForm: FormData = {
  title: '', description: '', category: 'hardware', priority: 'major',
  status: 'open', assignee: '', deadline: '', resolution: '',
};

export const RemainingIssuesTab: React.FC<Props> = ({ projectId }) => {
  const { data, addRemainingIssue, updateRemainingIssue, deleteRemainingIssue } = useProjectClosureData(projectId);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = data.remainingIssues.filter(ri => {
    if (filterCategory !== 'all' && ri.category !== filterCategory) return false;
    if (filterStatus !== 'all' && ri.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return ri.title.toLowerCase().includes(s) ||
        ri.description.toLowerCase().includes(s) ||
        ri.assignee.toLowerCase().includes(s);
    }
    return true;
  });

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (ri: RemainingIssue) => {
    setForm({
      title: ri.title, description: ri.description, category: ri.category,
      priority: ri.priority, status: ri.status, assignee: ri.assignee,
      deadline: ri.deadline, resolution: ri.resolution,
    });
    setEditId(ri.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editId) {
      updateRemainingIssue(editId, form);
    } else {
      addRemainingIssue(form);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteRemainingIssue(id);
    setDeleteConfirm(null);
  };

  const stats = {
    open: data.remainingIssues.filter(i => i.status === 'open').length,
    'in-progress': data.remainingIssues.filter(i => i.status === 'in-progress').length,
    resolved: data.remainingIssues.filter(i => i.status === 'resolved').length,
    closed: data.remainingIssues.filter(i => i.status === 'closed').length,
  };

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索遗留问题..."
            className="liquid-glass-input w-full pl-8 pr-3 py-1.5 text-sm"
          />
        </div>
        <LiquidSelect
          value={filterCategory} onChange={v => setFilterCategory(v)}
          compact options={[{ value: 'all', label: '全部分类' }, ...CATEGORIES.map(c => ({ value: c, label: REMAINING_ISSUE_CATEGORY_NAMES[c] }))]}
        />
        <LiquidSelect
          value={filterStatus} onChange={v => setFilterStatus(v)}
          compact options={[{ value: 'all', label: '全部状态' }, ...STATUSES.map(s => ({ value: s, label: REMAINING_ISSUE_STATUS_NAMES[s] }))]}
        />
        <button onClick={openAdd} className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-amber-500 hover:text-amber-400 transition-colors cursor-pointer">
          <Plus size={14} /> 新增遗留问题
        </button>
      </div>

      {/* 统计摘要 */}
      <div className="flex gap-3 mb-4">
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-red-500">{stats.open}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">待处理</div>
        </div>
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-blue-500">{stats['in-progress']}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">处理中</div>
        </div>
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-green-600">{stats.resolved}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">已解决</div>
        </div>
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-gray-500">{stats.closed}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">已关闭</div>
        </div>
      </div>

      {/* 卡片列表 */}
      <div className="space-y-2">
        {filtered.map(ri => (
          <div key={ri.id} className="liquid-glass-card p-3 rounded-xl group">
            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <AlertTriangle size={14} className={`shrink-0 ${ri.priority === 'critical' ? 'text-red-500' : ri.priority === 'major' ? 'text-amber-500' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm text-[var(--text-primary)]">{ri.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${REMAINING_ISSUE_PRIORITY_COLORS[ri.priority]}`}>
                    {REMAINING_ISSUE_PRIORITY_NAMES[ri.priority]}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${REMAINING_ISSUE_CATEGORY_COLORS[ri.category]}`}>
                    {REMAINING_ISSUE_CATEGORY_NAMES[ri.category]}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${REMAINING_ISSUE_STATUS_COLORS[ri.status]}`}>
                    {REMAINING_ISSUE_STATUS_NAMES[ri.status]}
                  </span>
                </div>
                {ri.description && (
                  <p className="text-xs text-[var(--text-secondary)] mb-1.5 line-clamp-2">{ri.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-tertiary)]">
                  {ri.assignee && (
                    <span className="flex items-center gap-1"><User size={11} /> {ri.assignee}</span>
                  )}
                  {ri.deadline && (
                    <span className="flex items-center gap-1"><Calendar size={11} /> 截止 {formatDate(ri.deadline)}</span>
                  )}
                  <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(ri.createdAt)}</span>
                </div>
                {ri.resolution && (
                  <div className="mt-1.5 px-2 py-1 rounded-lg bg-green-500/10 text-[11px] text-green-600 dark:text-green-400">
                    解决方案：{ri.resolution}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                <button onClick={() => openEdit(ri)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" title="编辑">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => setDeleteConfirm(ri.id)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-red-500 transition-colors cursor-pointer" title="删除">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">暂无匹配的遗留问题</div>
        )}
      </div>

      {/* 新增/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="liquid-glass-strong p-5 w-[560px] max-w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{editId ? '编辑遗留问题' : '新增遗留问题'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">问题标题</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" placeholder="请输入问题标题" required />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">问题描述</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm min-h-[60px] resize-y" placeholder="请描述问题详情" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">问题分类</label>
                  <LiquidSelect value={form.category} onChange={v => setForm({ ...form, category: v as RemainingIssueCategory })} compact options={CATEGORIES.map(c => ({ value: c, label: REMAINING_ISSUE_CATEGORY_NAMES[c] }))} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">优先级</label>
                  <LiquidSelect value={form.priority} onChange={v => setForm({ ...form, priority: v as 'critical' | 'major' | 'minor' })} compact options={PRIORITIES.map(p => ({ value: p, label: REMAINING_ISSUE_PRIORITY_NAMES[p] }))} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">状态</label>
                  <LiquidSelect value={form.status} onChange={v => setForm({ ...form, status: v as RemainingIssueStatus })} compact options={STATUSES.map(s => ({ value: s, label: REMAINING_ISSUE_STATUS_NAMES[s] }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">责任人</label>
                  <input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" placeholder="请输入责任人" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">截止日期</label>
                  <LiquidDatePicker value={form.deadline} onChange={v => setForm({ ...form, deadline: v })} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">解决方案</label>
                <textarea value={form.resolution} onChange={e => setForm({ ...form, resolution: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm min-h-[50px] resize-y" placeholder="请输入解决方案（如有）" />
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
            <p className="text-sm text-[var(--text-secondary)] mb-4">确定要删除该遗留问题吗？此操作不可撤销。</p>
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
