import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Search,
  FolderOpen,
} from 'lucide-react';
import { LiquidSelect } from '@/components/common/LiquidSelect';
import { LiquidDatePicker } from '@/components/common/LiquidDatePicker';
import { BaseModal } from '@/components/common/BaseModal';
import { useProjectStore, useSettingsStore } from '@/stores/projectStore';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/helpers';
import { PROJECT_STATUS_COLORS, ProjectType, ProjectStatus } from '@/constants/modules';
import { useLanguage } from '@/hooks/useLanguage';
import { staggerContainer, staggerItem, sidebarItemStagger, glassSpringTransition } from '@/lib/animations';

/* Spaces 分色 */
const SPACE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  AET: { bg: 'bg-space-coral/10', text: 'text-space-coral', dot: 'bg-space-coral' },
  BUS: { bg: 'bg-space-blue/10', text: 'text-space-blue', dot: 'bg-space-blue' },
  UBOX: { bg: 'bg-space-purple/10', text: 'text-space-purple', dot: 'bg-space-purple' },
  '平板车': { bg: 'bg-space-orange/10', text: 'text-space-orange', dot: 'bg-space-orange' },
  '集卡': { bg: 'bg-space-green/10', text: 'text-space-green', dot: 'bg-space-green' },
};

/* 获取项目名首字母（支持中英文） */
function getInitial(name: string): string {
  if (!name) return '?';
  const first = name.charAt(0);
  return first.toUpperCase();
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { projects, currentProject, setCurrentProject, deleteProject, updateProject } = useProjectStore();
  const { sidebarCollapsed, toggleSidebar } = useSettingsStore();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    type: ProjectType;
    description: string;
    status: ProjectStatus;
    owner: string;
    department: string;
    startDate: string;
    endDate: string;
  }>({
    name: '',
    type: 'AET',
    description: '',
    status: '未开始',
    owner: '',
    department: '综合一部',
    startDate: '',
    endDate: ''
  });

  const handleProjectClick = (project: any) => {
    setCurrentProject(project);
    navigate(`/project/${project.id}`);
  };

  const handleDeleteProject = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteProject(deleteTarget.id);
      if (currentProject?.id === deleteTarget.id) {
        setCurrentProject(null);
        navigate('/');
      }
      setDeleteTarget(null);
    }
  };

  const handleEditClick = (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    setEditFormData({
      name: project.name,
      type: project.type,
      description: project.description,
      status: project.status,
      owner: project.owner || '',
      department: project.department || '综合一部',
      startDate: project.startDate || '',
      endDate: project.endDate || ''
    });
    setShowEditModal(project.id);
  };

  const handleEditSubmit = (data: any) => {
    if (showEditModal) {
      updateProject(showEditModal, data);
      setShowEditModal(null);
    }
  };

  const filteredProjects = projects.filter((p) =>
    searchQuery.trim() === '' ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      className="relative h-full flex shrink-0 z-20 p-2"
      animate={{ width: sidebarCollapsed ? 72 : 276 }}
      transition={glassSpringTransition}
    >
      <div
        className="h-full flex flex-col liquid-glass-subtle overflow-hidden rounded-2xl w-full"
      >
        {/* Logo — 抠图透明PNG，沉浸式融入玻璃背景 */}
        <div className="pt-8 pb-3 flex items-center justify-center relative shrink-0">
          {sidebarCollapsed ? (
            <img src={import.meta.env.DEV ? '/logoblue.png' : './logoblue.png'} alt="Logo" className="h-10 w-auto object-contain" />
          ) : (
            <img src={import.meta.env.DEV ? '/logoblue.png' : './logoblue.png'} alt="Logo" className="h-16 w-auto object-contain" />
          )}
        </div>

      {/* 项目列表区 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        {!sidebarCollapsed ? (
          <>
            <div className="px-3 pt-12 pb-4">
              {/* 新建项目按钮 — Liquid Glass */}
              <motion.button
                onClick={() => setShowAddModal(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl text-sm font-medium transition-colors shadow-glass-sm"
              >
                <Plus size={15} />
                <span>{t.sidebar.newProject}</span>
              </motion.button>

              {/* 搜索框 — Liquid Glass */}
              <div className="relative mt-6">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={14} />
                <input
                  type="text"
                  placeholder="搜索项目..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={cn(
                    'liquid-glass-input w-full pl-8 pr-3 py-1.5 rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
                    isSearchFocused
                      ? 'border-[#C199E0] ring-2 ring-[#C199E0]/20'
                      : 'hover:border-[var(--border-strong)]'
                  )}
                />
              </div>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="px-3 pt-8 space-y-2"
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isActive={currentProject?.id === project.id}
                  onClick={() => handleProjectClick(project)}
                  onEdit={(e) => handleEditClick(e, project)}
                  onDelete={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id, project.name);
                  }}
                />
              ))}

              {projects.length === 0 && (
                <div className="text-center text-[var(--text-tertiary)] py-8 text-sm">
                  {t.sidebar.noProjects}
                </div>
              )}
              {projects.length > 0 && searchQuery.trim() !== '' && filteredProjects.length === 0 && (
                <div className="text-center text-[var(--text-tertiary)] py-8 text-sm">
                  未找到匹配的项目
                </div>
              )}
            </motion.div>
          </>
        ) : (
          /* ===== 折叠模式：图标 + 首字母 ===== */
          <div className="px-2 pt-12 flex flex-col items-center gap-2">
            {/* + 新建按钮 */}
            <button
              onClick={() => setShowAddModal(true)}
              className="w-10 h-8 flex items-center justify-center bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl transition-colors shadow-glass-sm cursor-pointer"
            >
              <Plus size={16} />
            </button>

            {/* 🔍 搜索按钮 */}
            <button
              onClick={() => { useSettingsStore.getState().toggleSidebar(); }}
              className="w-10 h-8 flex items-center justify-center liquid-glass-btn rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="搜索项目"
            >
              <Search size={15} />
            </button>

            {/* 分隔线 */}
            <div className="w-6 h-px bg-[var(--border-strong)] my-1" />

            {/* 项目首字母列表 */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              {filteredProjects.map((project) => {
                const spaceColor = SPACE_COLORS[project.type] || SPACE_COLORS.AET;
                const isActive = currentProject?.id === project.id;
                return (
                  <button
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold transition-all cursor-pointer relative group',
                      isActive
                        ? cn(spaceColor.bg, spaceColor.text, 'ring-2 ring-[#C199E0]/30')
                        : cn('bg-[var(--bg-surface)]/60 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]')
                    )}
                    title={project.name}
                  >
                    {getInitial(project.name)}
                    {/* 悬浮提示 — 项目名 */}
                    <span className="absolute left-full ml-2 px-2 py-1 rounded-lg liquid-glass-strong text-xs text-[var(--text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-glass-sm">
                      {project.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 版本号 */}
      <div className="px-3 py-2 flex flex-col items-center justify-center shrink-0 gap-0.5">
        {!sidebarCollapsed && (
          <>
            <span className="text-xs text-[#F4B6DB] tracking-wide">UPMS Demo V0.0.13</span>
            <span className="text-[11px] text-[#F4B6DB] tracking-wide">Product By Xgh</span>
          </>
        )}
      </div>
    </div>

    {/* 模态框 — 放在 sidebar div 外部避免 overflow-hidden 裁剪 */}
    <AnimatePresence>
      {showAddModal && <AddProjectModal onClose={() => setShowAddModal(false)} />}
    </AnimatePresence>
    <AnimatePresence>
      {showEditModal && (
        <EditProjectModal
          projectId={showEditModal}
          initialData={editFormData}
          onSubmit={handleEditSubmit}
          onClose={() => setShowEditModal(null)}
        />
      )}
    </AnimatePresence>

    {/* 删除确认弹窗 — Liquid Glass 风格 */}
    {deleteTarget && (
      <BaseModal isOpen={true} onClose={() => setDeleteTarget(null)} title="确认删除" size="sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              确定要删除项目「{deleteTarget.name}」吗？此操作无法撤销。
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDeleteTarget(null)}
            className="liquid-glass-btn flex-1 px-4 py-2 rounded-xl text-sm text-[var(--text-primary)] transition-transform active:scale-[0.98] cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={confirmDelete}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors active:scale-[0.98] cursor-pointer"
          >
            删除
          </button>
        </div>
      </BaseModal>
    )}

    {/* 折叠按钮 — 使用 motion.button 避免 CSS active transform 与 translateY 冲突 */}
    <motion.button
      onClick={toggleSidebar}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9, rotate: sidebarCollapsed ? 90 : -90 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        "absolute -right-3 top-1/2 -translate-y-1/2 z-50 w-6 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer",
        "bg-[var(--bg-elevated)] border border-[var(--glass-border)] shadow-[var(--glass-inner-glow),0_2px_8px_rgba(0,0,0,0.04)]",
        "hover:bg-[var(--bg-surface)] hover:shadow-[var(--glass-inner-glow),0_4px_16px_rgba(0,0,0,0.08)]",
        "transition-colors duration-200",
        (showAddModal || showEditModal || deleteTarget) && "opacity-0 pointer-events-none scale-90"
      )}
    >
      {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
    </motion.button>
  </motion.div>
  );
};

