import React, { useState, useEffect } from 'react';
import { Sun, Moon, Minus, Maximize, Minimize2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { slideDown, glassButtonHover } from '@/lib/animations';

const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

const ThemeButton: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <motion.button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="liquid-glass-btn flex items-center justify-center w-9 h-9 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </motion.button>
  );
};

/* ========== 窗口控制按钮 — Liquid Glass Capsule ========== */
const WindowControls: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!isElectron) return;
    window.electronAPI.windowIsMaximized().then(setIsMaximized);
    window.electronAPI.onWindowMaximized(setIsMaximized);
    return () => { window.electronAPI.removeAllListeners('window-maximized'); };
  }, []);

  const handleMinimize = () => { if (isElectron) window.electronAPI.windowMinimize(); };
  const handleMaximize = () => { if (isElectron) window.electronAPI.windowMaximize(); };
  const handleClose    = () => { if (isElectron) window.electronAPI.windowClose(); };

  return (
    <div className="flex items-center gap-1 ml-2 liquid-glass rounded-xl px-1 py-1">
      {/* 最小化 — 悬停黄晕 */}
      <motion.button
        onClick={handleMinimize}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="group flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-tertiary)] hover:text-[#F59E0B] transition-colors cursor-pointer relative overflow-hidden"
        title="最小化"
      >
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08), transparent)' }}
        />
        <Minus size={14} className="relative z-10" />
      </motion.button>

      {/* 最大化/还原 — 悬停绿晕 */}
      <motion.button
        onClick={handleMaximize}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="group flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-tertiary)] hover:text-[#22C55E] transition-colors cursor-pointer relative overflow-hidden"
        title={isMaximized ? '还原' : '最大化'}
      >
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.08), transparent)' }}
        />
        {isMaximized ? <Minimize2 size={14} className="relative z-10" /> : <Maximize size={14} className="relative z-10" />}
      </motion.button>

      {/* 关闭 — 悬停红晕 */}
      <motion.button
        onClick={handleClose}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="group flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-tertiary)] hover:text-[#EF4444] transition-colors cursor-pointer relative overflow-hidden"
        title="关闭"
      >
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.10), transparent)' }}
        />
        <X size={14} className="relative z-10" />
      </motion.button>
    </div>
  );
};

const Header: React.FC = () => {
  return (
    <motion.header
      variants={slideDown}
      initial="hidden"
      animate="visible"
      className="h-14 flex items-center justify-between px-5 z-20 drag-region"
    >
      {/* 左侧拖拽区域 */}
      <div className="flex-1" />

      {/* 右侧按钮区 — 不可拖拽 */}
      <div className="flex items-center gap-2 no-drag">
        <ThemeButton />
        {isElectron && <WindowControls />}
      </div>
    </motion.header>
  );
};

export default Header;
