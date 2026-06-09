import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, FileText, X } from 'lucide-react';
import { useTestManagementData } from './useTestManagementData';
import { TestReportModal } from './TestReportModal';
import { TestItem, TestItemCategory, TestItemStatus, TestReport } from '@/types/module';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { LiquidDatePicker } from '@/components/common/LiquidDatePicker';
import {
  TEST_ITEM_CATEGORY_NAMES,
  TEST_ITEM_CATEGORY_COLORS,
  TEST_ITEM_STATUS_NAMES,
  TEST_ITEM_STATUS_COLORS,
} from '@/constants/modules';
import { formatDate } from '@/utils/helpers';

interface Props {
  projectId: string;
}

const CATEGORIES: TestItemCategory[] = ['road-network', 'localization-map', 'function', 'safety', 'stress'];
const STATUSES: TestItemStatus[] = ['pending', 'testing', 'passed', 'failed'];

interface FormData {
  name: string;
  category: TestItemCategory;
  status: TestItemStatus;
  assignee: string;
  startDate: string;
  endDate: string;
}

const defaultForm: FormData = {
  name: '', category: 'road-network', status: 'pending',
  assignee: '', startDate: '', endDate: '',
};

export const TestItemTab: React.FC<Props> = ({ projectId }) => {
  const {
    data, addTestItem, updateTestItem, deleteTestItem,
    generateTestItemReport,
  } = useTestManagementData(projectId);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [report, setReport] = useState<TestReport | null>(null);

  const filtered = data.testItems.filter(ti => {
    if (filterCategory !== 'all' && ti.category !== filterCategory) return false;
    if (filterStatus !== 'all' && ti.status !== filterStatus) return false;
    if (search && !ti.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openAdd = () => { setForm(defaultForm); setEditId(null); setShowModal(true); };
  const openEdit = (ti: TestItem) => {
    setForm({
      name: ti.name, category: ti.category, status: ti.status,
      assignee: ti.assignee, startDate: ti.startDate, endDate: ti.endDate,
    });
    setEditId(ti.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editId) {
      updateTestItem(editId, form);
    } else {
      addTestItem(form);
    }
    setShowModal(false);
  };

  const handleGenerateReport = (itemId: string) => {
    const r = generateTestItemReport(itemId);
    setReport(r);
  };

  // 统计
  const stats = {
    pending: data.testItems.filter(t => t.status === 'pending').length,
    testing: data.testItems.filter(t => t.status === 'testing').length,
    passed: data.testItems.filter(t => t.status === 'passed').length,
    failed: data.testItems.filter(t => t.status === 'failed').length,
  };

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索测试项..."
            className="liquid-glass-input w-full pl-8 pr-3 py-1.5 text-sm"
          />
        </div>
        <LiquidSelect
          value={filterCategory} onChange={v => setFilterCategory(v)}
          compact options={[{ value: 'all', label: '全部分类' }, ...CATEGORIES.map(c => ({ value: c, label: TEST_ITEM_CATEGORY_NAMES[c] }))]}
        />
        <LiquidSelect
          value={filterStatus} onChange={v => setFilterStatus(v)}
          compact options={[{ value: 'all', label: '全部状态' }, ...STATUSES.map(s => ({ value: s, label: TEST_ITEM_STATUS_NAMES[s] }))]}
        />
        <button onClick={openAdd} className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#C199E0] hover:text-[#A87BC7] transition-colors cursor-pointer">
          <Plus size={14} /> 新增测试项
        </button>
      </div>

      {/* 统计摘要 */}
      <div className="flex gap-3 mb-4">
        {STATUSES.map(s => (
          <div key={s} className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
            <div className={`text-lg font-semibold ${s === 'passed' ? 'text-green-600' : s === 'failed' ? 'text-red-500' : s === 'testing' ? 'text-blue-500' : 'text-gray-500'}`}>{stats[s]}</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">{TEST_ITEM_STATUS_NAMES[s]}</div>
          </div>
        ))}
      </div>

      {/* 卡片列表 */}
      <div className="space-y-2">
        {filtered.map(ti => (
          <div key={ti.id} className="liquid-glass-card p-3 rounded-xl group">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-[var(--text-primary)] truncate">{ti.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TEST_ITEM_CATEGORY_COLORS[ti.category]}`}>
                    {TEST_ITEM_CATEGORY_NAMES[ti.category]}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TEST_ITEM_STATUS_COLORS[ti.status]}`}>
                    {TEST_ITEM_STATUS_NAMES[ti.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[var(--text-tertiary)]">
                  <span>{ti.assignee}</span>
                  <span>{ti.startDate} ~ {ti.endDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleGenerateReport(ti.id)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-[#C199E0] transition-colors cursor-pointer" title="生成报告">
                  <FileText size={13} />
                </button>
                <button onClick={() => openEdit(ti)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" title="编辑">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => deleteTestItem(ti.id)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-red-500 transition-colors cursor-pointer" title="删除">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">暂无匹配的测试项</div>
        )}
      </div>

      {/* 新增/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="liquid-glass-strong p-5 w-[440px] max-w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{editId ? '编辑测试项' : '新增测试项'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">名称</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">分类</label>
                  <LiquidSelect value={form.category} onChange={v => setForm({ ...form, category: v as TestItemCategory })} compact options={CATEGORIES.map(c => ({ value: c, label: TEST_ITEM_CATEGORY_NAMES[c] }))} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">状态</label>
                  <LiquidSelect value={form.status} onChange={v => setForm({ ...form, status: v as TestItemStatus })} compact options={STATUSES.map(s => ({ value: s, label: TEST_ITEM_STATUS_NAMES[s] }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">负责人</label>
                <input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">开始日期</label>
                  <LiquidDatePicker value={form.startDate} onChange={v => setForm({ ...form, startDate: v })} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">结束日期</label>
                  <LiquidDatePicker value={form.endDate} onChange={v => setForm({ ...form, endDate: v })} />
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

      {/* 报告弹窗 */}
      {report && (
        <TestReportModal report={report} testCases={data.testCases.filter(tc => tc.testItemId === report.sourceId)} onClose={() => setReport(null)} />
      )}
    </div>
  );
};
