import React, { useState } from 'react';
import { Plus, Edit3 } from 'lucide-react';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { BaseModal } from '@/components/common/BaseModal';
import type { Issue } from './PreDepartureModule';

type DefectStatus = '未解决' | '已解决' | '分析中';

interface IssuesContentProps {
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
}

export const IssuesContent: React.FC<IssuesContentProps> = ({ issues, setIssues }) => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    defectLink: '',
    defectStatus: '未解决' as DefectStatus
  });

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingIssue(null);
    setFormData({ title: '', description: '', defectLink: '', defectStatus: '未解决' });
    setShowModal(true);
  };

  const handleOpenEditModal = (issue: Issue) => {
    setIsEditing(true);
    setEditingIssue(issue);
    setFormData({
      title: issue.title,
      description: issue.description,
      defectLink: issue.defectLink,
      defectStatus: issue.defectStatus
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.description.trim()) return;
    
    if (isEditing && editingIssue) {
      setIssues(issues.map(issue =>
        issue.id === editingIssue.id
          ? { ...issue, ...formData }
          : issue
      ));
    } else {
      const newIssue: Issue = {
        id: String(Date.now()),
        title: formData.title,
        description: formData.description,
        defectLink: formData.defectLink,
        defectStatus: formData.defectStatus,
        category: 'pre-departure',
        status: 'open'
      };
      setIssues([newIssue, ...issues]);
    }
    
    setShowModal(false);
  };

  const handleDelete = () => {
    if (!editingIssue) return;
    if (window.confirm('确定要删除这个问题吗？')) {
      setIssues(issues.filter(issue => issue.id !== editingIssue.id));
      setShowModal(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleOpenAddModal}
        className="mb-4 px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl flex items-center gap-2"
      >
        <Plus size={18} />
        新增问题
      </button>

      <div className="space-y-3">
        {issues.map((issue) => (
          <div key={issue.id} className="liquid-glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-[var(--text-primary)]">{issue.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  issue.defectStatus === '未解决' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  issue.defectStatus === '已解决' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {issue.defectStatus}
                </span>
              </div>
              <button
                onClick={() => handleOpenEditModal(issue)}
                className="px-2 py-1 text-[var(--text-tertiary)] hover:text-[#C199E0] transition-colors"
                title="编辑"
              >
                <Edit3 size={16} />
              </button>
            </div>
            {issue.description && (
              <p className="text-sm text-[var(--text-secondary)] mb-1">{issue.description}</p>
            )}
            {issue.defectLink && (
              <p className="text-sm text-[#C199E0] truncate">
                <span className="text-[var(--text-tertiary)]">链接：</span>
                {issue.defectLink}
              </p>
            )}
          </div>
        ))}
        
        {issues.length === 0 && (
          <div className="text-center py-8 text-[var(--text-tertiary)]">
            暂无问题记录
          </div>
        )}
      </div>

      {/* 弹窗 */}
      <BaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? '编辑问题' : '新增问题'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">问题标题 *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="请输入问题标题" className="liquid-glass-input w-full px-3 py-2 text-sm" />
          </div>
          
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">问题描述 *</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="请输入问题描述" rows={3} className="liquid-glass-input w-full resize-none" />
          </div>
          
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">缺陷链接</label>
            <input type="text" value={formData.defectLink} onChange={(e) => setFormData({ ...formData, defectLink: e.target.value })} placeholder="请输入缺陷链接（可选）" className="liquid-glass-input w-full px-3 py-2 text-sm" />
          </div>
          
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">缺陷状态</label>
            <LiquidSelect value={formData.defectStatus} onChange={(v) => setFormData({ ...formData, defectStatus: v as DefectStatus })} options={[{ value: '未解决', label: '未解决' }, { value: '已解决', label: '已解决' }, { value: '分析中', label: '分析中' }]} />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowModal(false)}
            className="liquid-glass-btn px-4 py-2 rounded-xl text-[var(--text-secondary)]"
          >
            取消
          </button>
          {isEditing && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors"
            >
              删除
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!formData.title.trim() || !formData.description.trim()}
            className="px-4 py-2 bg-[#C199E0] text-white rounded-xl hover:bg-[#A87BC7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? '保存修改' : '确认添加'}
          </button>
        </div>
      </BaseModal>
    </div>
  );
};
