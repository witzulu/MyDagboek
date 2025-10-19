import PropTypes from 'prop-types';
import { Plus, Trash2 } from 'lucide-react';

export default function Notebook({ notes, currentNote, setCurrentNote, addNote, updateNote, deleteNote }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Notebook</h2>
        <button
          onClick={addNote}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold mb-4 text-slate-800 dark:text-white">All Notes</h3>
          <div className="space-y-2">
            {notes.map(note => (
              <div
                key={note.id}
                onClick={() => setCurrentNote(note)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentNote?.id === note.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <p className="font-medium text-sm">{note.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(note.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          {currentNote ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={currentNote.title}
                  onChange={(e) => updateNote(currentNote.id, { title: e.target.value })}
                  className="text-2xl font-bold bg-transparent border-none outline-none text-slate-800 dark:text-white w-full"
                />
                <button
                  onClick={() => deleteNote(currentNote.id)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-red-500 dark:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={currentNote.content}
                onChange={(e) => updateNote(currentNote.id, { content: e.target.value })}
                placeholder="Start typing your notes..."
                className="w-full h-96 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg p-4 text-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-slate-500 dark:text-slate-500">
              <p>Select a note or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Notebook.propTypes = {
  notes: PropTypes.array.isRequired,
  currentNote: PropTypes.object,
  setCurrentNote: PropTypes.func.isRequired,
  addNote: PropTypes.func.isRequired,
  updateNote: PropTypes.func.isRequired,
  deleteNote: PropTypes.func.isRequired,
};
