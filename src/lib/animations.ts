import { Variants } from 'framer-motion';

/** ===== Liquid Glass 动画系统 ===== */

/** 通用淡入 — 液态柔和 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** 从下方液态滑入 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

/** 从上方滑入（Header等） */
export const slideDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

/** 缩放弹入 — Liquid Glass 弹簧（更柔和的弹性） */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28, mass: 1 },
  },
  exit: { opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.15, ease: 'easeIn' } },
};

/** 遮罩层淡入淡出 */
export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/** 列表容器 — stagger 子元素 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.06 },
  },
};

/** 列表子项 — 液态玻璃入场 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.12 } },
};

/** 看板列 stagger */
export const kanbanColumnStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

/** Liquid Glass 卡片 hover — 液态浮起 */
export const cardHover = {
  rest: { y: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.80)' },
  hover: {
    y: -3,
    boxShadow: '0 16px 48px rgba(0,0,0,0.10), inset 0 1px 1px rgba(255,255,255,0.90)',
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
  tap: { scale: 0.98, transition: { duration: 0.08 } },
};

export const cardHoverDark = {
  rest: { y: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.50), inset 0 1px 1px rgba(255,255,255,0.10)' },
  hover: {
    y: -3,
    boxShadow: '0 16px 48px rgba(0,0,0,0.60), inset 0 1px 1px rgba(255,255,255,0.12)',
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
  tap: { scale: 0.98, transition: { duration: 0.08 } },
};

/** 模块切换 — 液态滑动 */
export const moduleSwitch: Variants = {
  hidden: { opacity: 0, x: 10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.15 } },
};

/** Command Palette 项目 stagger */
export const commandItemStagger: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, x: 8, transition: { duration: 0.1 } },
};

/** Sidebar 项目列表 stagger */
export const sidebarItemStagger: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.12 } },
};

/** Liquid Glass 按钮微交互 */
export const glassButtonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2, ease: 'easeOut' as const } },
  tap: { scale: 0.97, transition: { duration: 0.08 } },
};

/** Liquid Glass 折叠/展开 — 柔性弹簧 */
export const glassSpringTransition = {
  duration: 0.4,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};
