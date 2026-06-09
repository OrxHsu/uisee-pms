/**
 * Glass Blur Engine — 高性能液态玻璃模糊系统
 *
 * 用 Canvas 2D + GPU 加速 blur 预渲染替代 CSS backdrop-filter，
 * 在集显环境下实现 60FPS 流畅动效。
 *
 * 原理：将背景场景（基色 + 环境光晕）渲染到离屏 Canvas，
 * 应用 ctx.filter blur（Chromium 内部 GPU 加速），
 * 转为 DataURL 后作为各 glass 元素的 CSS background-image。
 * 通过 MutationObserver + scroll/resize 监听自动追踪位置。
 */

// ========== 配置常量 ==========
const GLASS_CLASS_PATTERN = /liquid-glass(?!-btn|-input)/;
const BLUR_SCALE = 0.5; // 半分辨率渲染，性能翻倍
const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

// ========== 模块状态 ==========
let _blurUrl: string | null = null;
let _initialized = false;
let _observers: Array<{ disconnect(): void }> = [];
let _scrollHandler: (() => void) | null = null;
let _resizeHandler: (() => void) | null = null;
let _rafId: number | null = null;
let _allGlassElements = new Set<Element>();

// ========== 主题检测 ==========
function getTheme(): 'light' | 'dark' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function getThemeConfig(theme: 'light' | 'dark') {
  return theme === 'dark'
    ? {
        baseColor: '#0A0A12',
        glows: [
          { x: 0.85, y: -0.15, r: 700, color: 'rgba(193,153,224,0.18)', opacity: 0.2 },
          { x: -0.15, y: 1.2, r: 600, color: 'rgba(10,132,255,0.12)', opacity: 0.15 },
          { x: 0.5, y: 0.33, r: 500, color: 'rgba(191,90,242,0.08)', opacity: 0.08 },
        ],
        blur: 24,
      }
    : {
        baseColor: '#EEF0F5',
        glows: [
          { x: 0.85, y: -0.15, r: 700, color: 'rgba(193,153,224,0.25)', opacity: 0.3 },
          { x: -0.15, y: 1.2, r: 600, color: 'rgba(10,132,255,0.20)', opacity: 0.25 },
          { x: 0.5, y: 0.33, r: 500, color: 'rgba(191,90,242,0.15)', opacity: 0.1 },
        ],
        blur: 20,
      };
}

