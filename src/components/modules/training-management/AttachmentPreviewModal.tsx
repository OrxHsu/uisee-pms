import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Attachment } from '@/types/module';

interface Props {
  attachment: Attachment;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export const AttachmentPreviewModal: React.FC<Props> = ({ attachment, onClose, onPrev, onNext }) => {
  // 键盘导航
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && onPrev) onPrev();
    if (e.key === 'ArrowRight' && onNext) onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
      >
        <X size={20} />
      </button>

      {/* 左箭头 */}
      {onPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* 右箭头 */}
      {onNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* 内容 */}
      <div className="max-w-[90vw] max-h-[85vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
        {attachment.type === 'image' ? (
          <img
            src={attachment.url}
            alt={attachment.name}
            className="max-w-full max-h-[75vh] object-contain rounded-lg"
          />
        ) : (
          <video
            src={attachment.url}
            controls
            autoPlay
            className="max-w-full max-h-[75vh] rounded-lg"
          >
            您的浏览器不支持视频播放
          </video>
        )}
        <div className="mt-3 text-white/80 text-sm">{attachment.name}</div>
      </div>
    </div>
  );
};
