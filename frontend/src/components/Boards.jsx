import { useState } from 'react';
import PropTypes from 'prop-types';
import { useProject } from '../hooks/useProject';
import { Plus, X, Calendar, User, MessageSquare, ArrowRight } from 'lucide-react';

export default function Boards({ boards, selectedBoard, addColumn, addCard, deleteCard, updateCard, moveCard, getLabelColor }) {
  const { selectedProject } = useProject();
  const currentBoard = boards.find(b => b.id === selectedBoard);
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            {selectedProject ? `${selectedProject.name}: Boards` : 'Boards'}
        </h2>
        <button
          onClick={() => addColumn(selectedBoard)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
        >
          <Plus className="w-4 h-4" />
          Add Column
        </button>
      </div>

      <div className="flex gap-4 pb-4 overflow-x-auto" style={{ minHeight: '70vh' }}>
        {currentBoard?.columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                {column.name}
                <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">({column.cards.length})</span>
              </h3>
              <button
                onClick={() => addCard(selectedBoard, column.id)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[calc(70vh-80px)] overflow-y-auto">
              {column.cards.map(card => (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors group"
                >
                  {card.labels && card.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {card.labels.map((label, idx) => (
                        <span key={idx} className={`px-2 py-1 rounded text-xs ${getLabelColor(label)}`}>
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  <h4 className="font-medium mb-2 text-slate-800 dark:text-white">{card.title}</h4>

                  {card.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{card.description.substring(0, 60)}{card.description.length > 60 ? '...' : ''}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {card.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {card.assignee && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{card.assignee}</span>
                      </div>
                    )}

                    {card.checklist && card.checklist.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span>{card.checklist.filter(c => c.done).length}/{card.checklist.length}</span>
                      </div>
                    )}

                    {card.comments > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{card.comments}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCard(selectedBoard, column.id, card.id);
                      }}
                      className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-xs"
                    >
                      Delete
                    </button>
                    {currentBoard.columns.map(col => col.id !== column.id && (
                      <button
                        key={col.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveCard(selectedBoard, column.id, col.id, card.id);
                        }}
                        className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-xs flex items-center gap-1"
                      >
                        <ArrowRight className="w-3 h-3" />
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCard(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <input
                type="text"
                value={selectedCard.title}
                onChange={(e) => {
                  const boardId = selectedBoard;
                  const columnId = currentBoard.columns.find(col =>
                    col.cards.some(c => c.id === selectedCard.id)
                  )?.id;
                  if (columnId) {
                    updateCard(boardId, columnId, selectedCard.id, { title: e.target.value });
                  }
                }}
                className="text-2xl font-bold bg-transparent border-none outline-none text-slate-800 dark:text-white w-full"
              />
              <button
                onClick={() => setSelectedCard(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea
                  value={selectedCard.description || ''}
                  onChange={(e) => {
                    const boardId = selectedBoard;
                    const columnId = currentBoard.columns.find(col =>
                      col.cards.some(c => c.id === selectedCard.id)
                    )?.id;
                    if (columnId) {
                      updateCard(boardId, columnId, selectedCard.id, { description: e.target.value });
                    }
                  }}
                  placeholder="Add a description..."
                  className="w-full h-32 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg p-3 text-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assignee</label>
                  <input
                    type="text"
                    value={selectedCard.assignee || ''}
                    onChange={(e) => {
                      const boardId = selectedBoard;
                      const columnId = currentBoard.columns.find(col =>
                        col.cards.some(c => c.id === selectedCard.id)
                      )?.id;
                      if (columnId) {
                        updateCard(boardId, columnId, selectedCard.id, { assignee: e.target.value });
                      }
                    }}
                    placeholder="Assign to..."
                    className="w-full px-3 py-2 bg-slate-100/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={selectedCard.dueDate || ''}
                    onChange={(e) => {
                      const boardId = selectedBoard;
                      const columnId = currentBoard.columns.find(col =>
                        col.cards.some(c => c.id === selectedCard.id)
                      )?.id;
                      if (columnId) {
                        updateCard(boardId, columnId, selectedCard.id, { dueDate: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-100/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {selectedCard.labels && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Labels</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCard.labels.map((label, idx) => (
                      <span key={idx} className={`px-3 py-1 rounded ${getLabelColor(label)}`}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCard.checklist && selectedCard.checklist.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Checklist</label>
                  <div className="space-y-2">
                    {selectedCard.checklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={(e) => {
                            const boardId = selectedBoard;
                            const columnId = currentBoard.columns.find(col =>
                              col.cards.some(c => c.id === selectedCard.id)
                            )?.id;
                            if (columnId) {
                              const updatedChecklist = selectedCard.checklist.map(c =>
                                c.id === item.id ? { ...c, done: e.target.checked } : c
                              );
                              updateCard(boardId, columnId, selectedCard.id, { checklist: updatedChecklist });
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className={item.done ? 'line-through text-slate-500 dark:text-slate-500' : ''}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Boards.propTypes = {
  boards: PropTypes.array.isRequired,
  selectedBoard: PropTypes.string.isRequired,
  addColumn: PropTypes.func.isRequired,
  addCard: PropTypes.func.isRequired,
  deleteCard: PropTypes.func.isRequired,
  updateCard: PropTypes.func.isRequired,
  moveCard: PropTypes.func.isRequired,
  getLabelColor: PropTypes.func.isRequired,
};
