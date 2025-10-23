import { Link, useLocation, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useProject } from '../hooks/useProject';
import { Book, Layout, TrendingUp, Code, Clock, Users, AlertCircle, FolderKanban, Settings } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const { projectId } = useParams();
  const { selectedProject } = useProject();

  const projectNavItems = [
    { to: `/projects/${projectId}`, icon: Layout, label: 'Dashboard' },
    { to: `/projects/${projectId}/notebook`, icon: Book, label: 'Notebook' },
    { to: `/projects/${projectId}/boards`, icon: Layout, label: 'Boards' },
    { to: `/projects/${projectId}/errors`, icon: AlertCircle, label: 'Error Reports' },
    { to: `/projects/${projectId}/progress`, icon: TrendingUp, label: 'Progress Reports' },
    { to: `/projects/${projectId}/snippets`, icon: Code, label: 'Code Snippets' },
    { to: `/projects/${projectId}/time`, icon: Clock, label: 'Time Tracking' },
    { to: `/projects/${projectId}/team`, icon: Users, label: 'Team' }
  ];

  const globalNavItems = [
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const NavLink = ({ item, disabled }) => (
    <Link
      to={disabled ? '#' : item.to}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        !disabled && location.pathname === item.to
          ? 'bg-primary text-primary-foreground'
          : disabled
          ? 'bg-secondary text-muted cursor-not-allowed'
          : 'hover:bg-secondary text-foreground'
      }`}
      onClick={(e) => disabled && e.preventDefault()}
    >
      <item.icon className="w-5 h-5" />
      <span>{item.label}</span>
    </Link>
  );

  NavLink.propTypes = {
    item: PropTypes.shape({
      to: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      label: PropTypes.string.isRequired,
    }).isRequired,
    disabled: PropTypes.bool,
  };

  return (
    <aside className="w-64 min-h-screen p-4 flex flex-col justify-between">
      <div>
        <nav className="space-y-2">
          {projectNavItems.map(item => (
            <NavLink key={item.to} item={item} disabled={!projectId} />
          ))}
        </nav>
      </div>
      <div>
        <hr className="my-4 border-slate-200 dark:border-slate-700" />
        <nav className="space-y-2">
          {globalNavItems.map(item => (
            <NavLink key={item.to} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}