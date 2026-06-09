import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Calendar, Inbox, FolderOpen, MapPin, Clock,
  Car, Bus, Truck, Package, Container,
  TrendingUp, AlertTriangle, CheckCircle2, Circle, Archive,
  BarChart3, Users, Zap,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Project, ProjectStatus, ProjectType } from '@/types/project';
import { staggerContainer, staggerItem, kanbanColumnStagger, cardHover, cardHoverDark } from '@/lib/animations';

const STATUS_ORDER: ProjectStatus[] = ['未开始', '进行中', '已结束', '延期', '已归档'];

/* 状态颜色（统一背景+文字格式，与类型颜色一致） */
const STATUS_STYLES: Record<ProjectStatus, { bg: string; text: string; icon: string }> = {
  '未开始': { bg: 'bg-space-indigo/10', text: 'text-space-indigo', icon: 'text-space-indigo' },
  '进行中': { bg: 'bg-space-blue/10', text: 'text-space-blue', icon: 'text-space-blue' },
  '已结束': { bg: 'bg-space-green/10', text: 'text-space-green', icon: 'text-space-green' },
  '延期': { bg: 'bg-space-yellow/10', text: 'text-space-yellow', icon: 'text-space-yellow' },
  '已归档': { bg: 'bg-space-purple/10', text: 'text-space-purple', icon: 'text-space-purple' },
};

/* 状态图标 */
const STATUS_ICONS: Record<ProjectStatus, React.FC<any>> = {
  '未开始': Circle,
  '进行中': Zap,
  '已结束': CheckCircle2,
  '延期': AlertTriangle,
  '已归档': Archive,
};

/* 类型颜色 */
const TYPE_COLORS: Record<string, { bg: string; text: string; icon: string; border: string }> = {
  AET: { bg: 'bg-space-coral/10', text: 'text-space-coral', icon: 'text-space-coral', border: 'border-space-coral/20' },
  BUS: { bg: 'bg-space-blue/10', text: 'text-space-blue', icon: 'text-space-blue', border: 'border-space-blue/20' },
  UBOX: { bg: 'bg-space-purple/10', text: 'text-space-purple', icon: 'text-space-purple', border: 'border-space-purple/20' },
  '平板车': { bg: 'bg-space-orange/10', text: 'text-space-orange', icon: 'text-space-orange', border: 'border-space-orange/20' },
  '集卡': { bg: 'bg-space-green/10', text: 'text-space-green', icon: 'text-space-green', border: 'border-space-green/20' },
};

/* 类型图标 */
const TYPE_ICONS: Record<string, React.FC<any>> = {
  AET: Car,
  BUS: Bus,
  UBOX: Package,
  '平板车': Container,
  '集卡': Truck,
};

/* 计算项目进度百分比 */
function getProgress(project: Project): number {
  if (project.status === '已结束' || project.status === '已归档') return 100;
  if (project.status === '未开始') return 0;
  if (!project.startDate || !project.endDate) return 30;
  const start = new Date(project.startDate).getTime();
  const end = new Date(project.endDate).getTime();
  const now = Date.now();
  if (end <= start) return 50;
  const pct = Math.round(((now - start) / (end - start)) * 100);
  return Math.max(0, Math.min(100, pct));
}

/* 统计摘要栏 */
const StatsBar: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === '进行中').length;
    const completed = projects.filter(p => p.status === '已结束').length;
    const delayed = projects.filter(p => p.status === '延期').length;
    const types = new Set(projects.map(p => p.type)).size;
    return { total, active, completed, delayed, types };
  }, [projects]);

  const items = [
    { label: '项目总数', value: stats.total, icon: FolderOpen, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent-light)]' },
    { label: '进行中', value: stats.active, icon: TrendingUp, color: 'text-space-blue', bg: 'bg-space-blue/10' },
    { label: '已完成', value: stats.completed, icon: CheckCircle2, color: 'text-space-green', bg: 'bg-space-green/10' },
    { label: '延期项目', value: stats.delayed, icon: AlertTriangle, color: 'text-space-yellow', bg: 'bg-space-yellow/10' },
    { label: '车型类别', value: stats.types, icon: BarChart3, color: 'text-space-coral', bg: 'bg-space-coral/10' },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-5 gap-3 mb-6"
    >
      {items.map(({ label, value, icon: Icon, color, bg }) => (
        <motion.div
          key={label}
          variants={staggerItem}
          className="liquid-glass-card p-4 rounded-xl flex items-center gap-3"
        >
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} className={color} />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text-primary)] leading-none">{value}</div>
            <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{label}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

