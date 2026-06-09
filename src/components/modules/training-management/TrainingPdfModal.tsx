import React, { useState, useEffect } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { TrainingRecord, Attachment } from '@/types/module';
import { TRAINING_CATEGORY_NAMES, TRAINING_STATUS_NAMES } from '@/constants/modules';
import { createChinesePdf, isChineseFontAvailable, loadChineseFont, setChineseFont, getChineseFontName } from '@/utils/pdfFont';
import autoTable from 'jspdf-autotable';

interface Props {
  record: TrainingRecord;
  onClose: () => void;
}

const FONT_NAME = getChineseFontName();

const generatePdf = async (record: TrainingRecord) => {
  const doc = await createChinesePdf();
  const useChinese = isChineseFontAvailable();

  // 标题
  doc.setFontSize(18);
  setChineseFont(doc);
  doc.setTextColor(40, 40, 50);
  doc.text(record.title, 14, 22);

  // 生成日期
  doc.setFontSize(10);
  setChineseFont(doc);
  doc.setTextColor(120, 120, 130);
  doc.text(
    useChinese ? `生成日期：${new Date().toLocaleDateString('zh-CN')}` : `Generated: ${new Date().toLocaleDateString()}`,
    14, 30
  );

  // 详情表格
  autoTable(doc, {
    startY: 36,
    head: [[useChinese ? '项目' : 'Item', useChinese ? '内容' : 'Content']],
    body: [
      [useChinese ? '培训日期' : 'Training Date', record.date],
      [useChinese ? '培训时间' : 'Time', `${record.startTime} - ${record.endTime}`],
      [useChinese ? '培训地点' : 'Location', record.location],
      [useChinese ? '培训讲师' : 'Trainer', record.trainer],
      [useChinese ? '参训人员' : 'Participants', record.participants.join('、')],
      [useChinese ? '培训分类' : 'Category', TRAINING_CATEGORY_NAMES[record.category] || record.category],
      [useChinese ? '培训状态' : 'Status', TRAINING_STATUS_NAMES[record.status] || record.status],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 4,
      font: useChinese ? FONT_NAME : 'helvetica',
    },
    headStyles: {
      fillColor: [193, 153, 224],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      font: useChinese ? FONT_NAME : 'helvetica',
    },
    alternateRowStyles: { fillColor: [248, 246, 252] },
    margin: { left: 14, right: 14 },
  });

  // autoTable 之后需要重新设置字体
  setChineseFont(doc);

  // 培训内容
  const contentStartY = (doc as any).lastAutoTable?.finalY + 12 || 120;
  doc.setFontSize(13);
  setChineseFont(doc);
  doc.setTextColor(40, 40, 50);
  doc.text(useChinese ? '培训内容' : 'Training Content', 14, contentStartY);

  doc.setFontSize(10);
  setChineseFont(doc);
  doc.setTextColor(60, 60, 70);
  const contentLines = doc.splitTextToSize(record.content, 180);
  doc.text(contentLines, 14, contentStartY + 8);

  // 附件缩略图
  const imageAttachments = record.attachments.filter(a => a.type === 'image');
  if (imageAttachments.length > 0) {
    let imgY = contentStartY + 8 + contentLines.length * 5 + 12;
    doc.setFontSize(13);
    setChineseFont(doc);
    doc.setTextColor(40, 40, 50);
    doc.text(useChinese ? '附件' : 'Attachments', 14, imgY);
    imgY += 8;

    imageAttachments.forEach((attachment) => {
      if (imgY > 260) {
        doc.addPage();
        imgY = 20;
      }
      try {
        doc.addImage(attachment.url, 'JPEG', 14, imgY, 50, 38);
        doc.setFontSize(8);
        setChineseFont(doc);
        doc.setTextColor(120, 120, 130);
        doc.text(attachment.name, 68, imgY + 4);
        imgY += 44;
      } catch {
        // Skip invalid images
      }
    });
  }

  doc.save(`${record.title}-培训记录.pdf`);
};