/* Liquid Glass 项目卡片 */
const ProjectCard: React.FC<{
  project: any;
  isActive: boolean;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}> = ({ project, isActive, onClick, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const spaceColor = SPACE_COLORS[project.type] || { bg: 'bg-space-coral/10', text: 'text-space-coral', dot: 'bg-space-coral' };

  return (
    <motion.div
      variants={sidebarItemStagger}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all',
        isActive
          ? 'liquid-glass bg-[#C199E0]/10'
          : 'hover:bg-[var(--bg-surface)]/40'
      )}
    >
      {/* 左侧指示条 */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-[#C199E0]"
          transition={{ type: 'tween', duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      )}

      {/* 项目图标 */}
      <div className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
        spaceColor.bg
      )}>
        <FolderOpen size={14} className={spaceColor.text} />
      </div>

      {/* 项目信息 */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          'text-sm truncate font-medium',
          isActive ? 'text-[#C199E0]' : 'text-[var(--text-primary)]'
        )}>
          {project.name}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn('text-[10px] font-medium', spaceColor.text)}>{project.type}</span>
          <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
          <span className="text-[10px] text-[var(--text-secondary)]">{project.status}</span>
        </div>
      </div>

      {/* 操作按钮 */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.12 }}
            className="flex items-center gap-0.5 flex-shrink-0"
          >
            <button
              onClick={onEdit}
              className="liquid-glass-btn p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={onDelete}
              className="liquid-glass-btn p-1 text-[var(--text-secondary)] hover:text-space-coral hover:bg-space-coral/10 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* 添加项目模态框 */
const AddProjectModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addProject } = useProjectStore();
  const { t } = useLanguage();

  const today = useMemo(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    type: 'AET' as ProjectType,
    description: '',
    status: '未开始' as ProjectStatus,
    owner: '',
    department: '综合一部',
    startDate: today,
    endDate: today
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入项目名称');
      return;
    }
    addProject(formData);
    onClose();
  };

  return (
    <BaseModal isOpen={true} onClose={onClose} title={t.modal.newProject} size="md">
      <ProjectForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} onCancel={onClose} submitLabel={t.modal.create} />
    </BaseModal>
  );
};

/* 编辑项目模态框 */
const EditProjectModal: React.FC<{
  projectId: string;
  initialData: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState(initialData);
  const { t } = useLanguage();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入项目名称');
      return;
    }
    onSubmit(formData);
  };

  return (
    <BaseModal isOpen={true} onClose={onClose} title={t.modal.editProject} size="md">
      <ProjectForm formData={formData} setFormData={setFormData} onSubmit={handleFormSubmit} onCancel={onClose} submitLabel={t.modal.save} />
    </BaseModal>
  );
};

/* 项目表单 */
const ProjectForm: React.FC<{
  formData: any;
  setFormData: (d: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel: string;
}> = ({ formData, setFormData, onSubmit, onCancel, submitLabel }) => {
  const { t } = useLanguage();

  const inputClass = "liquid-glass-input w-full px-3 py-2 rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">{t.modal.projectName}</label>
        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">{t.modal.projectType}</label>
          <LiquidSelect
            value={formData.type}
            onChange={(v) => setFormData({ ...formData, type: v as ProjectType })}
            options={[
              { value: 'AET', label: 'AET' },
              { value: 'BUS', label: 'BUS' },
              { value: 'UBOX', label: 'UBOX' },
              { value: '平板车', label: '平板车' },
              { value: '集卡', label: '集卡' },
              { value: 'E70', label: 'E70' },
              { value: '轻卡', label: '轻卡' },
              { value: '长城P3E', label: '长城P3E' },
            ]}
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">{t.modal.projectStatus}</label>
          <LiquidSelect
            value={formData.status}
            onChange={(v) => setFormData({ ...formData, status: v as ProjectStatus })}
            options={[
              { value: '未开始', label: '未开始' },
              { value: '进行中', label: '进行中' },
              { value: '已结束', label: '已结束' },
              { value: '已延期', label: '已延期' },
              { value: '已归档', label: '已归档' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">{t.modal.projectOwner}</label>
          <input type="text" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">{t.modal.deliveryDepartment}</label>
          <LiquidSelect
            value={formData.department}
            onChange={(v) => setFormData({ ...formData, department: v })}
            options={[
              { value: '综合一部', label: '综合一部' },
              { value: '综合二部', label: '综合二部' },
              { value: '综合三部', label: '综合三部' },
              { value: '交付中台', label: '交付中台' },
              { value: '运维中台', label: '运维中台' },
              { value: '集成路测', label: '集成路测' },
              { value: 'BUS路测', label: 'BUS路测' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">{t.modal.startDate}</label>
          <LiquidDatePicker value={formData.startDate} onChange={(v) => setFormData({ ...formData, startDate: v })} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">{t.modal.endDate}</label>
          <LiquidDatePicker value={formData.endDate} onChange={(v) => setFormData({ ...formData, endDate: v })} disabled={['未开始', '进行中', '已延期'].includes(formData.status)} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1 text-[var(--text-secondary)]">{t.modal.projectInfo}</label>
        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClass} rows={2} />
      </div>

      <div className="flex gap-2 pt-3">
        <button type="button" onClick={onCancel} className="liquid-glass-btn flex-1 px-4 py-2 rounded-xl text-sm text-[var(--text-primary)] transition-transform active:scale-[0.98] cursor-pointer">
          {t.modal.cancel}
        </button>
        <button type="submit" className="flex-1 px-4 py-2 bg-[#C199E0] hover:bg-[#A87BC7] text-white rounded-xl text-sm font-medium transition-colors shadow-glass-sm active:scale-[0.98] cursor-pointer">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default Sidebar;
