import { useState, useEffect } from 'react';
import { Plus, FolderKanban, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewProjectModal from '../../components/NewProjectModal';
import api from '../../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api('/projects');
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
    };
    fetchProjects();
  }, []);

  const handleAddProject = async (project) => {
    try {
      const newProject = await api('/projects', { body: project });
      setProjects([...projects, newProject]);
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  const handleUpdateProject = async (project) => {
    try {
      const updatedProject = await api(`/projects/${project._id}`, {
        method: 'PUT',
        body: project,
      });
      setProjects((projects) =>
        projects.map((p) => (p._id === updatedProject._id ? updatedProject : p))
      );
    } catch (error) {
      console.error('Failed to update project', error);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api(`/projects/${id}`, { method: 'DELETE' });
        setProjects((projects) => projects.filter((p) => p._id !== id));
      } catch (error) {
        console.error('Failed to delete project', error);
      }
    }
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 min-h-screen bg-base-200 text-base-content">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Projects</h1>
        <button
          onClick={openCreateModal}
          className="btn btn-primary gap-2 shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full text-center text-base-content/70 py-10">
            <p>No projects found.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project._id}
              className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-200 border border-base-300"
            >
              <div className="card-body">
                <Link
                  to={`/projects/${project._id}`}
                  className="flex items-center gap-3 mb-3"
                >
                  <FolderKanban className="w-7 h-7 text-primary" />
                  <h2 className="card-title">{project.name}</h2>
                </Link>

                <p className="text-sm text-base-content/70 mb-4 line-clamp-3">
                  {project.description || 'No description provided.'}
                </p>

                <div className="card-actions justify-end">
                  <button
                    onClick={() => openEditModal(project)}
                    className="btn btn-ghost btn-sm text-info"
                    title="Edit Project"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    className="btn btn-ghost btn-sm text-error"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <NewProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={editingProject ? handleUpdateProject : handleAddProject}
          project={editingProject}
        />
      )}
    </div>
  );
};

export default Projects;