export const TrainingPdfModal: React.FC<Props> = ({ record, onClose }) => {
  const [fontLoading, setFontLoading] = useState(false);
  const [fontReady, setFontReady] = useState(isChineseFontAvailable());

  // 预加载字体
  useEffect(() => {
    if (!fontReady) {
      loadChineseFont().then((success) => {
        if (success) setFontReady(true);
      });
    }
  }, [fontReady]);

  const handleDownload = async () => {
    setFontLoading(true);
    try {
      await generatePdf(record);
    } finally {
      setFontLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="liquid-glass-strong p-5 w-[560px] max-w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">导出培训记录 PDF</h3>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"><X size={16} /></button>
        </div>

        {/* 字体状态提示 */}
        {fontReady ? (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-xs text-green-700 dark:text-green-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            中文字体已加载，PDF 将使用「思源黑体」渲染
          </div>
        ) : (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            中文字体加载中...
          </div>
        )}

        {/* 预览区 */}
        <div className="liquid-glass-subtle p-4 rounded-xl mb-4">
          <div className="text-lg font-semibold text-[var(--text-primary)] mb-3">{record.title}</div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-[var(--glass-border)]">
                <td className="py-2 pr-4 text-[var(--text-secondary)] w-24">培训日期</td>
                <td className="py-2 text-[var(--text-primary)]">{record.date}</td>
              </tr>
              <tr className="border-b border-[var(--glass-border)]">
                <td className="py-2 pr-4 text-[var(--text-secondary)]">培训时间</td>
                <td className="py-2 text-[var(--text-primary)]">{record.startTime} - {record.endTime}</td>
              </tr>
              <tr className="border-b border-[var(--glass-border)]">
                <td className="py-2 pr-4 text-[var(--text-secondary)]">培训地点</td>
                <td className="py-2 text-[var(--text-primary)]">{record.location}</td>
              </tr>
              <tr className="border-b border-[var(--glass-border)]">
                <td className="py-2 pr-4 text-[var(--text-secondary)]">培训讲师</td>
                <td className="py-2 text-[var(--text-primary)]">{record.trainer}</td>
              </tr>
              <tr className="border-b border-[var(--glass-border)]">
                <td className="py-2 pr-4 text-[var(--text-secondary)]">参训人员</td>
                <td className="py-2 text-[var(--text-primary)]">{record.participants.join('、')}</td>
              </tr>
              <tr className="border-b border-[var(--glass-border)]">
                <td className="py-2 pr-4 text-[var(--text-secondary)]">培训分类</td>
                <td className="py-2 text-[var(--text-primary)]">{TRAINING_CATEGORY_NAMES[record.category]}</td>
              </tr>
              <tr className="border-b border-[var(--glass-border)]">
                <td className="py-2 pr-4 text-[var(--text-secondary)]">培训状态</td>
                <td className="py-2 text-[var(--text-primary)]">{TRAINING_STATUS_NAMES[record.status]}</td>
              </tr>
            </tbody>
          </table>
          {record.content && (
            <div className="mt-3">
              <div className="text-xs text-[var(--text-secondary)] mb-1">培训内容</div>
              <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{record.content}</div>
            </div>
          )}
          {record.attachments.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-[var(--text-secondary)] mb-1">附件 ({record.attachments.length})</div>
              <div className="flex gap-2 flex-wrap">
                {record.attachments.filter(a => a.type === 'image').map(a => (
                  <img key={a.id} src={a.url} alt={a.name} className="w-16 h-16 rounded-lg object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button onClick={onClose} className="liquid-glass-btn flex-1 px-4 py-2 rounded-xl text-sm text-[var(--text-primary)] transition-transform active:scale-[0.98] cursor-pointer">取消</button>
          <button onClick={handleDownload} disabled={fontLoading || !fontReady} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl text-sm font-medium transition-colors active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            {fontLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {fontLoading ? '生成中...' : '下载 PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};
