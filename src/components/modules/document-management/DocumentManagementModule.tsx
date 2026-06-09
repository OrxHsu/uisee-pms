import React, { useState } from 'react';
import { FileText, FolderOpen } from 'lucide-react';
import { DocumentListTab } from './DocumentListTab';

type TabType = 'all-docs' | 'by-category';

interface Props {
  projectId: string;
}

const tabs: { key: TabType; label: string; icon: React.FC<any> }[] = [
  { key: 'all-docs', label: '全部文档', icon: FileText },
  { key: 'by-category', label: '分类浏览', icon: FolderOpen },
];

export const DocumentManagementModule: React.FC<Props> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('all-docs');

  return (
    <div>
      {/* Liquid Glass Tab 栏 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`liquid-glass-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer outline-none focus:outline-none ${
              activeTab === key
                ? 'text-[var(--text-primary)] ring-1 ring-indigo-400/50'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {activeTab === 'all-docs' && <DocumentListTab projectId={projectId} viewMode="list" />}
      {activeTab === 'by-category' && <DocumentListTab projectId={projectId} viewMode="category" />}
    </div>
  );
};
