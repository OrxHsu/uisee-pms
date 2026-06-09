import React, { useState } from 'react';
import { FlaskConical, FileCheck, Database, Settings, Bug } from 'lucide-react';
import { TestItemTab } from './TestItemTab';
import { TestCaseTab } from './TestCaseTab';
import { TestDataTab } from './TestDataTab';
import { ParameterTab } from './ParameterTab';
import { BugTab } from './BugTab';

type TabType = 'test-items' | 'test-cases' | 'test-data' | 'parameters' | 'bugs';

interface Props {
  projectId: string;
}

const tabs: { key: TabType; label: string; icon: React.FC<any> }[] = [
  { key: 'test-items', label: '测试项管理', icon: FlaskConical },
  { key: 'test-cases', label: '测试用例管理', icon: FileCheck },
  { key: 'test-data', label: '测试数据管理', icon: Database },
  { key: 'parameters', label: '参数管理', icon: Settings },
  { key: 'bugs', label: 'Bug 管理', icon: Bug },
];

export const TestManagementModule: React.FC<Props> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('test-items');

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
      {activeTab === 'test-items' && <TestItemTab projectId={projectId} />}
      {activeTab === 'test-cases' && <TestCaseTab projectId={projectId} />}
      {activeTab === 'test-data' && <TestDataTab projectId={projectId} />}
      {activeTab === 'parameters' && <ParameterTab projectId={projectId} />}
      {activeTab === 'bugs' && <BugTab projectId={projectId} />}
    </div>
  );
};
