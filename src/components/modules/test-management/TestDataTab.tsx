import React, { useState, useRef } from 'react';
import { Upload, Trash2, FileText, Image, File } from 'lucide-react';
import { useTestManagementData } from './useTestManagementData';

interface Props {
  projectId: string;
}

export const TestDataTab: React.FC<Props> = ({ projectId }) => {
  const { data, addTestLog, deleteTestLog, addTestScreenshot, deleteTestScreenshot } = useTestManagementData(projectId);
  const logInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const handleLogUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      addTestLog({
        fileName: f.name,
        testItemId: data.testItems[0]?.id || '',
        remark: '',
      });
    }
    // reset input
    if (logInputRef.current) logInputRef.current.value = '';
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      addTestScreenshot({
        fileName: f.name,
        testItemId: data.testItems[0]?.id || '',
        description: '',
      });
    }
    if (screenshotInputRef.current) screenshotInputRef.current.value = '';
  };

  const getTestItemName = (id: string) => {
    const item = data.testItems.find(ti => ti.id === id);
    return item?.name || '未知测试项';
  };

  const getBugTitle = (id?: string) => {
    if (!id) return '';
    const bug = data.bugs.find(b => b.id === id);
    return bug?.title || '';
  };

  return (
    <div className="space-y-6">
      {/* 测试 Log 面板 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <FileText size={15} className="text-[#C199E0]" /> 测试 Log
          </h3>
          <div>
            <input type="file" ref={logInputRef} onChange={handleLogUpload} className="hidden" multiple accept=".log,.txt,.csv,.json" />
            <button onClick={() => logInputRef.current?.click()} className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#C199E0] hover:text-[#A87BC7] transition-colors cursor-pointer">
              <Upload size={14} /> 上传 Log
            </button>
          </div>
        </div>

        {data.testLogs.length === 0 ? (
          <div className="liquid-glass-subtle p-6 rounded-xl text-center text-sm text-[var(--text-tertiary)]">暂无测试 Log 文件</div>
        ) : (
          <div className="space-y-1.5">
            {data.testLogs.map(log => (
              <div key={log.id} className="liquid-glass-card p-2.5 rounded-xl flex items-center justify-between group">
                <div className="flex items-center gap-2.5 relative z-10 flex-1 min-w-0">
                  <File size={14} className="text-[var(--text-tertiary)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[var(--text-primary)] truncate">{log.fileName}</div>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
                      <span>{getTestItemName(log.testItemId)}</span>
                      <span>{log.uploadedAt ? new Date(log.uploadedAt).toLocaleDateString('zh-CN') : ''}</span>
                      {log.remark && <span className="truncate max-w-[150px]">{log.remark}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => deleteTestLog(log.id)} className="liquid-glass-btn p-1 rounded-lg text-[var(--text-secondary)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer relative z-10" title="删除">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 问题截图面板 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Image size={15} className="text-[#C199E0]" /> 问题截图
          </h3>
          <div>
            <input type="file" ref={screenshotInputRef} onChange={handleScreenshotUpload} className="hidden" multiple accept="image/*" />
            <button onClick={() => screenshotInputRef.current?.click()} className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#C199E0] hover:text-[#A87BC7] transition-colors cursor-pointer">
              <Upload size={14} /> 上传截图
            </button>
          </div>
        </div>

        {data.testScreenshots.length === 0 ? (
          <div className="liquid-glass-subtle p-6 rounded-xl text-center text-sm text-[var(--text-tertiary)]">暂无问题截图</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {data.testScreenshots.map(ss => (
              <div key={ss.id} className="liquid-glass-card rounded-xl overflow-hidden group">
                <div className="h-28 bg-[var(--bg-elevated)] flex items-center justify-center relative z-10">
                  <Image size={32} className="text-[var(--text-tertiary)]" />
                </div>
                <div className="p-2 relative z-10">
                  <div className="text-xs text-[var(--text-primary)] truncate font-medium">{ss.fileName}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)] mt-0.5">
                    <span>{getTestItemName(ss.testItemId)}</span>
                    {ss.bugId && <span>| {getBugTitle(ss.bugId)}</span>}
                  </div>
                  {ss.description && <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">{ss.description}</div>}
                  <button onClick={() => deleteTestScreenshot(ss.id)} className="absolute top-1 right-1 liquid-glass-btn p-0.5 rounded text-[var(--text-secondary)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer z-20" title="删除">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
