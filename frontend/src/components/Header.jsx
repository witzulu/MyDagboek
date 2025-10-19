import PropTypes from 'prop-types';
import { Book, Menu, X, Sun, Moon } from 'lucide-react';

export default function Header({ sidebarOpen, setSidebarOpen, currentUser, handleLogout, theme, toggleTheme }) {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Book className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dagboek</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800 dark:text-white">{currentUser.username}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm transition-colors"
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
  theme: PropTypes.string.isRequired,
  toggleTheme: PropTypes.func.isRequired,
};
