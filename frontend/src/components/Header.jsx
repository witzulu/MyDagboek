import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Book, Menu, X, Shield, Settings } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { useTheme } from './ThemeContext';
import { useSettings } from '../context/SettingsContext';

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  currentUser,
  handleLogout,
}) {
  const { theme, setTheme } = useTheme();
  const { settings } = useSettings();

  return (
    <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
        </button>
        {settings.siteLogo ? (
          <img src={`http://localhost:5000${settings.siteLogo}`} alt="Site Logo" className="h-8 w-8" />
        ) : (
          <Book className="w-8 h-8 text-primary" />
        )}
        <h1 className="text-2xl font-bold text-foreground">{settings.siteName}</h1>
      </div>
   
         <div className="flex items-center gap-4">
          <ThemeSwitcher 
        currentTheme={theme} 
        onThemeChange={setTheme} 
      />
           
           <div className="text-right">
             <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
             <p className="text-xs text-muted">{currentUser.role}</p>
           </div>
           
           <Link to="/settings" className="p-2 hover:bg-secondary rounded-lg transition-colors">
             <Settings className="w-5 h-5 text-foreground" />
           </Link>

           {currentUser.role === 'admin' && (
            <Link to="/admin" className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Shield className="w-5 h-5 text-foreground" />
            </Link>
           )}

           <button
             onClick={handleLogout}
             className="px-4 py-2 bg-secondary hover:bg-accent rounded-lg text-sm transition-colors text-foreground"
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
