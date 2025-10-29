import PropTypes from 'prop-types';
import { useProject } from '../hooks/useProject';
import { Plus } from 'lucide-react';

export default function CodeSnippets({ snippets }) {
  const { selectedProject } = useProject();

  return (
    <div>
      <div className="flex items-center justify-between mb-6  w-full">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            {selectedProject ? `${selectedProject.name}: Code Snippets` : 'Code Snippets'}
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white">
          <Plus className="w-4 h-4" />
          New Snippet
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {snippets.map(snippet => (
          <div key={snippet.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 dark:text-white">{snippet.title}</h3>
              <span className="px-2 py-1 bg-orange-100/20 dark:bg-orange-600/20 text-orange-600 dark:text-orange-400 text-xs rounded">
                {snippet.language}
              </span>
            </div>
            <pre className="bg-slate-100 dark:bg-slate-900 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-300 overflow-x-auto">
              <code>{snippet.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

CodeSnippets.propTypes = {
  snippets: PropTypes.array.isRequired,
};
