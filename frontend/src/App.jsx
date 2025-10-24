import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './components/MainLayout';

// Auth Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// Admin Pages
import UserApproval from './pages/Admin/UserApproval';
import AdminDashboard from './pages/Admin/AdminDashboard';

// Settings Pages
import UserSettings from './pages/Settings/UserSettings';

// Core App Pages
import Projects from './pages/Projects/Projects';
import ProjectDashboard from './pages/Projects/ProjectDashboard';
import Notebook from './components/Notebook';
import BoardListPage from './pages/Boards/BoardListPage';
import Board from './pages/Board/Board';

// Auth Components
import ProtectedRoute from './components/Auth/ProtectedRoute';

import './themes.css';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <div className={`min-h-screen bg-background text-foreground`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/projects" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/projects" />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/projects" />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:projectId" element={<ProjectDashboard />} />
              <Route path="projects/:projectId/notebook" element={<Notebook />} />
              <Route path="projects/:projectId/boards" element={<BoardListPage />} />
              <Route path="projects/:projectId/boards/:boardId" element={<Board />} />
              <Route path="settings" element={<UserSettings />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<MainLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserApproval />} />
            </Route>
          </Route>

          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/projects" : "/login"} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
