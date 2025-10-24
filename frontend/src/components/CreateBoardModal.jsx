import { useState } from 'react';

export default function CreateBoardModal({ isOpen, onClose, onBoardCreated, projectId }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      setError('Board name is required.');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to create board');
      }

      const newBoard = await response.json();
      onBoardCreated(newBoard);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Create New Board</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="board-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Board Name</label>
            <input
              id="board-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="board-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <textarea
              id="board-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 bg-slate-100/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white">
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
