import PropTypes from 'prop-types';
import { useProject } from '../hooks/useProject';

export default function Team({ currentUser }) {
  const { selectedProject } = useProject();

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">
        {selectedProject ? `${selectedProject.name}: Team` : 'Team'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mb-3 text-white">
            {currentUser.username[0].toUpperCase()}
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-white">{currentUser.username}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{currentUser.role}</p>
          <span className="inline-block mt-2 px-2 py-1 bg-green-100/20 dark:bg-green-600/20 text-green-600 dark:text-green-400 text-xs rounded">
            Online
          </span>
        </div>
      </div>
    </div>
  );
}

Team.propTypes = {
  currentUser: PropTypes.object.isRequired,
};
