import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useProject } from '../../hooks/useProject';
import api from '../../services/api';
import { Book, Layout, AlertCircle, Code, Users } from 'lucide-react';

const ProjectDashboard = () => {
  const { projectId } = useParams();
  const { setSelectedProject } = useProject();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);
        const projectData = await api(`/projects/${projectId}`);
        setProject(projectData);
        setSelectedProject(projectData);

        const memberData = await api(`/projects/${projectId}/members`);
        setMembers(memberData);

      } catch (error) {
        console.error('Failed to fetch project details', error);
        setError('Failed to load project dashboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, setSelectedProject]);

  if (loading) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">{project?.name || 'Project'} Dashboard</h2>
      <p className="text-muted mb-8">{project?.description || 'No description available.'}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Placeholder Stats */}
        <div className="bg-secondary p-6 rounded-xl border border-border">
          <Book className="w-8 h-8 text-purple-500 mb-2" />
          <h3 className="text-2xl font-bold">0</h3>
          <p className="text-muted">Notes</p>
        </div>
        <div className="bg-secondary p-6 rounded-xl border border-border">
          <Layout className="w-8 h-8 text-blue-500 mb-2" />
          <h3 className="text-2xl font-bold">0</h3>
          <p className="text-muted">Tasks</p>
        </div>
        <div className="bg-secondary p-6 rounded-xl border border-border">
          <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
          <h3 className="text-2xl font-bold">0</h3>
          <p className="text-muted">Open Errors</p>
        </div>
        <div className="bg-secondary p-6 rounded-xl border border-border">
          <Code className="w-8 h-8 text-orange-500 mb-2" />
          <h3 className="text-2xl font-bold">0</h3>
          <p className="text-muted">Snippets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-secondary p-6 rounded-xl border border-border">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <p className="text-muted">No recent activity to show.</p>
        </div>

        <div className="grid grid-rows-2 gap-6">
          <div className="bg-secondary p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2" /> Team
            </h3>
            <ul className="space-y-2">
              {(members || []).slice(0, 5).map((member, index) => (
                <li key={member.user?._id || index} className="flex justify-between items-center text-sm">
                  <span>{member.user?.name || 'User not found'}</span>
                  <span className="text-muted capitalize">{member.role}</span>
                </li>
              ))}
            </ul>
            {(members || []).length > 5 && <p className="text-xs text-muted mt-2">...and {members.length - 5} more</p>}
          </div>
          <div className="bg-secondary p-6 rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="flex flex-col space-y-2">
                <Link to={`/projects/${projectId}/notebook`} className="text-primary hover:underline">
                    Go to Notebook
                </Link>
                <button onClick={() => navigate(`/projects/${projectId}/team`)} className="text-primary hover:underline text-left">
                    Manage Team
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
