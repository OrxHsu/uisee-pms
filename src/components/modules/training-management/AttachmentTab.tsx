import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, Image, Video, Trash2, X, Upload, Clipboard } from 'lucide-react';
import { useTrainingManagementData } from './useTrainingManagementData';
import { AttachmentPreviewModal } from './AttachmentPreviewModal';
import { Attachment, TrainingRecord } from '@/types/module';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { TRAINING_CATEGORY_NAMES } from '@/constants/modules';

interface Props {
  projectId: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export const AttachmentTab: React.FC<Props> = ({ projectId }) => {
  const { data, addAttachment, removeAttachment } = useTrainingManagementData(projectId);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('all');
  const [previewAttachment, setPreviewAttachment] = useState<{ attachment: Attachment; recordId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 粘贴事件
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const targetRecordId = selectedRecordId;
    if (targetRecordId === 'all') {
      // 如果没选中具体记录，选第一条
      const firstRecord = data.trainingRecords[0];
      if (!firstRecord) return;
      processPastedItems(items, firstRecord.id);
    } else {
      processPastedItems(items, targetRecordId);
    }
  }, [selectedRecordId, data.trainingRecords]);

  const processPastedItems = (items: DataTransferItemList, recordId: string) => {
    Array.from(items).forEach(item => {
      if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
        const file = item.getAsFile();
        if (file) processFile(file, recordId);
      }
    });
  };

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const processFile = (file: File, recordId: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const attachmentType = file.type.startsWith('video/') ? 'video' as const : 'image' as const;
      addAttachment(recordId, {
        name: file.name,
        type: attachmentType,
        url,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const targetRecordId = selectedRecordId === 'all'
      ? data.trainingRecords[0]?.id
      : selectedRecordId;
    if (!targetRecordId) return;
    Array.from(files).forEach(file => processFile(file, targetRecordId));
    e.target.value = '';
  };

  // 筛选记录
  const displayRecords = selectedRecordId === 'all'
    ? data.trainingRecords
    : data.trainingRecords.filter(r => r.id === selectedRecordId);

  // 获取所有附件及所属记录的映射
  const getAllAttachments = (): { attachment: Attachment; record: TrainingRecord }[] => {
    const result: { attachment: Attachment; record: TrainingRecord }[] = [];
    displayRecords.forEach(record => {
      record.attachments.forEach(att => {
        result.push({ attachment: att, record });
      });
    });
    return result;
  };

  const allAttachments = getAllAttachments();

  // 预览导航
  const handlePrev = () => {
    if (!previewAttachment) return;
    const idx = allAttachments.findIndex(a => a.attachment.id === previewAttachment.attachment.id);
    if (idx > 0) {
      const prev = allAttachments[idx - 1];
      setPreviewAttachment({ attachment: prev.attachment, recordId: prev.record.id });
    }
  };

  const handleNext = () => {
    if (!previewAttachment) return;
    const idx = allAttachments.findIndex(a => a.attachment.id === previewAttachment.attachment.id);
    if (idx < allAttachments.length - 1) {
      const next = allAttachments[idx + 1];
      setPreviewAttachment({ attachment: next.attachment, recordId: next.record.id });
    }
  };

  const currentPreviewIdx = previewAttachment
    ? allAttachments.findIndex(a => a.attachment.id === previewAttachment.attachment.id)
    : -1;

  return (
    <div>
      {/* 操作栏 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <LiquidSelect
          value={selectedRecordId}
          onChange={v => setSelectedRecordId(v)}
          compact
          options={[
            { value: 'all', label: '全部培训记录' },
            ...data.trainingRecords.map(r => ({ value: r.id, label: r.title })),
          ]}
        />
        <div className="flex items-center gap-1.5 px-3 py-1.5 liquid-glass-subtle rounded-xl text-xs text-[var(--text-tertiary)]">
          <Clipboard size={12} /> Ctrl+V 粘贴上传
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="liquid-glass-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#C199E0] hover:text-[#A87BC7] transition-colors cursor-pointer"
        >
          <Upload size={14} /> 选择文件
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="text-xs text-[var(--text-tertiary)] ml-auto">
          共 {allAttachments.length} 个附件
        </div>
      </div>

      {/* 按培训记录分组的附件网格 */}
      {displayRecords.map(record => {
        if (record.attachments.length === 0 && selectedRecordId !== 'all') {
          return (
            <div key={record.id} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-medium text-sm text-[var(--text-primary)]">{record.title}</span>
                <span className="text-xs text-[var(--text-tertiary)]">暂无附件</span>
              </div>
              <div className="liquid-glass-subtle rounded-xl p-8 text-center">
                <p className="text-sm text-[var(--text-tertiary)]">暂无附件，可粘贴或选择文件上传</p>
              </div>
            </div>
          );
        }

        return record.attachments.length > 0 ? (
          <div key={record.id} className="mb-6">
            {selectedRecordId === 'all' && (
              <div className="flex items-center gap-2 mb-3">
                <span className="font-medium text-sm text-[var(--text-primary)]">{record.title}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--accent-light)] text-[#C199E0]">
                  {record.attachments.length} 个附件
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {record.attachments.map(att => (
                <div key={att.id} className="liquid-glass-card rounded-xl overflow-hidden group">
                  <div className="relative aspect-[4/3] bg-black/5">
                    {att.type === 'image' ? (
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewAttachment({ attachment: att, recordId: record.id })} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center cursor-pointer" onClick={() => setPreviewAttachment({ attachment: att, recordId: record.id })}>
                        <Video size={32} className="text-[var(--text-tertiary)]" />
                      </div>
                    )}
                    {/* hover 操作 */}
                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); removeAttachment(record.id, att.id); }}
                        className="p-1 rounded-lg bg-black/40 hover:bg-red-500/80 text-white transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {/* 视频播放标识 */}
                    {att.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="text-[11px] text-[var(--text-primary)] truncate">{att.name}</div>
                    <div className="text-[10px] text-[var(--text-tertiary)]">{formatFileSize(att.size)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;
      })}

      {/* 全部记录但无任何附件 */}
      {allAttachments.length === 0 && (
        <div className="liquid-glass-subtle rounded-xl p-12 text-center">
          <Image size={32} className="mx-auto mb-3 text-[var(--text-tertiary)]" />
          <p className="text-sm text-[var(--text-tertiary)]">暂无附件</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">使用 Ctrl+V 粘贴图片/视频，或点击"选择文件"上传</p>
        </div>
      )}

      {/* 全屏预览 */}
      {previewAttachment && (
        <AttachmentPreviewModal
          attachment={previewAttachment.attachment}
          onClose={() => setPreviewAttachment(null)}
          onPrev={currentPreviewIdx > 0 ? handlePrev : undefined}
          onNext={currentPreviewIdx < allAttachments.length - 1 ? handleNext : undefined}
        />
      )}
    </div>
  );
};