// ========== 模糊画布生成 ==========
function generateBlurUrl(): string {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const cw = Math.ceil(w * BLUR_SCALE);
  const ch = Math.ceil(h * BLUR_SCALE);

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const theme = getTheme();
  const config = getThemeConfig(theme);

  // 1. 绘制基色
  ctx.fillStyle = config.baseColor;
  ctx.fillRect(0, 0, cw, ch);

  // 2. 绘制环境光晕
  for (const glow of config.glows) {
    const cx = glow.x * cw;
    const cy = glow.y * ch;
    const r = glow.r * BLUR_SCALE;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, glow.color);
    grad.addColorStop(0.4, glow.color.replace(/[\d.]+\)$/, `${parseFloat(glow.color.match(/[\d.]+\)$/)?.[0] || '0.1') * 0.3})`));
    grad.addColorStop(1, 'transparent');
    ctx.globalAlpha = glow.opacity;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);
  }
  ctx.globalAlpha = 1;

  // 3. GPU 加速高斯模糊（Chromium 内部走 GPU 合成）
  ctx.filter = `blur(${Math.round(config.blur * BLUR_SCALE)}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';

  return canvas.toDataURL('image/png');
}

// ========== 元素位置追踪 ==========
function updateElementPosition(el: Element) {
  if (!(el instanceof HTMLElement)) return;
  const rect = el.getBoundingClientRect();
  const bgX = -rect.left;
  const bgY = -rect.top;
  el.style.backgroundPosition = `${bgX}px ${bgY}px`;
  el.style.backgroundSize = `${window.innerWidth}px ${window.innerHeight}px`;
}

function updateAllPositions() {
  _allGlassElements.forEach(updateElementPosition);
}

function scheduleUpdate() {
  if (_rafId) return;
  _rafId = requestAnimationFrame(() => {
    _rafId = null;
    updateAllPositions();
  });
}

// ========== 扫描 DOM 中的 glass 元素 ==========
function scanGlassElements() {
  const elements = document.querySelectorAll('[class*="liquid-glass"]');
  elements.forEach((el) => {
    if (el instanceof HTMLElement && GLASS_CLASS_PATTERN.test(el.className) && !_allGlassElements.has(el)) {
      _allGlassElements.add(el);
      applyGlassBackground(el);
    }
  });
}

function applyGlassBackground(el: Element) {
  if (!(el instanceof HTMLElement) || !_blurUrl) return;
  el.style.backgroundImage = `url(${_blurUrl})`;
  el.style.backgroundAttachment = 'scroll';
  el.style.backgroundRepeat = 'no-repeat';
  updateElementPosition(el);
}

// ========== 初始化 & 销毁 ==========
export function initGlassBlur() {
  if (_initialized) return;
  _initialized = true;

  // 生成模糊背景
  _blurUrl = generateBlurUrl();

  // 扫描并应用
  scanGlassElements();

  // --- MutationObserver：自动追踪 DOM 变化 ---
  const mutationObserver = new MutationObserver((mutations) => {
    let hasNewElements = false;
    for (const mutation of mutations) {
      // 新增节点
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (GLASS_CLASS_PATTERN.test(node.className)) {
            _allGlassElements.add(node);
            applyGlassBackground(node);
            hasNewElements = true;
          }
          // 检查子节点
          node.querySelectorAll?.('[class*="liquid-glass"]').forEach((child) => {
            if (child instanceof HTMLElement && GLASS_CLASS_PATTERN.test(child.className) && !_allGlassElements.has(child)) {
              _allGlassElements.add(child);
              applyGlassBackground(child);
              hasNewElements = true;
            }
          });
        }
      });
      // 移除节点
      mutation.removedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          _allGlassElements.delete(node);
          node.querySelectorAll?.('[class*="liquid-glass"]').forEach((child) => {
            _allGlassElements.delete(child);
          });
        }
      });
      // class 变化
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class' &&
        mutation.target instanceof HTMLElement
      ) {
        const el = mutation.target;
        if (GLASS_CLASS_PATTERN.test(el.className) && !_allGlassElements.has(el)) {
          _allGlassElements.add(el);
          applyGlassBackground(el);
          hasNewElements = true;
        } else if (!GLASS_CLASS_PATTERN.test(el.className) && _allGlassElements.has(el)) {
          _allGlassElements.delete(el);
          el.style.backgroundImage = '';
          el.style.backgroundPosition = '';
          el.style.backgroundSize = '';
          el.style.backgroundAttachment = '';
          el.style.backgroundRepeat = '';
        }
      }
    }
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
  _observers.push(mutationObserver);

  // --- scroll 监听（RAF 节流）---
  _scrollHandler = () => scheduleUpdate();
  document.addEventListener('scroll', _scrollHandler, { passive: true, capture: true });

  // --- resize 监听 ---
  _resizeHandler = () => {
    // 重新生成模糊画布
    _blurUrl = generateBlurUrl();
    _allGlassElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.backgroundImage = `url(${_blurUrl})`;
      }
    });
    scheduleUpdate();
  };
  window.addEventListener('resize', _resizeHandler, { passive: true });

  // --- 主题变化监听 ---
  const themeObserver = new MutationObserver(() => {
    _blurUrl = generateBlurUrl();
    _allGlassElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.backgroundImage = `url(${_blurUrl})`;
      }
    });
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  _observers.push(themeObserver);
}

export function destroyGlassBlur() {
  _initialized = false;
  _observers.forEach((o) => o.disconnect());
  _observers = [];
  if (_scrollHandler) {
    document.removeEventListener('scroll', _scrollHandler, { capture: true });
    _scrollHandler = null;
  }
  if (_resizeHandler) {
    window.removeEventListener('resize', _resizeHandler);
    _resizeHandler = null;
  }
  if (_rafId) {
    cancelAnimationFrame(_rafId);
    _rafId = null;
  }
  // 清理所有元素的背景
  _allGlassElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      el.style.backgroundImage = '';
      el.style.backgroundPosition = '';
      el.style.backgroundSize = '';
      el.style.backgroundAttachment = '';
      el.style.backgroundRepeat = '';
    }
  });
  _allGlassElements.clear();
  _blurUrl = null;
}
