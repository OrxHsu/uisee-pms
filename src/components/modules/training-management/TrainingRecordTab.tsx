import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, FileDown, X, MapPin, Clock, Users, User } from 'lucide-react';
import { useTrainingManagementData } from './useTrainingManagementData';
import { TrainingPdfModal } from './TrainingPdfModal';
import { TrainingRecord, TrainingCategory, TrainingStatus } from '@/types/module';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { LiquidDatePicker } from '@/components/common/LiquidDatePicker';
import { LiquidTimePicker } from '@/components/common/LiquidTimePicker';
import {
  TRAINING_CATEGORY_NAMES,
  TRAINING_CATEGORY_COLORS,
  TRAINING_STATUS_NAMES,
  TRAINING_STATUS_COLORS,
} from '@/constants/modules';
import { formatDate } from '@/utils/helpers';

interface Props {
  projectId: string;
}

const CATEGORIES: TrainingCategory[] = ['safety', 'operation', 'maintenance', 'commissioning', 'other'];
const STATUSES: TrainingStatus[] = ['planned', 'in-progress', 'completed'];

interface FormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  trainer: string;
  participants: string;
  content: string;
  category: TrainingCategory;
  status: TrainingStatus;
}

const defaultForm: FormData = {
  title: '', date: '', startTime: '09:00', endTime: '12:00',
  location: '', trainer: '', participants: '', content: '',
  category: 'safety', status: 'planned',
};

export const TrainingRecordTab: React.FC<Props> = ({ projectId }) => {
  const {
    data, addTrainingRecord, updateTrainingRecord, deleteTrainingRecord,
  } = useTrainingManagementData(projectId);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [pdfRecord, setPdfRecord] = useState<TrainingRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = data.trainingRecords.filter(tr => {
    if (filterCategory !== 'all' && tr.category !== filterCategory) return false;
    if (filterStatus !== 'all' && tr.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return tr.title.toLowerCase().includes(s) ||
        tr.location.toLowerCase().includes(s) ||
        tr.trainer.toLowerCase().includes(s) ||
        tr.participants.some(p => p.toLowerCase().includes(s));
    }
    return true;
  });

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (tr: TrainingRecord) => {
    setForm({
      title: tr.title, date: tr.date, startTime: tr.startTime, endTime: tr.endTime,
      location: tr.location, trainer: tr.trainer,
      participants: tr.participants.join('、'),
      content: tr.content, category: tr.category, status: tr.status,
    });
    setEditId(tr.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const participants = form.participants.split(/[,，、\n]/).map(p => p.trim()).filter(Boolean);
    if (editId) {
      updateTrainingRecord(editId, { ...form, participants });
    } else {
      addTrainingRecord({ ...form, participants, attachments: [] });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteTrainingRecord(id);
    setDeleteConfirm(null);
  };

  // 统计
  const stats = {
    planned: data.trainingRecords.filter(t => t.status === 'planned').length,
    'in-progress': data.trainingRecords.filter(t => t.status === 'in-progress').length,
    completed: data.trainingRecords.filter(t => t.status === 'completed').length,
  };

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索培训记录..."
            className="liquid-glass-input w-full pl-8 pr-3 py-1.5 text-sm"
          />
        </div>
        <LiquidSelect
          value={filterCategory} onChange={v => setFilterCategory(v)}
          compact options={[{ value: 'all', label: '全部分类' }, ...CATEGORIES.map(c => ({ value: c, label: TRAINING_CATEGORY_NAMES[c] }))]}
        />
        <LiquidSelect
          value={filterStatus} onChange={v => setFilterStatus(v)}
          compact options={[{ value: 'all', label: '全部状态' }, ...STATUSES.map(s => ({ value: s, label: TRAINING_STATUS_NAMES[s] }))]}
        />
        <button onClick={openAdd} className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#C199E0] hover:text-[#A87BC7] transition-colors cursor-pointer">
          <Plus size={14} /> 新增培训记录
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
      </div>

      {/* 卡片列表 */}
      <div className="space-y-2">
        {filtered.map(tr => (
          <div key={tr.id} className="liquid-glass-card p-3 rounded-xl group">
            <div className="flex items-start justify-between relative z-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-medium text-sm text-[var(--text-primary)] truncate">{tr.title}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${TRAINING_CATEGORY_COLORS[tr.category]}`}>
                    {TRAINING_CATEGORY_NAMES[tr.category]}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${TRAINING_STATUS_COLORS[tr.status]}`}>
                    {TRAINING_STATUS_NAMES[tr.status]}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1"><Clock size={11} /> {tr.date} {tr.startTime}-{tr.endTime}</span>
                  <span className="flex items-center gap-1"><MapPin size={11} /> {tr.location}</span>
                  <span className="flex items-center gap-1"><User size={11} /> {tr.trainer}</span>
                  <span className="flex items-center gap-1"><Users size={11} /> {tr.participants.length}人</span>
                  {tr.attachments.length > 0 && (
                    <span className="text-[#C199E0]">📎 {tr.attachments.length}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                <button onClick={() => setPdfRecord(tr)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-[#C199E0] transition-colors cursor-pointer" title="导出PDF">
                  <FileDown size={13} />
                </button>
                <button onClick={() => openEdit(tr)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" title="编辑">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => setDeleteConfirm(tr.id)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-red-500 transition-colors cursor-pointer" title="删除">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">暂无匹配的培训记录</div>
        )}
      </div>

      {/* 新增/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="liquid-glass-strong p-5 w-[520px] max-w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{editId ? '编辑培训记录' : '新增培训记录'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">培训主题</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" placeholder="请输入培训主题" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">培训日期</label>
                  <LiquidDatePicker value={form.date} onChange={v => setForm({ ...form, date: v })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">开始时间</label>
                    <LiquidTimePicker value={form.startTime} onChange={v => setForm({ ...form, startTime: v })} compact />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">结束时间</label>
                    <LiquidTimePicker value={form.endTime} onChange={v => setForm({ ...form, endTime: v })} compact />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">培训地点</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" placeholder="请输入培训地点" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">培训讲师</label>
                  <input value={form.trainer} onChange={e => setForm({ ...form, trainer: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" placeholder="请输入讲师姓名" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">参训人员（用顿号或逗号分隔）</label>
                <input value={form.participants} onChange={e => setForm({ ...form, participants: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" placeholder="例如：张工、李工、王工" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">培训内容</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm min-h-[80px] resize-y" placeholder="请输入培训内容" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">培训分类</label>
                  <LiquidSelect value={form.category} onChange={v => setForm({ ...form, category: v as TrainingCategory })} compact options={CATEGORIES.map(c => ({ value: c, label: TRAINING_CATEGORY_NAMES[c] }))} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">培训状态</label>
                  <LiquidSelect value={form.status} onChange={v => setForm({ ...form, status: v as TrainingStatus })} compact options={STATUSES.map(s => ({ value: s, label: TRAINING_STATUS_NAMES[s] }))} />
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

      {/* 删除确认 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="liquid-glass-strong p-5 w-[360px] max-w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">确认删除</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">确定要删除该培训记录吗？此操作不可撤销。</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="liquid-glass-btn flex-1 px-4 py-2 rounded-xl text-sm text-[var(--text-primary)] cursor-pointer">取消</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer">删除</button>
            </div>
          </div>
        </div>
      )}

      {/* PDF 弹窗 */}
      {pdfRecord && (
        <TrainingPdfModal record={pdfRecord} onClose={() => setPdfRecord(null)} />
      )}
    </div>
  );
};
