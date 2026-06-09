import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, FileText, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useTestManagementData } from './useTestManagementData';
import { TestReportModal } from './TestReportModal';
import { TestCase, TestStep, TestItemCategory, TestReport } from '@/types/module';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import {
  TEST_ITEM_CATEGORY_NAMES,
  TEST_ITEM_CATEGORY_COLORS,
  TEST_RESULT_NAMES,
  TEST_RESULT_COLORS,
} from '@/constants/modules';

interface Props {
  projectId: string;
}

const CATEGORIES: TestItemCategory[] = ['road-network', 'localization-map', 'function', 'safety', 'stress'];

interface StepForm {
  action: string;
  expectedResult: string;
  actualResult: string;
}

interface FormData {
  name: string;
  category: TestItemCategory;
  testItemId: string;
  preconditions: string;
  steps: StepForm[];
  expectedResult: string;
  result: 'pass' | 'fail' | 'pending';
}

const defaultSteps: StepForm[] = [{ action: '', expectedResult: '', actualResult: '' }];

const defaultForm: FormData = {
  name: '', category: 'road-network', testItemId: '', preconditions: '',
  steps: [...defaultSteps], expectedResult: '', result: 'pending',
};

export const TestCaseTab: React.FC<Props> = ({ projectId }) => {
  const {
    data, addTestCase, updateTestCase, deleteTestCase,
    generateTestCaseReport, getNextCaseNumber,
  } = useTestManagementData(projectId);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterItem, setFilterItem] = useState<string>('all');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [report, setReport] = useState<TestReport | null>(null);

  const filtered = data.testCases.filter(tc => {
    if (filterCategory !== 'all' && tc.category !== filterCategory) return false;
    if (filterItem !== 'all' && tc.testItemId !== filterItem) return false;
    if (filterResult !== 'all' && tc.result !== filterResult) return false;
    if (search && !tc.name.toLowerCase().includes(search.toLowerCase()) && !tc.caseNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openAdd = () => {
    const formWithNum = { ...defaultForm, steps: defaultSteps.map(s => ({ ...s })) };
    setForm(formWithNum);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (tc: TestCase) => {
    setForm({
      name: tc.name, category: tc.category, testItemId: tc.testItemId,
      preconditions: tc.preconditions,
      steps: tc.steps.map(s => ({ action: s.action, expectedResult: s.expectedResult, actualResult: s.actualResult || '' })),
      expectedResult: tc.expectedResult, result: tc.result,
    });
    setEditId(tc.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const steps: TestStep[] = form.steps.map((s, i) => ({
      step: i + 1, action: s.action, expectedResult: s.expectedResult,
      actualResult: s.actualResult || undefined,
    }));
    if (editId) {
      updateTestCase(editId, { name: form.name, category: form.category, testItemId: form.testItemId, preconditions: form.preconditions, steps, expectedResult: form.expectedResult, result: form.result });
    } else {
      const caseNumber = getNextCaseNumber(form.category);
      addTestCase({ name: form.name, caseNumber, category: form.category, testItemId: form.testItemId, preconditions: form.preconditions, steps, expectedResult: form.expectedResult, result: form.result });
    }
    setShowModal(false);
  };

  const addStep = () => setForm({ ...form, steps: [...form.steps, { action: '', expectedResult: '', actualResult: '' }] });
  const removeStep = (idx: number) => {
    if (form.steps.length <= 1) return;
    setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx) });
  };
  const updateStep = (idx: number, field: keyof StepForm, value: string) => {
    const steps = form.steps.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    setForm({ ...form, steps });
  };

  // 统计
  const passCount = data.testCases.filter(tc => tc.result === 'pass').length;
  const failCount = data.testCases.filter(tc => tc.result === 'fail').length;
  const pendingCount = data.testCases.filter(tc => tc.result === 'pending').length;

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索用例..." className="liquid-glass-input w-full pl-8 pr-3 py-1.5 text-sm" />
        </div>
        <LiquidSelect value={filterCategory} onChange={v => setFilterCategory(v)} compact options={[{ value: 'all', label: '全部分类' }, ...CATEGORIES.map(c => ({ value: c, label: TEST_ITEM_CATEGORY_NAMES[c] }))]} />
        <LiquidSelect value={filterItem} onChange={v => setFilterItem(v)} compact options={[{ value: 'all', label: '全部测试项' }, ...data.testItems.map(ti => ({ value: ti.id, label: ti.name }))]} />
        <LiquidSelect value={filterResult} onChange={v => setFilterResult(v)} compact options={[{ value: 'all', label: '全部结果' }, { value: 'pass', label: '通过' }, { value: 'fail', label: '失败' }, { value: 'pending', label: '待测试' }]} />
        <button onClick={openAdd} className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#C199E0] hover:text-[#A87BC7] transition-colors cursor-pointer">
          <Plus size={14} /> 新增用例
        </button>
      </div>

      {/* 统计 */}
      <div className="flex gap-3 mb-4">
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-green-600">{passCount}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">通过</div>
        </div>
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-red-500">{failCount}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">失败</div>
        </div>
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-gray-500">{pendingCount}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">待测试</div>
        </div>
      </div>

      {/* 卡片列表 */}
      <div className="space-y-2">
        {filtered.map(tc => {
          const isExpanded = expandedId === tc.id;
          const testItem = data.testItems.find(ti => ti.id === tc.testItemId);
          return (
            <div key={tc.id} className="liquid-glass-card rounded-xl overflow-hidden">
              {/* 头部 */}
              <div
                className="flex items-center justify-between p-3 cursor-pointer group"
                onClick={() => setExpandedId(isExpanded ? null : tc.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0 relative z-10">
                  {isExpanded ? <ChevronDown size={14} className="text-[var(--text-tertiary)] shrink-0" /> : <ChevronRight size={14} className="text-[var(--text-tertiary)] shrink-0" />}
                  <span className="text-[11px] text-[var(--text-tertiary)] font-mono shrink-0">{tc.caseNumber}</span>
                  <span className="font-medium text-sm text-[var(--text-primary)] truncate">{tc.name}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${TEST_ITEM_CATEGORY_COLORS[tc.category]}`}>{TEST_ITEM_CATEGORY_NAMES[tc.category]}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${TEST_RESULT_COLORS[tc.result]}`}>{TEST_RESULT_NAMES[tc.result]}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-10" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { const r = generateTestCaseReport(tc.id); setReport(r); }} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-[#C199E0] transition-colors cursor-pointer" title="生成报告"><FileText size={13} /></button>
                  <button onClick={() => openEdit(tc)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer" title="编辑"><Edit2 size={13} /></button>
                  <button onClick={() => deleteTestCase(tc.id)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-red-500 transition-colors cursor-pointer" title="删除"><Trash2 size={13} /></button>
                </div>
              </div>
              {/* 展开区 */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-[var(--glass-border)] relative z-10">
                  {testItem && <div className="mt-2 text-[11px] text-[var(--text-tertiary)]">所属测试项: {testItem.name}</div>}
                  {tc.preconditions && <div className="mt-1 text-xs text-[var(--text-secondary)]"><span className="font-medium">前置条件:</span> {tc.preconditions}</div>}
                  <div className="mt-2 space-y-1.5">
                    <div className="text-xs font-medium text-[var(--text-secondary)]">测试步骤:</div>
                    {tc.steps.map(s => (
                      <div key={s.step} className="liquid-glass-subtle p-2 rounded-lg text-xs">
                        <div className="flex items-start gap-2">
                          <span className="text-[var(--text-tertiary)] font-mono shrink-0">步骤{s.step}</span>
                          <div className="flex-1">
                            <div><span className="text-[var(--text-tertiary)]">操作:</span> <span className="text-[var(--text-primary)]">{s.action}</span></div>
                            <div><span className="text-[var(--text-tertiary)]">预期:</span> <span className="text-[var(--text-primary)]">{s.expectedResult}</span></div>
                            {s.actualResult && <div><span className="text-[var(--text-tertiary)]">实际:</span> <span className={tc.result === 'fail' ? 'text-red-500' : 'text-[var(--text-primary)]'}>{s.actualResult}</span></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs"><span className="font-medium text-[var(--text-secondary)]">预期结果:</span> <span className="text-[var(--text-primary)]">{tc.expectedResult}</span></div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">暂无匹配的测试用例</div>}
      </div>

      {/* 新增/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="liquid-glass-strong p-5 w-[520px] max-w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{editId ? '编辑测试用例' : '新增测试用例'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">用例名称</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">分类</label>
                  <LiquidSelect value={form.category} onChange={v => setForm({ ...form, category: v as TestItemCategory })} compact options={CATEGORIES.map(c => ({ value: c, label: TEST_ITEM_CATEGORY_NAMES[c] }))} />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">所属测试项</label>
                  <LiquidSelect value={form.testItemId} onChange={v => setForm({ ...form, testItemId: v })} compact placeholder="-- 选择测试项 --" options={data.testItems.map(ti => ({ value: ti.id, label: ti.name }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">前置条件</label>
                <input value={form.preconditions} onChange={e => setForm({ ...form, preconditions: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">测试步骤</label>
                <div className="space-y-2">
                  {form.steps.map((s, i) => (
                    <div key={i} className="liquid-glass-subtle p-2 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-[var(--text-tertiary)] font-mono">步骤 {i + 1}</span>
                        {form.steps.length > 1 && <button type="button" onClick={() => removeStep(i)} className="text-[11px] text-red-400 hover:text-red-500 cursor-pointer">删除</button>}
                      </div>
                      <input value={s.action} onChange={e => updateStep(i, 'action', e.target.value)} placeholder="操作" className="liquid-glass-input w-full px-2 py-1 rounded-lg text-xs mb-1" />
                      <input value={s.expectedResult} onChange={e => updateStep(i, 'expectedResult', e.target.value)} placeholder="预期结果" className="liquid-glass-input w-full px-2 py-1 rounded-lg text-xs mb-1" />
                      <input value={s.actualResult} onChange={e => updateStep(i, 'actualResult', e.target.value)} placeholder="实际结果" className="liquid-glass-input w-full px-2 py-1 rounded-lg text-xs" />
                    </div>
                  ))}
                  <button type="button" onClick={addStep} className="liquid-glass-btn w-full py-1 rounded-lg text-xs text-[#C199E0] hover:text-[#A87BC7] transition-colors cursor-pointer">+ 添加步骤</button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">预期结果</label>
                <input value={form.expectedResult} onChange={e => setForm({ ...form, expectedResult: e.target.value })} className="liquid-glass-input w-full px-3 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">测试结果</label>
                <LiquidSelect value={form.result} onChange={v => setForm({ ...form, result: v as 'pass' | 'fail' | 'pending' })} compact options={[{ value: 'pending', label: '待测试' }, { value: 'pass', label: '通过' }, { value: 'fail', label: '失败' }]} />
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
        <TestReportModal report={report} testCases={data.testCases.filter(tc => tc.testItemId === report.sourceId || tc.id === report.sourceId)} onClose={() => setReport(null)} />
      )}
    </div>
  );
};
