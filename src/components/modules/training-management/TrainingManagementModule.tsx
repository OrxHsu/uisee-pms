import React, { useState } from 'react';
import { GraduationCap, Paperclip } from 'lucide-react';
import { TrainingRecordTab } from './TrainingRecordTab';
import { AttachmentTab } from './AttachmentTab';

type TabType = 'training-records' | 'attachments';

interface Props {
  projectId: string;
}

const tabs: { key: TabType; label: string; icon: React.FC<any> }[] = [
  { key: 'training-records', label: '培训记录', icon: GraduationCap },
  { key: 'attachments', label: '附件管理', icon: Paperclip },
];

export const TrainingManagementModule: React.FC<Props> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('training-records');

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
                ? 'text-[var(--text-primary)] ring-1 ring-[#C199E0]/50'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {activeTab === 'training-records' && <TrainingRecordTab projectId={projectId} />}
      {activeTab === 'attachments' && <AttachmentTab projectId={projectId} />}
    </div>
  );
};
