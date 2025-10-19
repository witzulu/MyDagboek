import PropTypes from 'prop-types';
import { Book, Layout, TrendingUp, Code, AlertCircle } from 'lucide-react';

export default function Dashboard({ notes, boards, errorReports, snippets, setActiveSection, addNote, selectedBoard }) {
  const currentBoard = boards.find(b => b.id === selectedBoard);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <Book className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
          <h3 className="text-2xl font-bold">{notes.length}</h3>
          <p className="text-slate-500 dark:text-slate-400">Notes</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <Layout className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
          <h3 className="text-2xl font-bold">
            {currentBoard?.columns.reduce((sum, col) => sum + col.cards.length, 0) || 0}
          </h3>
          <p className="text-slate-500 dark:text-slate-400">Tasks</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mb-2" />
          <h3 className="text-2xl font-bold">{errorReports.filter(e => e.status === 'open').length}</h3>
          <p className="text-slate-500 dark:text-slate-400">Open Errors</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <Code className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
          <h3 className="text-2xl font-bold">{snippets.length}</h3>
          <p className="text-slate-500 dark:text-slate-400">Snippets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 mt-2" />
              <div>
                <p className="text-slate-700 dark:text-slate-300">Task completed: Setup CI/CD</p>
                <p className="text-slate-500 dark:text-slate-500 text-xs">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 mt-2" />
              <div>
                <p className="text-slate-700 dark:text-slate-300">New error report: NullPointerException</p>
                <p className="text-slate-500 dark:text-slate-500 text-xs">3 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mt-2" />
              <div>
                <p className="text-slate-700 dark:text-slate-300">New note created: Quick Ideas</p>
                <p className="text-slate-500 dark:text-slate-500 text-xs">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setActiveSection('notebook'); addNote(); }}
              className="p-4 bg-purple-100/20 dark:bg-purple-600/20 hover:bg-purple-200/30 dark:hover:bg-purple-600/30 border border-purple-300/50 dark:border-purple-500/50 rounded-lg text-left transition-colors"
            >
              <Book className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="font-medium text-sm">New Note</p>
            </button>
            <button
              onClick={() => setActiveSection('boards')}
              className="p-4 bg-blue-100/20 dark:bg-blue-600/20 hover:bg-blue-200/30 dark:hover:bg-blue-600/30 border border-blue-300/50 dark:border-blue-500/50 rounded-lg text-left transition-colors"
            >
              <Layout className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <p className="font-medium text-sm">Add Task</p>
            </button>
            <button
              onClick={() => setActiveSection('errors')}
              className="p-4 bg-red-100/20 dark:bg-red-600/20 hover:bg-red-200/30 dark:hover:bg-red-600/30 border border-red-300/50 dark:border-red-500/50 rounded-lg text-left transition-colors"
            >
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
              <p className="font-medium text-sm">View Errors</p>
            </button>
            <button
              onClick={() => setActiveSection('progress')}
              className="p-4 bg-green-100/20 dark:bg-green-600/20 hover:bg-green-200/30 dark:hover:bg-green-600/30 border border-green-300/50 dark:border-green-500/50 rounded-lg text-left transition-colors"
            >
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
              <p className="font-medium text-sm">View Progress</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  notes: PropTypes.array.isRequired,
  boards: PropTypes.array.isRequired,
  errorReports: PropTypes.array.isRequired,
  snippets: PropTypes.array.isRequired,
  setActiveSection: PropTypes.func.isRequired,
  addNote: PropTypes.func.isRequired,
  selectedBoard: PropTypes.string.isRequired,
};
