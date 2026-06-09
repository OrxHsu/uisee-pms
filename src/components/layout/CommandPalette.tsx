import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, FolderOpen, Layers, ArrowRight } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import { scaleIn, overlayFade, staggerContainer, commandItemStagger } from '@/lib/animations';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'project' | 'module' | 'action';
  action: () => void;
}

export const CommandPalette: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const navigate = useNavigate();
  const { projects, currentProject } = useProjectStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    // 项目
    projects.forEach((p) => {
      items.push({
        id: `project-${p.id}`,
        title: p.name,
        subtitle: `${p.type} · ${p.status}`,
        icon: <FolderOpen size={16} className="text-space-coral" />,
        type: 'project',
        action: () => {
          navigate(`/project/${p.id}`);
          onClose();
        },
      });
    });

    // 模块（如果当前有项目）
    if (currentProject) {
      const modules = [
        { id: 'pre-departure', label: '发车检查' },
        { id: 'vehicle-arrival', label: '车辆到场' },
        { id: 'deployment-alignment', label: '部署对齐' },
        { id: 'data-management', label: '数据管理' },
        { id: 'deployment-management', label: '部署管理' },
      ];
      modules.forEach((m) => {
        items.push({
          id: `module-${m.id}`,
          title: m.label,
          subtitle: currentProject.name,
          icon: <Layers size={16} className="text-space-blue" />,
          type: 'module',
          action: () => {
            navigate(`/project/${currentProject.id}?module=${m.id}`);
            onClose();
          },
        });
      });
    }

    return items;
  }, [projects, currentProject, navigate, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [allItems, query]);

  // 重置选中索引
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // 聚焦输入框
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  // 键盘导航
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filtered[selectedIndex]?.action();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filtered, selectedIndex]);

  const projectItems = filtered.filter((i) => i.type === 'project');
  const moduleItems = filtered.filter((i) => i.type === 'module');

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayFade}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          onClick={onClose}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* Command Palette 面板 */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-[560px] max-w-[90vw] overflow-hidden rounded-arc-xl glass-strong shadow-lift-dark"
          >
            {/* 搜索输入 */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)]">
              <Search size={18} className="text-[var(--text-tertiary)]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索项目或模块..."
                className="flex-1 bg-transparent text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] outline-none"
              />
              <div className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-surface)]/50 px-1.5 py-0.5 rounded-md border border-[var(--border-color)]">
                <Command size={10} />
                <span>K</span>
              </div>
            </div>

            {/* 结果列表 */}
            <div className="max-h-[320px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-[var(--text-tertiary)] text-sm">
                  未找到匹配结果
                </div>
              ) : (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                  {projectItems.length > 0 && (
                    <>
                      <div className="px-4 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                        项目
                      </div>
                      {projectItems.map((item, idx) => (
                        <CommandRow
                          key={item.id}
                          item={item}
                          isSelected={filtered.indexOf(item) === selectedIndex}
                          onClick={() => item.action()}
                        />
                      ))}
                    </>
                  )}
                  {moduleItems.length > 0 && (
                    <>
                      <div className="px-4 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                        模块
                      </div>
                      {moduleItems.map((item) => (
                        <CommandRow
                          key={item.id}
                          item={item}
                          isSelected={filtered.indexOf(item) === selectedIndex}
                          onClick={() => item.action()}
                        />
                      ))}
                    </>
                  )}
                </motion.div>
              )}
            </div>

            {/* 底部提示 */}
            <div className="px-4 py-2 border-t border-[var(--border-color)] flex items-center gap-4 text-[10px] text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1">
                <span className="px-1 bg-[var(--bg-surface)]/50 rounded border border-[var(--border-color)]">↑↓</span>
                导航
              </span>
              <span className="flex items-center gap-1">
                <span className="px-1 bg-[var(--bg-surface)]/50 rounded border border-[var(--border-color)]">↵</span>
                选择
              </span>
              <span className="flex items-center gap-1">
                <span className="px-1 bg-[var(--bg-surface)]/50 rounded border border-[var(--border-color)]">esc</span>
                关闭
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CommandRow: React.FC<{
  item: CommandItem;
  isSelected: boolean;
  onClick: () => void;
}> = ({ item, isSelected, onClick }) => {
  return (
    <motion.button
      variants={commandItemStagger}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
        isSelected
          ? 'bg-[var(--accent-light)]'
          : 'hover:bg-[var(--bg-surface)]/40'
      }`}
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--bg-surface)]/60 flex items-center justify-center border border-[var(--border-color)]">
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[var(--text-primary)] truncate">{item.title}</div>
        {item.subtitle && (
          <div className="text-xs text-[var(--text-secondary)] truncate">{item.subtitle}</div>
        )}
      </div>
      {isSelected && <ArrowRight size={14} className="text-[var(--accent)] flex-shrink-0" />}
    </motion.button>
  );
};
