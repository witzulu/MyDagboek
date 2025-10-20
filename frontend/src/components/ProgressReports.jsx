import PropTypes from 'prop-types';
import { useProject } from '../hooks/useProject';

export default function ProgressReports({ projects }) {
  const { selectedProject } = useProject();

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">
        {selectedProject ? `${selectedProject.name}: Progress Reports` : 'Progress Reports'}
      </h2>
      <div className="space-y-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{project.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: {project.lastUpdate}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                project.status === 'In Progress' ? 'bg-blue-100/20 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400' : 'bg-green-100/20 dark:bg-green-600/20 text-green-600 dark:text-green-400'
              }`}>
                {project.status}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-500 dark:text-slate-400">Progress</span>
                <span className="font-semibold">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-100/50 dark:bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-slate-800 dark:text-white">Auto-Generated Patch Notes</h4>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-green-600 dark:text-green-400">+</span>
                  <p className="text-slate-700 dark:text-slate-300">Added user authentication system</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-600 dark:text-green-400">+</span>
                  <p className="text-slate-700 dark:text-slate-300">Implemented notebook feature with CRUD operations</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400">~</span>
                  <p className="text-slate-700 dark:text-slate-300">Updated kanban board drag-and-drop functionality</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-red-600 dark:text-red-400">-</span>
                  <p className="text-slate-700 dark:text-slate-300">Removed deprecated API endpoints</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ProgressReports.propTypes = {
  projects: PropTypes.array.isRequired,
};