/* Liquid Glass 项目卡片 — 增强版 */
const KanbanCard: React.FC<{ project: Project }> = ({ project }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const typeStyle = TYPE_COLORS[project.type] || TYPE_COLORS.AET;
  const TypeIcon = TYPE_ICONS[project.type] || Car;
  const StatusIcon = STATUS_ICONS[project.status] || Circle;
  const statusStyle = STATUS_STYLES[project.status] || STATUS_STYLES['未开始'];
  const progress = getProgress(project);

  return (
    <motion.div
      variants={staggerItem}
      whileHover={isDark ? cardHoverDark.hover : cardHover.hover}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/project/${project.id}`)}
      className="liquid-glass-card group p-3.5 rounded-arc cursor-pointer"
    >
      {/* 头部：类型图标 + 项目名 + 状态 */}
      <div className="flex items-start gap-2.5 mb-2.5 relative z-10">
        <div className={`w-8 h-8 rounded-lg ${typeStyle.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <TypeIcon size={15} className={typeStyle.icon} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--text-primary)] text-sm leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2">
            {project.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${typeStyle.bg} ${typeStyle.text}`}>
              {project.type}
            </span>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
              <StatusIcon size={10} />
              {project.status}
            </span>
          </div>
        </div>
      </div>

      {/* 描述 */}
      {project.description && (
        <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed mb-2.5 line-clamp-2 relative z-10">
          {project.description}
        </p>
      )}

      {/* 进度条 */}
      <div className="mb-2.5 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[var(--text-tertiary)]">项目进度</span>
          <span className="text-[10px] font-semibold text-[var(--accent)]">{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--border-color)] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: progress >= 100
                ? 'linear-gradient(90deg, #34D399, #10B981)'
                : project.status === '延期'
                  ? 'linear-gradient(90deg, #FBBF24, #F59E0B)'
                  : 'linear-gradient(90deg, #C199E0, #A87BC7)',
            }}
          />
        </div>
      </div>

      {/* 底部信息 */}
      <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-[var(--glass-bg)] px-1.5 py-0.5 rounded-md">
            <User size={10} className="text-[var(--text-tertiary)]" />
            <span className="truncate max-w-[56px]">{project.owner || '未指派'}</span>
          </div>
          {project.department && (
            <div className="flex items-center gap-1 bg-[var(--glass-bg)] px-1.5 py-0.5 rounded-md">
              <Users size={10} className="text-[var(--text-tertiary)]" />
              <span className="truncate max-w-[68px]">{project.department}</span>
            </div>
          )}
        </div>
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-1 bg-[var(--glass-bg)] px-1.5 py-0.5 rounded-md">
            <Calendar size={10} className="text-[var(--text-tertiary)]" />
            <span className="truncate">{project.startDate ? project.startDate.slice(5) : '—'}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* Liquid Glass 看板列 — 增强版 */
const KanbanColumn: React.FC<{ status: ProjectStatus; projects: Project[] }> = ({ status, projects }) => {
  const StatusIcon = STATUS_ICONS[status] || Circle;
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES['未开始'];

  return (
    <motion.div
      variants={kanbanColumnStagger}
      className="w-[280px] flex-shrink-0 flex flex-col"
    >
      {/* 列标题 */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-7 h-7 rounded-lg ${statusStyle.bg} flex items-center justify-center`}>
          <StatusIcon size={14} className={statusStyle.icon} />
        </div>
        <h2 className="font-semibold text-[var(--text-primary)] text-sm">{status}</h2>
        <span className={`ml-auto inline-flex items-center justify-center min-w-[1.25rem] px-1 py-0.5 rounded-lg text-[10px] font-bold ${statusStyle.bg} ${statusStyle.text}`}>
          {projects.length}
        </span>
      </div>

      {/* 卡片列表 */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-2.5"
      >
        {projects.length === 0 ? (
          <div className="liquid-glass-subtle flex flex-col items-center justify-center py-8 text-[var(--text-tertiary)] border border-dashed border-[var(--border-color)] rounded-arc">
            <Inbox size={20} className="mb-1.5 opacity-40" />
            <span className="text-[11px]">暂无项目</span>
          </div>
        ) : (
          projects.map((project) => (
            <KanbanCard key={project.id} project={project} />
          ))
        )}
      </motion.div>
    </motion.div>
  );
};

/* 看板容器 */
export const KanbanBoard: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const grouped = useMemo(() => {
    const map = new Map<ProjectStatus, Project[]>();
    STATUS_ORDER.forEach((s) => map.set(s, []));
    projects.forEach((p) => {
      const list = map.get(p.status);
      if (list) list.push(p);
    });
    return map;
  }, [projects]);

  return (
    <div>
      {/* 统计摘要 */}
      <StatsBar projects={projects} />

      {/* 看板列 */}
      <div className="overflow-x-auto pb-4">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex gap-4 min-w-max"
        >
          {STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              projects={grouped.get(status) || []}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
