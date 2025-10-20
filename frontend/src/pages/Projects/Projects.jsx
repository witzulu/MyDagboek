import { useState } from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewProjectModal from '../../components/NewProjectModal';

const mockProjects = [
  { id: 1, name: 'Dagboek v1.0', description: 'The first version of the Dagboek developer hub.', team: ['Alice', 'Bob'] },
  { id: 2, name: 'API Refactor', description: 'Refactoring the backend API for better performance and scalability.', team: ['Charlie', 'Dana'] },
  { id: 3, name: 'UI/UX Overhaul', description: 'A complete redesign of the user interface and experience.', team: ['Eve', 'Frank'] },
];

const Projects = () => {
  const [projects, setProjects] = useState(mockProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addProject = (project) => {
    setProjects([...projects, { ...project, id: projects.length + 1 }]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Link to={`/projects/${project.id}`} key={project.id}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <FolderKanban className="w-8 h-8 text-purple-500" />
                <h2 className="text-xl font-semibold">{project.name}</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{project.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.team.map(member => (
                    <div key={member} className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-800">
                      {member.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addProject={addProject}
      />
    </div>
  );
};

export default Projects;
