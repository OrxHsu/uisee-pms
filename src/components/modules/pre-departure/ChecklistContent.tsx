import React from 'react';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { RichRemarkInput } from '@/components/common/RichRemarkInput';
import type { ChecklistItem, RichMedia } from './PreDepartureModule';

type StatusType = '完成' | '延期' | '缺失' | '其他';

interface ChecklistContentProps {
  items: ChecklistItem[];
  setItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
}

export const ChecklistContent: React.FC<ChecklistContentProps> = ({ items, setItems }) => {

  const completedCount = items.filter(item => item.status === '完成').length;
  const totalCount = items.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  const handleStatusChange = (id: string, status: StatusType) => {
    setItems(items.map(item =>
      item.id === id 
        ? { ...item, status } 
        : item
    ));
  };

  const handleRemarkChange = (id: string, remark: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, remark } : item
    ));
  };

  const handleMediaChange = (id: string, media: RichMedia[]) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, media } : item
    ));
  };

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case '完成': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case '延期': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case '缺失': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      case '其他': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
    }
  };

  return (
    <div>
      {/* 进度条 */}
      <div className="liquid-glass-card p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#C199E0]">完成进度</h3>
            <p className="text-sm text-[var(--text-secondary)]">{completedCount}/{totalCount} 项已完成</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#C199E0]">{progress}%</div>
          </div>
        </div>
      </div>

      <div className="h-3 bg-[var(--glass-border)] rounded-full mb-6">
        <div
          className="h-3 bg-[#C199E0] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="liquid-glass-card p-4"
          >
            {/* 文字和状态 */}
            <div className="flex items-center gap-4 mb-3">
              <span className="flex-1 text-[var(--text-primary)] font-medium">
                {item.title}
              </span>
              
              <LiquidSelect
                value={item.status}
                onChange={(v) => handleStatusChange(item.id, v as StatusType)}
                buttonClassName={`font-medium ${getStatusColor(item.status)}`}
                options={[{ value: '完成', label: '完成' }, { value: '延期', label: '延期' }, { value: '缺失', label: '缺失' }, { value: '其他', label: '其他' }]}
              />
            </div>
            
            {/* 备注输入框 */}
            <RichRemarkInput
              value={item.remark}
              media={item.media}
              onChange={(remark) => handleRemarkChange(item.id, remark)}
              onMediaChange={(media) => handleMediaChange(item.id, media)}
              placeholder="请输入备注..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};
