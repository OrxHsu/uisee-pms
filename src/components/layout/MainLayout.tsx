import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { CommandPalette } from './CommandPalette';

const MainLayout: React.FC = () => {
  const [commandOpen, setCommandOpen] = useState(false);

  // Cmd+K / Ctrl+K 触发 Command Palette
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandOpen((prev) => !prev);
    }
    if (e.key === 'Escape') {
      setCommandOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    // 最外层透明容器，全屏
    <div className="w-full h-full overflow-hidden">
      {/* 圆角裁剪容器，也是窗口可见的最外层 */}
      <div className="w-full h-full bg-[var(--bg-base)] rounded-2xl overflow-hidden relative flex">
        {/* Liquid Glass 氛围层 — 动态光晕 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* 主光晕 — 右上 */}
          <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full opacity-30 dark:opacity-20 transition-opacity duration-700"
            style={{ background: 'radial-gradient(circle, rgba(193,153,224,0.25) 0%, rgba(193,153,224,0.08) 40%, transparent 70%)' }}
          />
          {/* 副光晕 — 左下 */}
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-25 dark:opacity-15 transition-opacity duration-700"
            style={{ background: 'radial-gradient(circle, rgba(10,132,255,0.20) 0%, rgba(10,132,255,0.06) 40%, transparent 70%)' }}
          />
          {/* 中心微光 */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10 dark:opacity-8 transition-opacity duration-700"
            style={{ background: 'radial-gradient(circle, rgba(191,90,242,0.15) 0%, transparent 60%)' }}
          />
        </div>

        {/* 侧边栏 */}
        <Sidebar />

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* 顶部导航 */}
          <Header />

          {/* 内容区域 */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>

        {/* Command Palette */}
        <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      </div>
    </div>
  );
};

export default MainLayout;
