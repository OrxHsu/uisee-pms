import React from 'react'
import { motion } from 'framer-motion'
import { useProjectStore } from '@/stores/projectStore'
import { KanbanBoard } from '@/components/modules/kanban/KanbanBoard'
import { staggerContainer, staggerItem } from '@/lib/animations'

const HomePage = () => {
  const { projects } = useProjectStore()

  return (
    <div className="p-6 min-h-full flex flex-col">
      {/* 标题区 — Liquid Glass 风格 */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="pb-5 pt-6"
      >
        <motion.div variants={staggerItem} className="flex items-baseline gap-3">
          <h1 className="text-6xl font-artistic font-bold text-[var(--text-primary)] tracking-tight">
            UPMS
          </h1>
          <span className="text-2xl font-artistic italic text-[var(--text-tertiary)] tracking-wide">
            UISEE Project Management System
          </span>
        </motion.div>
        <motion.div variants={staggerItem} className="mt-3 flex items-center gap-4">
          <div className="w-1 h-8 bg-[var(--accent)] rounded-full" />
          <p className="text-3xl text-[var(--text-secondary)] font-artistic tracking-widest">
            完成，胜过完美
          </p>
        </motion.div>
      </motion.div>

      {/* 分割线 — 液态渐变展开 */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
        className="h-px bg-gradient-to-r from-[var(--accent)]/50 via-[var(--accent)]/20 to-transparent origin-left"
      />

      {/* Kanban 看板 */}
      <div className="flex-1 pt-6">
        <KanbanBoard projects={projects} />
      </div>
    </div>
  )
}

export default HomePage
