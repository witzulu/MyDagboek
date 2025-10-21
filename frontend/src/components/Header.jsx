import PropTypes from 'prop-types';
import { Book, Menu, X, Sun, Moon } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { useTheme } from './ThemeContext';

export default function Header({ 
  sidebarOpen, 
  setSidebarOpen, 
  currentUser, 
  handleLogout
}) {
  const { theme, setTheme } = useTheme();
  return (
   <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-40">
         <div className="flex items-center gap-4">
           <button
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="p-2 hover:bg-secondary rounded-lg transition-colors"
           >
             {sidebarOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
           </button>
           <Book className="w-8 h-8 text-primary" />
           <h1 className="text-2xl font-bold text-foreground">Dagboek</h1>
         </div>
   
         <div className="flex items-center gap-4">
          <ThemeSwitcher 
        currentTheme={theme} 
        onThemeChange={setTheme} 
      />
           
           <div className="text-right">
             <p className="text-sm font-medium text-foreground">{currentUser.username}</p>
             <p className="text-xs text-muted">{currentUser.role}</p>
           </div>
           
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
