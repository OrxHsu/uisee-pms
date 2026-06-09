import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Briefcase, ChevronRight } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { PreDepartureModule } from '@/components/modules/pre-departure/PreDepartureModule'
import { VehicleArrivalModule } from '@/components/modules/vehicle-arrival/VehicleArrivalModule'
import { DeploymentAlignmentModule } from '@/components/modules/deployment-alignment/DeploymentAlignmentModule'
import { DataManagementModule } from '@/components/modules/data-management/DataManagementModule'
import { DeploymentManagementModule } from '@/components/modules/deployment-management/DeploymentManagementModule'
import { TestManagementModule } from '@/components/modules/test-management/TestManagementModule'
import { TrainingManagementModule } from '@/components/modules/training-management/TrainingManagementModule'
import { DocumentManagementModule } from '@/components/modules/document-management/DocumentManagementModule'
import { ProjectClosureModule } from '@/components/modules/project-closure/ProjectClosureModule'
import { useLanguage } from '@/hooks/useLanguage'
import { moduleSwitch } from '@/lib/animations'

/* Spaces 分色 */
const MODULE_COLORS: Record<string, { dot: string; active: string }> = {
  'pre-departure': { dot: 'bg-space-coral', active: 'bg-space-coral' },
  'vehicle-arrival': { dot: 'bg-space-blue', active: 'bg-space-blue' },
  'deployment-alignment': { dot: 'bg-space-purple', active: 'bg-space-purple' },
  'data-management': { dot: 'bg-space-green', active: 'bg-space-green' },
  'deployment-management': { dot: 'bg-space-orange', active: 'bg-space-orange' },
  'test-management': { dot: 'bg-space-teal', active: 'bg-space-teal' },
  'training-management': { dot: 'bg-space-pink', active: 'bg-space-pink' },
  'document-management': { dot: 'bg-space-indigo', active: 'bg-space-indigo' },
  'project-closure': { dot: 'bg-space-yellow', active: 'bg-space-yellow' },
}

const ProjectDetailPage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { projects, currentProject, setCurrentProject } = useProjectStore()
  const { t } = useLanguage()
  const [active, setActive] = useState('pre-departure')

  useEffect(() => {
    if (projectId) {
      const project = projects.find((p) => p.id === projectId)
      if (project) {
        setCurrentProject(project)
      } else {
        navigate('/')
      }
    }
  }, [projectId, projects])

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm"
        >
          加载中...
        </motion.div>
      </div>
    )
  }

  const modules = [
    { id: 'pre-departure', label: '发车检查' },
    { id: 'vehicle-arrival', label: '车辆到场' },
    { id: 'deployment-alignment', label: '部署对齐' },
    { id: 'data-management', label: '数据管理' },
    { id: 'deployment-management', label: '部署管理' },
    { id: 'test-management', label: '测试管理' },
    { id: 'training-management', label: '培训管理' },
    { id: 'document-management', label: '文档管理' },
    { id: 'project-closure', label: '项目收尾' },
  ]

  const renderModule = () => {
    switch (active) {
      case 'pre-departure':
        return <PreDepartureModule projectId={projectId!} />
      case 'vehicle-arrival':
        return <VehicleArrivalModule projectId={projectId!} />
      case 'deployment-alignment':
        return <DeploymentAlignmentModule projectId={projectId!} />
      case 'data-management':
        return <DataManagementModule projectId={projectId!} />
      case 'deployment-management':
        return <DeploymentManagementModule projectId={projectId!} />
      case 'test-management':
        return <TestManagementModule projectId={projectId!} />
      case 'training-management':
        return <TrainingManagementModule projectId={projectId!} />
      case 'document-management':
        return <DocumentManagementModule projectId={projectId!} />
      case 'project-closure':
        return <ProjectClosureModule projectId={projectId!} />
      default:
        return (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="liquid-glass w-12 h-12 rounded-arc flex items-center justify-center mb-4">
              <Briefcase size={20} className="text-[var(--text-tertiary)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              {modules.find((m) => m.id === active)?.label}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">该模块正在开发中</p>
          </div>
        )
    }
  }

  return (
    <div className="flex h-full gap-3 p-3">
      {/* 左侧导航面板 — Liquid Glass */}
      <div className="w-[220px] shrink-0 flex flex-col gap-3">
        {/* 返回按钮 */}
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="liquid-glass-btn flex items-center gap-2 px-3 py-2 text-[var(--text-primary)] rounded-arc text-sm transition-colors"
        >
          <ArrowLeft size={15} />
          <span className="font-medium">返回首页</span>
        </motion.button>

        {/* 项目信息卡片 */}
        <div className="liquid-glass p-4 rounded-arc">
          <div className="flex items-center gap-2 mb-2.5 relative z-10">
            <div className="w-7 h-7 rounded-lg bg-space-coral/10 flex items-center justify-center">
              <Briefcase size={14} className="text-space-coral" />
            </div>
            <h2 className="font-semibold text-sm text-[var(--text-primary)] leading-tight line-clamp-1">{currentProject.name}</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap relative z-10">
            <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-semibold bg-space-coral/10 text-space-coral">
              {currentProject.type}
            </span>
            <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-semibold ${
              currentProject.status === '进行中'
                ? 'bg-space-blue/10 text-space-blue'
                : currentProject.status === '已结束'
                ? 'bg-space-green/10 text-space-green'
                : currentProject.status === '延期'
                ? 'bg-space-yellow/10 text-space-yellow'
                : currentProject.status === '已归档'
                ? 'bg-space-purple/10 text-space-purple'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
            }`}>
              {currentProject.status}
            </span>
          </div>
        </div>

        {/* 模块菜单 — Liquid Glass */}
        <div className="liquid-glass flex-1 rounded-arc p-2 overflow-y-auto">
          <div className="space-y-0.5">
            {modules.map((m) => {
              const colors = MODULE_COLORS[m.id] || MODULE_COLORS['pre-departure']
              const isActive = active === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setActive(m.id)}
                  className={`w-full flex items-center gap-2.5 py-1.5 px-2.5 text-left rounded-xl transition-all relative group ${
                    isActive
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/30'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="module-active-bg"
                      className="absolute inset-0 rounded-xl bg-[var(--bg-elevated)] border border-[var(--glass-border)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <div className={`relative z-10 w-1.5 h-1.5 rounded-full ${colors.dot} ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`} />
                  <span className="relative z-10 text-sm">{m.label}</span>
                  {isActive && (
                    <ChevronRight size={14} className="relative z-10 ml-auto text-[var(--text-tertiary)]" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 右侧内容区 — Liquid Glass */}
      <div className="liquid-glass flex-1 overflow-auto rounded-arc p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            variants={moduleSwitch}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10"
          >
            {renderModule()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ProjectDetailPage
