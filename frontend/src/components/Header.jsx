import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { Book, Menu, X, Shield, Settings, Bell, LogOut } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import NotificationsPanel from './NotificationsPanel';
import api from '../services/api';

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  currentUser,
  handleLogout,
}) {
  const { settings } = useSettings();
  const { notifications, fetchNotifications } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    setShowNotifications(false);
    navigate(path);
  };

  const handleRespond = async (notificationId, response) => {
    try {
      await api(`/notifications/respond/${notificationId}`, {
        method: 'PUT',
        body: { response },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to respond to invitation', error);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await api('/notifications/read', { method: 'PUT' });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  };

  const unreadCount = (notifications || []).filter(
    (n) => n.status === 'unread'
  ).length;

  return (
    <header className="bg-base-100 border-b border-base-300 px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn btn-ghost btn-circle"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-base-content" />
          ) : (
            <Menu className="w-5 h-5 text-base-content" />
          )}
        </button>

        {/* Logo + Site Name */}
        {settings.siteLogo ? (
          <img
            src={`http://localhost:5000${settings.siteLogo}`}
            alt="Site Logo"
            className="h-8 w-8 rounded-md object-cover"
          />
        ) : (
          <Book className="w-8 h-8 text-primary" />
        )}
        <h1 className="text-xl font-bold text-primary-content">
          {settings.siteName}
        </h1>
      </div>

      {/* Right Section */}
      <div className="btn flex items-center gap-4">
        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* User Info */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-base-content">
            {currentUser.name}
          </p>
          <p className="text-xs text-base-content/70">{currentUser.role}</p>
        </div>

        {/* Settings */}
        <Link
          to="/settings"
          className="btn btn-ghost btn-circle hover:bg-primary/10"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-base-content" />
        </Link>

        {/* Admin */}
        {currentUser.role === 'system_admin' && (
          <Link
            to="/admin"
            className="btn btn-ghost btn-circle hover:bg-accent/10"
            title="Admin Panel"
          >
            <Shield className="w-5 h-5 text-accent" />
          </Link>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifications();
            }}
            className="btn btn-ghost btn-circle hover:bg-info/10"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-info" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-error ring-2 ring-base-100"></span>
            )}
          </button>

          {showNotifications && (
            <NotificationsPanel
              notifications={notifications || []}
              onRespond={handleRespond}
              onMarkAsRead={handleMarkAsRead}
              onNavigate={handleNavigate}
            />
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn   btn-sm sm:btn-md flex items-center gap-1"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

Header.propTypes = {
  sidebarOpen: PropTypes.bool.isRequired,
  setSidebarOpen: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
  handleLogout: PropTypes.func.isRequired,
};
