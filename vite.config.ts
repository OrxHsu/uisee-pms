import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // 针对 Electron 28 (Chromium 120) 优化，支持现代语法
    target: 'es2022',
    // esbuild 极速压缩
    minify: 'esbuild',
    // 关闭 sourcemap 减小包体积
    sourcemap: false,
    // 代码拆分：将大型依赖独立打包，提升加载性能
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-pdf': ['jspdf', 'jspdf-autotable'],
          'vendor-utils': ['zustand', 'clsx', 'tailwind-merge'],
        },
      },
    },
    // 提高 chunk 警告阈值（Electron 本地加载不受影响）
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
  },
  plugins: [
    react(),
    tsconfigPaths()
  ],
})
