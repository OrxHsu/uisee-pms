import React, { useState } from 'react';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { RichRemarkInput } from '@/components/common/RichRemarkInput';
import type { MainCategory, RichMedia } from './PreDepartureModule';

type StatusType = '完成' | '延期' | '缺失' | '其他';

interface CheckItem {
  id: string;
  title: string;
  description: string;
  status: StatusType;
  remark: string;
  media: RichMedia[];
}

interface SubCategory {
  id: string;
  title: string;
  items: CheckItem[];
}

const getStatusColor = (status: StatusType) => {
  switch (status) {
    case '完成': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
    case '延期': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
    case '缺失': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
    case '其他': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
  }
};

interface CheckContentProps {
  data: MainCategory[];
  setData: React.Dispatch<React.SetStateAction<MainCategory[]>>;
}

export const CheckContent: React.FC<CheckContentProps> = ({ data, setData }) => {

  const updateStatus = (mainId: string, subId: string | null, itemId: string, status: StatusType) => {
    setData(data.map(main => {
      if (main.id !== mainId) return main;
      
      if (main.items) {
        return {
          ...main,
          items: main.items.map(item =>
            item.id === itemId
              ? { ...item, status, remark: status === '完成' ? '' : item.remark }
              : item
          )
        };
      }
      
      if (main.subCategories) {
        return {
          ...main,
          subCategories: main.subCategories.map(sub => {
            if (sub.id !== subId) return sub;
            return {
              ...sub,
              items: sub.items.map(item =>
                item.id === itemId
                  ? { ...item, status, remark: status === '完成' ? '' : item.remark }
                  : item
              )
            };
          })
        };
      }
      
      return main;
    }));
  };

  const updateRemark = (mainId: string, subId: string | null, itemId: string, remark: string) => {
    setData(data.map(main => {
      if (main.id !== mainId) return main;
      
      if (main.items) {
        return {
          ...main,
          items: main.items.map(item =>
            item.id === itemId ? { ...item, remark } : item
          )
        };
      }
      
      if (main.subCategories) {
        return {
          ...main,
          subCategories: main.subCategories.map(sub => {
            if (sub.id !== subId) return sub;
            return {
              ...sub,
              items: sub.items.map(item =>
                item.id === itemId ? { ...item, remark } : item
              )
            };
          })
        };
      }
      
      return main;
    }));
  };

  const updateMedia = (mainId: string, subId: string | null, itemId: string, media: RichMedia[]) => {
    setData(data.map(main => {
      if (main.id !== mainId) return main;
      
      if (main.items) {
        return {
          ...main,
          items: main.items.map(item =>
            item.id === itemId ? { ...item, media } : item
          )
        };
      }
      
      if (main.subCategories) {
        return {
          ...main,
          subCategories: main.subCategories.map(sub => {
            if (sub.id !== subId) return sub;
            return {
              ...sub,
              items: sub.items.map(item =>
                item.id === itemId ? { ...item, media } : item
              )
            };
          })
        };
      }
      
      return main;
    }));
  };

  const renderItem = (mainId: string, subId: string | null, item: CheckItem) => (
    <div key={item.id} className="liquid-glass-card p-4">
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1">
          <div className="font-medium text-[var(--text-primary)]">{item.title}</div>
          <div className="text-sm text-[var(--text-secondary)]">{item.description}</div>
        </div>
        
        <LiquidSelect
          value={item.status}
          onChange={(v) => updateStatus(mainId, subId, item.id, v as StatusType)}
          buttonClassName={`font-medium ${getStatusColor(item.status)}`}
          options={[{ value: '完成', label: '完成' }, { value: '延期', label: '延期' }, { value: '缺失', label: '缺失' }, { value: '其他', label: '其他' }]}
        />
      </div>
      
      <RichRemarkInput
        value={item.remark}
        media={item.media}
        onChange={(remark) => updateRemark(mainId, subId, item.id, remark)}
        onMediaChange={(media) => updateMedia(mainId, subId, item.id, media)}
        placeholder="请输入备注..."
      />
    </div>
  );

  const completedCount = data.reduce((count, main) => {
    if (main.items) return count + main.items.filter(item => item.status === '完成').length;
    if (main.subCategories) return count + main.subCategories.reduce((s, sub) => s + sub.items.filter(item => item.status === '完成').length, 0);
    return count;
  }, 0);
  const totalCount = data.reduce((count, main) => {
    if (main.items) return count + main.items.length;
    if (main.subCategories) return count + main.subCategories.reduce((s, sub) => s + sub.items.length, 0);
    return count;
  }, 0);
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* 进度条 */}
      <div className="liquid-glass-card rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#C199E0]">检查进度</h3>
            <p className="text-sm text-[var(--text-secondary)]">{completedCount}/{totalCount} 项已完成</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#C199E0]">{progress}%</div>
          </div>
        </div>
      </div>

      <div className="h-3 bg-[var(--glass-border)] rounded-full">
        <div
          className="h-3 bg-[#C199E0] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {data.map(mainCategory => (
        <div key={mainCategory.id} className="liquid-glass-subtle rounded-xl p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            {mainCategory.title}
          </h3>
          
          {/* 没有子分类的情况 */}
          {mainCategory.items && (
            <div className="space-y-3">
              {mainCategory.items.map(item => renderItem(mainCategory.id, null, item))}
            </div>
          )}
          
          {/* 有子分类的情况 */}
          {mainCategory.subCategories && (
            <div className="space-y-4">
              {mainCategory.subCategories.map(subCategory => (
                <div key={subCategory.id} className="liquid-glass-card rounded-xl p-4">
                  <h4 className="font-medium text-[var(--text-primary)] mb-3">{subCategory.title}</h4>
                  <div className="space-y-2">
                    {subCategory.items.map(item => renderItem(mainCategory.id, subCategory.id, item))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
