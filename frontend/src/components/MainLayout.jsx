import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import PropTypes from 'prop-types';

const MainLayout = ({ currentUser, handleLogout, theme, toggleTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentUser={currentUser}
        handleLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <div className="flex">
        {sidebarOpen && <Sidebar />}
        <main className="flex-1 p-6 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
};

MainLayout.propTypes = {
    currentUser: PropTypes.object,
    handleLogout: PropTypes.func.isRequired,
    theme: PropTypes.string.isRequired,
    toggleTheme: PropTypes.func.isRequired,
};

export default MainLayout;
