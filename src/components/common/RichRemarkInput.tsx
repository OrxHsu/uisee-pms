import React, { useState, useRef, useCallback } from 'react';
import { Upload, Video, Trash2, X } from 'lucide-react';

interface RichMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
}

interface RichRemarkInputProps {
  value: string;
  media: RichMedia[];
  onChange: (value: string) => void;
  onMediaChange: (media: RichMedia[]) => void;
  placeholder?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export const RichRemarkInput: React.FC<RichRemarkInputProps> = ({
  value,
  media,
  onChange,
  onMediaChange,
  placeholder = '请输入备注...',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewMedia, setPreviewMedia] = useState<RichMedia | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newMedia: RichMedia = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url,
          name: file.name,
        };
        onMediaChange([...media, newMedia]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, [media, onMediaChange]);

  const handleRemoveMedia = useCallback((id: string) => {
    onMediaChange(media.filter(m => m.id !== id));
  }, [media, onMediaChange]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    Array.from(items).forEach(item => {
      if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const url = event.target?.result as string;
            const newMedia: RichMedia = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              type: file.type.startsWith('video/') ? 'video' : 'image',
              url,
              name: file.name,
            };
            onMediaChange([...media, newMedia]);
          };
          reader.readAsDataURL(file);
        }
      }
    });
  }, [media, onMediaChange]);

  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  return (
    <div className="space-y-2">
      {/* 媒体预览区域 */}
      {media.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {media.map((m) => (
            <div key={m.id} className="relative group">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/10">
                {m.type === 'image' ? (
                  <img
                    src={m.url}
                    alt={m.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setPreviewMedia(m)}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center cursor-pointer"
                    onClick={() => setPreviewMedia(m)}
                  >
                    <Video size={24} className="text-[var(--text-tertiary)]" />
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRemoveMedia(m.id)}
                className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
              {m.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-white ml-0.5" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 输入区域 */}
      <div className="relative flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 text-sm rounded-lg border liquid-glass-input resize-none"
          rows={2}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-[var(--glass-border)] transition-colors cursor-pointer"
          title="上传图片/视频"
        >
          <Upload size={16} className="text-[var(--text-secondary)]" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 全屏预览 */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setPreviewMedia(null)}>
          <button
            onClick={() => setPreviewMedia(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          {previewMedia.type === 'image' ? (
            <img src={previewMedia.url} alt={previewMedia.name} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
          ) : (
            <video src={previewMedia.url} controls className="max-w-full max-h-full" onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}
    </div>
  );
};