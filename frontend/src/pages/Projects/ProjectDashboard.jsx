import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useProject } from '../../hooks/useProject';
import api from '../../services/api';
import { Book, Layout, AlertCircle, Code, TrendingUp } from 'lucide-react';

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const { setSelectedProject } = useProject();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await api(`/projects/${projectId}`);
        setProject(data);
        setSelectedProject(data);
      } catch (error) {
        console.error('Failed to fetch project details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, setSelectedProject]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 ">{project.name} Dashboard</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8">{project.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Placeholder Stats */}
        <div className="bg-secondary p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <Book className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
          <h3 className="text-2xl font-bold">0</h3>
          <p className="text-muted">Notes</p>
        </div>
        <div className="bg-secondary p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <Layout className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
          <h3 className="text-2xl font-bold">0</h3>
          <p className="text-muted">Tasks</p>
        </div>
        <div className="bg-secondary dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mb-2" />
          <h3 className="text-2xl font-bold">0</h3>
          <p className="text-muted">Open Errors</p>
        </div>
        <div className="bg-secondary dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <Code className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
          <h3 className="text-2xl font-bold">0</h3>
          <p className="text-muted">Snippets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-secondary dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <p className="text-slate-500">No recent activity to show.</p>
        </div>

        <div className="bg-secondary dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          {/* Quick actions can be added back as features are implemented */}
          <p className="text-slate-500">Quick actions will be available as new features are added.</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
