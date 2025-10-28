import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Book, Menu, X, Shield, Settings, Bell } from 'lucide-react';
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

  const unreadCount = (notifications || []).filter(n => n.status === 'unread').length;

  return (
    <header className="bg-base-100 border-b border-base-300 px-6 py-4 flex items-center justify-between sticky top-0 z-40 text-base-content">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn btn-ghost btn-circle"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        {settings.siteLogo ? (
          <img src={`http://localhost:5000${settings.siteLogo}`} alt="Site Logo" className="h-8 w-8" />
        ) : (
          <Book className="w-8 h-8 text-primary" />
        )}
        <h1 className="text-2xl font-bold">{settings.siteName}</h1>
      </div>
   
         <div className="flex items-center gap-4">
          <ThemeSwitcher />
           
           <div className="text-right">
             <p className="text-sm font-medium">{currentUser.name}</p>
             <p className="text-xs text-base-content/70">{currentUser.role}</p>
           </div>
           
           <Link to="/settings" className="btn btn-ghost btn-circle">
             <Settings className="w-5 h-5" />
           </Link>

           {currentUser.role === 'system_admin' && (
            <Link to="/admin" className="btn btn-ghost btn-circle">
              <Shield className="w-5 h-5" />
            </Link>
           )}

           <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) {
                      fetchNotifications();
                    }
                  }}
                  className="btn btn-ghost btn-circle"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-error ring-2 ring-base-100"></span>
                    )}
                </button>
                {showNotifications && (
                    <NotificationsPanel
                        notifications={notifications || []}
                        onRespond={handleRespond}
                        onMarkAsRead={handleMarkAsRead}
                    />
                )}
            </div>

           <button
             onClick={handleLogout}
             className="btn btn-secondary"
           >
             Logout
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