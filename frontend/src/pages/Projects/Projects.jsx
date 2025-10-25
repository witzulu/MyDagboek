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
      const updatedProject = await api(`/projects/${project._id}`, { method: 'PUT', body: project });
      setProjects(projects.map(p => p._id === updatedProject._id ? updatedProject : p));
    } catch (error) {
      console.error('Failed to update project', error);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api(`/projects/${id}`, { method: 'DELETE' });
        setProjects(projects.filter(p => p._id !== id));
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button
          onClick={openCreateModal}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project._id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
            <Link to={`/projects/${project._id}`}>
              <div className="flex items-center gap-4 mb-4">
                <FolderKanban className="w-8 h-8 text-purple-500" />
                <h2 className="text-xl font-semibold">{project.name}</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-grow">{project.description}</p>
            </Link>
            <div className="flex items-center justify-end gap-2">
                <button onClick={() => openEditModal(project)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2">
                    <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDeleteProject(project._id)} className="text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2">
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
          </div>
        ))}
      </div>
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
