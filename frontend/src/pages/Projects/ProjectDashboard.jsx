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
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg max-w-lg mx-auto my-10">
        <div>
          <AlertCircle className="w-6 h-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-base-200 text-base-content  w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">
          {project?.name || 'Project'} Dashboard
        </h2>
        <p className="text-base-content/70">
          {project?.description || 'No description available.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body text-center">
            <Book className="w-8 h-8 text-primary mx-auto mb-2" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-sm text-base-content/70">Notes</p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body text-center">
            <Layout className="w-8 h-8 text-secondary mx-auto mb-2" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-sm text-base-content/70">Tasks</p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body text-center">
            <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-sm text-base-content/70">Open Errors</p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body text-center">
            <Code className="w-8 h-8 text-accent mx-auto mb-2" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-sm text-base-content/70">Snippets</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card bg-base-100 border border-base-300 shadow-md">
          <div className="card-body">
            <h3 className="card-title text-lg font-bold mb-2">Recent Activity</h3>
            <p className="text-base-content/70">
              No recent activity to show.
            </p>
          </div>
        </div>

        {/* Sidebar Panels */}
        <div className="flex flex-col gap-6">
          {/* Team Section */}
          <div className="card bg-base-100 border border-base-300 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-lg font-bold flex items-center mb-3">
                <Users className="w-6 h-6 mr-2 text-primary" />
                Team
              </h3>
              <ul className="divide-y divide-base-300">
                {(members || []).slice(0, 5).map((member, index) => (
                  <li
                    key={member.user?._id || index}
                    className="py-2 flex justify-between text-sm"
                  >
                    <span>{member.user?.name || 'Unknown User'}</span>
                    <span className="text-base-content/70 capitalize">
                      {member.role}
                    </span>
                  </li>
                ))}
              </ul>
              {members.length > 5 && (
                <p className="text-xs text-base-content/60 mt-2">
                  ...and {members.length - 5} more
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card bg-base-100 border border-base-300 shadow-md">
            <div className="card-body">
              <h3 className="card-title text-lg font-bold mb-3">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-2">
                <Link
                  to={`/projects/${projectId}/notebook`}
                  className="btn btn-sm btn-primary btn-outline w-full"
                >
                  Go to Notebook
                </Link>
                <button
                  onClick={() => navigate(`/projects/${projectId}/team`)}
                  className="btn btn-sm btn-secondary btn-outline w-full"
                >
                  Manage Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
