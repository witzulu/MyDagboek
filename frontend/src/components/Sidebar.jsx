import PropTypes from 'prop-types';
import { Book, Layout, TrendingUp, Code, Clock, Users, AlertCircle } from 'lucide-react';

export default function Sidebar({ activeSection, setActiveSection }) {
  const navItems = [
    { id: 'dashboard', icon: Layout, label: 'Dashboard' },
    { id: 'notebook', icon: Book, label: 'Notebook' },
    { id: 'boards', icon: Layout, label: 'Boards' },
    { id: 'errors', icon: AlertCircle, label: 'Error Reports' },
    { id: 'progress', icon: TrendingUp, label: 'Progress Reports' },
    { id: 'snippets', icon: Code, label: 'Code Snippets' },
    { id: 'time', icon: Clock, label: 'Time Tracking' },
    { id: 'team', icon: Users, label: 'Team' }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-screen p-4">
      <nav className="space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === item.id
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

Sidebar.propTypes = {
  activeSection: PropTypes.string.isRequired,
  setActiveSection: PropTypes.func.isRequired,
};
