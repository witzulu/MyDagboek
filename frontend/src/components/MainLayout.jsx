import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentUser={user}
        handleLogout={logout}
      />
      <div className="flex flex-1">
        {sidebarOpen && <Sidebar />}
        <main className="flex-1 flex">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
