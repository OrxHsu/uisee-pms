import React, { useState } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, ExternalLink, Link2,
  FileText, Tag, User, Calendar,
} from 'lucide-react';
import { useDocumentManagementData } from './useDocumentManagementData';
import { Document, DocumentCategory, DocumentStatus } from '@/types/module';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import {
  DOCUMENT_CATEGORY_NAMES,
  DOCUMENT_CATEGORY_COLORS,
  DOCUMENT_STATUS_NAMES,
  DOCUMENT_STATUS_COLORS,
} from '@/constants/modules';
import { formatDate } from '@/utils/helpers';

interface Props {
  projectId: string;
  viewMode: 'list' | 'category';
}

const CATEGORIES: DocumentCategory[] = ['technical', 'management', 'safety', 'testing', 'training-doc', 'other'];
const STATUSES: DocumentStatus[] = ['draft', 'published', 'archived'];

interface FormData {
  title: string;
  category: DocumentCategory;
  description: string;
  url: string;
  tags: string;
  status: DocumentStatus;
  uploadedBy: string;
}

const defaultForm: FormData = {
  title: '', category: 'technical', description: '', url: '',
  tags: '', status: 'draft', uploadedBy: '',
};

export const DocumentListTab: React.FC<Props> = ({ projectId, viewMode }) => {
  const { data, addDocument, updateDocument, deleteDocument } = useDocumentManagementData(projectId);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // 筛选
  const filtered = data.documents.filter(doc => {
    if (filterCategory !== 'all' && doc.category !== filterCategory) return false;
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return doc.title.toLowerCase().includes(s) ||
        doc.description.toLowerCase().includes(s) ||
        doc.tags.some(t => t.toLowerCase().includes(s)) ||
        doc.uploadedBy.toLowerCase().includes(s);
    }
    return true;
  });

  // 分类视图数据
  const groupedByCategory = CATEGORIES.map(cat => ({
    category: cat,
    label: DOCUMENT_CATEGORY_NAMES[cat],
    color: DOCUMENT_CATEGORY_COLORS[cat],
    documents: filtered.filter(doc => doc.category === cat),
  })).filter(g => g.documents.length > 0);

  const openAdd = () => {
    setForm(defaultForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (doc: Document) => {
    setForm({
      title: doc.title,
      category: doc.category,
      description: doc.description,
      url: doc.url,
      tags: doc.tags.join('、'),
      status: doc.status,
      uploadedBy: doc.uploadedBy,
    });
    setEditId(doc.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;
    const tags = form.tags.split(/[,，、\s]/).map(t => t.trim()).filter(Boolean);
    if (editId) {
      updateDocument(editId, { ...form, tags });
    } else {
      addDocument({ ...form, tags });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteDocument(id);
    setDeleteConfirm(null);
  };

  // 统计
  const stats = {
    total: data.documents.length,
    draft: data.documents.filter(d => d.status === 'draft').length,
    published: data.documents.filter(d => d.status === 'published').length,
    archived: data.documents.filter(d => d.status === 'archived').length,
  };

  // 文档卡片渲染
  const renderDocCard = (doc: Document) => (
    <div key={doc.id} className="liquid-glass-card p-3 rounded-xl group">
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <FileText size={14} className="text-indigo-400 shrink-0" />
            <span className="font-medium text-sm text-[var(--text-primary)] truncate">{doc.title}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${DOCUMENT_CATEGORY_COLORS[doc.category]}`}>
              {DOCUMENT_CATEGORY_NAMES[doc.category]}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${DOCUMENT_STATUS_COLORS[doc.status]}`}>
              {DOCUMENT_STATUS_NAMES[doc.status]}
            </span>
          </div>
          {doc.description && (
            <p className="text-xs text-[var(--text-secondary)] mb-1.5 line-clamp-2">{doc.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-tertiary)]">
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors truncate max-w-[240px]"
              title={doc.url}
            >
              <Link2 size={11} /> {doc.url}
            </a>
            {doc.uploadedBy && (
              <span className="flex items-center gap-1"><User size={11} /> {doc.uploadedBy}</span>
            )}
            <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(doc.createdAt)}</span>
          </div>
          {doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {doc.tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] bg-indigo-500/10 text-indigo-400">
                  <Tag size={9} />{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-indigo-400 transition-colors cursor-pointer"
            title="打开链接"
          >
            <ExternalLink size={13} />
          </a>
          <button
            onClick={() => openEdit(doc)}
            className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="编辑"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => setDeleteConfirm(doc.id)}
            className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-red-500 transition-colors cursor-pointer"
            title="删除"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索文档标题、描述、标签..."
            className="liquid-glass-input w-full pl-8 pr-3 py-1.5 text-sm"
          />
        </div>
        <LiquidSelect
          value={filterCategory}
          onChange={v => setFilterCategory(v)}
          compact
          options={[{ value: 'all', label: '全部分类' }, ...CATEGORIES.map(c => ({ value: c, label: DOCUMENT_CATEGORY_NAMES[c] }))]}
        />
        <LiquidSelect
          value={filterStatus}
          onChange={v => setFilterStatus(v)}
          compact
          options={[{ value: 'all', label: '全部状态' }, ...STATUSES.map(s => ({ value: s, label: DOCUMENT_STATUS_NAMES[s] }))]}
        />
        <button
          onClick={openAdd}
          className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <Plus size={14} /> 新增文档
        </button>
      </div>

      {/* 统计摘要 */}
      <div className="flex gap-3 mb-4">
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-indigo-400">{stats.total}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">全部文档</div>
        </div>
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-yellow-500">{stats.draft}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">草稿</div>
        </div>
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-green-600">{stats.published}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">已发布</div>
        </div>
        <div className="liquid-glass-subtle px-3 py-1.5 rounded-xl text-center min-w-[80px]">
          <div className="text-lg font-semibold text-slate-500">{stats.archived}</div>
          <div className="text-[11px] text-[var(--text-tertiary)]">已归档</div>
        </div>
      </div>

      {/* 列表视图 */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {filtered.map(doc => renderDocCard(doc))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">暂无匹配的文档</div>
          )}
        </div>
      )}

      {/* 分类视图 */}
      {viewMode === 'category' && (
        <div className="space-y-4">
          {groupedByCategory.length === 0 && (
            <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">暂无匹配的文档</div>
          )}
          {groupedByCategory.map(({ category, label, documents }) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${DOCUMENT_CATEGORY_COLORS[category]}`}>
                  {label}
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)]">{documents.length} 篇文档</span>
              </div>
              <div className="space-y-2 pl-2 border-l-2 border-indigo-400/20">
                {documents.map(doc => renderDocCard(doc))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新增/编辑模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="liquid-glass-strong p-5 w-[560px] max-w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{editId ? '编辑文档' : '新增文档'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">文档标题</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="liquid-glass-input w-full px-3 py-1.5 text-sm"
                  placeholder="请输入文档标题"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">文档链接</label>
                <div className="relative">
                  <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    value={form.url}
                    onChange={e => setForm({ ...form, url: e.target.value })}
                    className="liquid-glass-input w-full pl-8 pr-3 py-1.5 text-sm"
                    placeholder="粘贴文档超链接，如 https://docs.example.com/..."
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">文档描述</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="liquid-glass-input w-full px-3 py-1.5 text-sm min-h-[60px] resize-y"
                  placeholder="简要描述文档内容"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">文档分类</label>
                  <LiquidSelect
                    value={form.category}
                    onChange={v => setForm({ ...form, category: v as DocumentCategory })}
                    compact
                    options={CATEGORIES.map(c => ({ value: c, label: DOCUMENT_CATEGORY_NAMES[c] }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1">文档状态</label>
                  <LiquidSelect
                    value={form.status}
                    onChange={v => setForm({ ...form, status: v as DocumentStatus })}
                    compact
                    options={STATUSES.map(s => ({ value: s, label: DOCUMENT_STATUS_NAMES[s] }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">标签（用顿号或逗号分隔）</label>
                <input
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  className="liquid-glass-input w-full px-3 py-1.5 text-sm"
                  placeholder="例如：AET、技术规格、自动驾驶"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-secondary)] mb-1">上传人</label>
                <input
                  value={form.uploadedBy}
                  onChange={e => setForm({ ...form, uploadedBy: e.target.value })}
                  className="liquid-glass-input w-full px-3 py-1.5 text-sm"
                  placeholder="请输入上传人姓名"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="liquid-glass-btn flex-1 px-4 py-2 rounded-xl text-sm text-[var(--text-primary)] transition-transform active:scale-[0.98] cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors active:scale-[0.98] cursor-pointer"
                >
                  {editId ? '保存' : '创建'}
                </button>
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
            <p className="text-sm text-[var(--text-secondary)] mb-4">确定要删除该文档吗？此操作不可撤销。</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="liquid-glass-btn flex-1 px-4 py-2 rounded-xl text-sm text-[var(--text-primary)] cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
