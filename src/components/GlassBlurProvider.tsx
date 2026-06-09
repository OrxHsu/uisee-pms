import { useEffect } from 'react';
import { initGlassBlur, destroyGlassBlur } from '@/lib/glassBlur';

/**
 * GlassBlurProvider — 液态玻璃模糊引擎提供者
 *
 * 在 App 根组件中使用一次即可。
 * 自动为所有 .liquid-glass / .liquid-glass-strong / .liquid-glass-subtle / .liquid-glass-card
 * 元素应用预渲染模糊背景，替代 CSS backdrop-filter 实现 60FPS。
 */
export function GlassBlurProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 微任务延迟初始化，确保 DOM 已挂载
    const timer = requestAnimationFrame(() => {
      initGlassBlur();
    });
    return () => {
      cancelAnimationFrame(timer);
      destroyGlassBlur();
    };
  }, []);

  return <>{children}</>;
}
