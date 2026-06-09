import React from 'react';
import { X, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { TestReport, TestCase } from '@/types/module';
import { downloadFile, formatDate } from '@/utils/helpers';
import { TEST_RESULT_NAMES, TEST_RESULT_COLORS } from '@/constants/modules';

interface Props {
  report: TestReport;
  testCases: TestCase[];
  onClose: () => void;
}

export const TestReportModal: React.FC<Props> = ({ report, testCases, onClose }) => {
  const passRate = report.totalCases > 0 ? Math.round((report.passedCases / report.totalCases) * 100) : 0;
  const failRate = report.totalCases > 0 ? Math.round((report.failedCases / report.totalCases) * 100) : 0;

  const exportJSON = () => {
    const content = JSON.stringify({ report, testCases }, null, 2);
    downloadFile(content, `${report.title}.json`, 'application/json');
  };

  const exportText = () => {
    const lines = [
      `测试报告: ${report.title}`,
      `生成时间: ${formatDate(report.generatedAt)}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `总用例数: ${report.totalCases}`,
      `通过: ${report.passedCases} (${passRate}%)`,
      `失败: ${report.failedCases} (${failRate}%)`,
      `待测试: ${report.pendingCases}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      report.summary,
      ``,
      `── 用例明细 ──`,
    ];
    testCases.forEach(tc => {
      lines.push(`[${tc.caseNumber}] ${tc.name} — ${TEST_RESULT_NAMES[tc.result]}`);
      tc.steps.forEach(s => {
        lines.push(`  步骤${s.step}: ${s.action}`);
        lines.push(`    预期: ${s.expectedResult}`);
        if (s.actualResult) lines.push(`    实际: ${s.actualResult}`);
      });
      lines.push('');
    });
    downloadFile(lines.join('\n'), `${report.title}.txt`, 'text/plain');
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="liquid-glass-strong p-6 w-[560px] max-w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] text-lg">{report.title}</h3>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">生成于 {formatDate(report.generatedAt)}</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"><X size={18} /></button>
        </div>

        {/* 统计面板 */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="liquid-glass-subtle p-3 rounded-xl text-center">
            <CheckCircle size={20} className="text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-600">{report.passedCases}</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">通过</div>
          </div>
          <div className="liquid-glass-subtle p-3 rounded-xl text-center">
            <XCircle size={20} className="text-red-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-red-500">{report.failedCases}</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">失败</div>
          </div>
          <div className="liquid-glass-subtle p-3 rounded-xl text-center">
            <Clock size={20} className="text-gray-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-500">{report.pendingCases}</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">待测试</div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-5 relative z-10">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
            <span>通过率</span>
            <span>{passRate}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
            <div className="h-full rounded-full flex">
              <div className="bg-green-500 transition-all" style={{ width: `${passRate}%` }} />
              <div className="bg-red-500 transition-all" style={{ width: `${failRate}%` }} />
            </div>
          </div>
        </div>

        {/* 摘要 */}
        <div className="liquid-glass-subtle p-3 rounded-xl mb-5 text-sm text-[var(--text-secondary)] relative z-10">
          {report.summary}
        </div>

        {/* 用例明细 */}
        {testCases.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">用例明细</h4>
            <div className="space-y-1.5">
              {testCases.map(tc => (
                <div key={tc.id} className="liquid-glass-subtle px-3 py-2 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[var(--text-tertiary)]">{tc.caseNumber}</span>
                    <span className="text-[var(--text-primary)]">{tc.name}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TEST_RESULT_COLORS[tc.result]}`}>
                    {TEST_RESULT_NAMES[tc.result]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 导出按钮 */}
        <div className="flex gap-2 relative z-10">
          <button onClick={exportJSON} className="liquid-glass-btn flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm text-[var(--text-primary)] transition-transform active:scale-[0.98] cursor-pointer">
            <Download size={14} /> 下载 JSON
          </button>
          <button onClick={exportText} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl text-sm font-medium transition-colors active:scale-[0.98] cursor-pointer">
            <Download size={14} /> 下载文本
          </button>
        </div>
      </div>
    </div>
  );
};
