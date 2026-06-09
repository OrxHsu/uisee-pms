import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/HomePage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import { useProjectStore, useModuleStore, useSettingsStore } from './stores/projectStore'
import { GlassBlurProvider } from './components/GlassBlurProvider'

// ★ 关键：在组件渲染前同步加载数据，避免子组件 mount 时 store 为空导致示例数据覆盖 localStorage
useProjectStore.getState().loadProjects()
useModuleStore.getState().loadModuleData()
useSettingsStore.getState().loadSettings()

export default function App() {
  return (
    <GlassBlurProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="project/:projectId" element={<ProjectDetailPage />} />
          </Route>
        </Routes>
      </Router>
    </GlassBlurProvider>
  )
}
