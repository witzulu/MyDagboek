import { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { 
  Book, 
  Code, 
  Zap, 
  Users, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Settings,
  Palette,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Cloud,
  Leaf,
  Check,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Heart,
  Star,
  ThumbsUp,
  MessageCircle,
  Eye,
  Edit3,
  Trash2,
  MoreVertical
} from 'lucide-react';

export default function ThemeDemo() {
  const { theme, setTheme, themes, currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'Theme updated successfully', time: '2 min ago' },
    { id: 2, type: 'warning', message: 'New update available', time: '5 min ago' },
    { id: 3, type: 'error', message: 'Failed to load data', time: '1 hour ago' }
  ]);

  const stats = [
    { label: 'Total Projects', value: 12, change: '+2', icon: FolderKanban, color: 'text-blue-500' },
    { label: 'Active Tasks', value: 48, change: '+8', icon: CheckSquare, color: 'text-green-500' },
    { label: 'Team Members', value: 8, change: '+1', icon: Users, color: 'text-purple-500' },
    { label: 'Completion Rate', value: '87%', change: '+5%', icon: TrendingUp, color: 'text-orange-500' }
  ];

  const recentActivities = [
    { user: 'Alice Johnson', action: 'completed task', target: 'API Integration', time: '2 minutes ago', avatar: 'AJ' },
    { user: 'Bob Smith', action: 'created new project', target: 'Mobile App v2.0', time: '15 minutes ago', avatar: 'BS' },
    { user: 'Carol White', action: 'updated documentation', target: 'User Guide', time: '1 hour ago', avatar: 'CW' },
    { user: 'David Brown', action: 'fixed bug', target: 'Login System', time: '2 hours ago', avatar: 'DB' }
  ];

  const tasks = [
    { id: 1, title: 'Implement theme switcher', status: 'completed', priority: 'high', assignee: 'You', progress: 100 },
    { id: 2, title: 'Update documentation', status: 'in-progress', priority: 'medium', assignee: 'Alice', progress: 65 },
    { id: 3, title: 'Fix responsive issues', status: 'pending', priority: 'low', assignee: 'Bob', progress: 0 },
    { id: 4, title: 'Code review', status: 'in-progress', priority: 'high', assignee: 'Carol', progress: 30 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Book className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Dagboek</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
            JD
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-background border-r border-border min-h-screen p-4">
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: Layout },
                { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                { id: 'projects', label: 'Projects', icon: FolderKanban },
                { id: 'team', label: 'Team', icon: Users },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 p-4 bg-secondary rounded-lg">
              <h3 className="font-semibold mb-2">Current Theme</h3>
              <div className="flex items-center gap-2 mb-3">
                {currentTheme?.icon && <currentTheme.icon className="w-5 h-5 text-primary" />}
                <span className="font-medium">{currentTheme?.name}</span>
              </div>
              <p className="text-sm text-muted mb-3">{currentTheme?.description}</p>
              <button className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                Customize Theme
              </button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back, John!</h2>
                <p className="text-muted">Here's what's happening with your projects today.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className={`w-8 h-8 ${stat.color}`} />
                        <span className="text-sm font-semibold text-green-500">{stat.change}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                      <p className="text-muted">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Recent Activity */}
              <div className="bg-background border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                        {activity.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.user}</span>
                          <span className="text-muted"> {activity.action} </span>
                          <span className="font-semibold">{activity.target}</span>
                        </p>
                        <p className="text-xs text-muted">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Tasks</h2>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                  Add New Task
                </button>
              </div>

              <div className="bg-background border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left p-4 font-semibold">Task</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Priority</th>
                      <th className="text-left p-4 font-semibold">Assignee</th>
                      <th className="text-left p-4 font-semibold">Progress</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                        <td className="p-4 font-medium">{task.title}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority).replace('text-', 'bg-')}`}></div>
                            <span className="text-sm capitalize">{task.priority}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{task.assignee}</td>
                        <td className="p-4">
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted mt-1">{task.progress}%</span>
                        </td>
                        <td className="p-4">
                          <button className="p-1 hover:bg-secondary rounded">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-background border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Project Progress</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Frontend Development', progress: 85, color: 'bg-blue-500' },
                      { name: 'Backend API', progress: 70, color: 'bg-green-500' },
                      { name: 'Database Design', progress: 95, color: 'bg-purple-500' },
                      { name: 'Testing', progress: 45, color: 'bg-orange-500' }
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm text-muted">{item.progress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className={`${item.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-background border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Team Performance</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Alice Johnson', tasks: 12, completed: 10, avatar: 'AJ' },
                      { name: 'Bob Smith', tasks: 8, completed: 7, avatar: 'BS' },
                      { name: 'Carol White', tasks: 15, completed: 14, avatar: 'CW' },
                      { name: 'David Brown', tasks: 10, completed: 8, avatar: 'DB' }
                    ].map((member, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                          {member.avatar}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted">
                            {member.completed}/{member.tasks} tasks completed
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-semibold">
                            {Math.round((member.completed / member.tasks) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}