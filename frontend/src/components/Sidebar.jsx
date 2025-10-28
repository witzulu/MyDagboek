import { NavLink as RouterNavLink, useLocation, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useProject } from '../hooks/useProject';
import { Book, Layout, TrendingUp, Code, Clock, Users, AlertCircle, FolderKanban, Settings } from 'lucide-react';

export default function Sidebar() {
  const { projectId } = useParams();
  const { selectedProject } = useProject();

  const projectNavItems = [
    { to: `/projects/${projectId}`, icon: Layout, label: 'Dashboard' },
    { to: `/projects/${projectId}/notebook`, icon: Book, label: 'Notebook' },
    { to: `/projects/${projectId}/boards`, icon: FolderKanban, label: 'Boards' },
    { to: `/projects/${projectId}/errors`, icon: AlertCircle, label: 'Error Reports' },
    { to: `/projects/${projectId}/progress-reports`, icon: TrendingUp, label: 'Progress Reports' },
    { to: `/projects/${projectId}/snippets`, icon: Code, label: 'Code Snippets' },
    { to: `/projects/${projectId}/time`, icon: Clock, label: 'Time Tracking' },
    { to: `/projects/${projectId}/team`, icon: Users, label: 'Team' }
  ];

  const globalNavItems = [
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const NavItem = ({ item, disabled }) => {
    const NavLinkComponent = disabled ? 'div' : RouterNavLink;

    return (
      <li>
        <NavLinkComponent
          to={disabled ? undefined : item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`
          }
          onClick={(e) => disabled && e.preventDefault()}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </NavLinkComponent>
      </li>
    );
  };

  NavItem.propTypes = {
    item: PropTypes.shape({
      to: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      label: PropTypes.string.isRequired,
    }).isRequired,
    disabled: PropTypes.bool,
  };

  return (
    <aside className="w-64 bg-base-200 text-base-content p-4 flex flex-col justify-between">
      <ul className="menu p-0">
        {projectNavItems.map(item => (
          <NavItem key={item.to} item={item} disabled={!projectId} />
        ))}
      </ul>
      <div>
        <div className="divider"></div>
        <ul className="menu p-0">
          {globalNavItems.map(item => (
            <NavItem key={item.to} item={item} />
          ))}
        </ul>
      </div>
    </aside>
  );
}