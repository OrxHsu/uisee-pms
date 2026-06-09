import React, { useState } from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { RemainingIssuesTab } from './RemainingIssuesTab';
import { FollowUpInvestmentTab } from './FollowUpInvestmentTab';

type TabType = 'remaining-issues' | 'follow-up-investment';

interface Props {
  projectId: string;
}

const tabs: { key: TabType; label: string; icon: React.FC<any> }[] = [
  { key: 'remaining-issues', label: '遗留问题', icon: AlertTriangle },
  { key: 'follow-up-investment', label: '后续投入', icon: TrendingUp },
];

export const ProjectClosureModule: React.FC<Props> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('remaining-issues');

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
                ? 'text-[var(--text-primary)] ring-1 ring-amber-400/50'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {activeTab === 'remaining-issues' && <RemainingIssuesTab projectId={projectId} />}
      {activeTab === 'follow-up-investment' && <FollowUpInvestmentTab projectId={projectId} />}
    </div>
  );
};
