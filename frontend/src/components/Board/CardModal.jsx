import { useState, useEffect } from 'react';
import LabelManager from './LabelManager';
import PropTypes from 'prop-types';

const CardModal = ({ isOpen, onClose, onSave, onDelete, task, listId, projectLabels, onNewLabel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [assignedLabels, setAssignedLabels] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null);
        setAssignedLabels(task.labels || []);
      } else {
        setTitle('');
        setDescription('');
        setDueDate(null);
        setAssignedLabels([]);
      }
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSave({
      title,
      description,
      dueDate,
      labels: assignedLabels,
      listId: task ? task.list : listId,
      taskId: task ? task._id : null
    });
    onClose();
  };

  const handleLabelToggle = (labelId) => {
    setAssignedLabels(prev =>
      prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">{task ? 'Edit Card' : 'Create Card'}</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Card title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded border"
          />
          <textarea
            placeholder="Card description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded border h-32"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
            <input
              type="date"
              value={dueDate || ''}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full p-2 rounded border"
            />
          </div>
          <LabelManager
            projectLabels={projectLabels}
            assignedLabels={assignedLabels}
            onLabelToggle={handleLabelToggle}
            onNewLabel={onNewLabel}
          />
        </div>
        <div className="mt-6 flex justify-between items-center">
          <div>
            {task && (
              <button onClick={() => onDelete(task._id)} className="px-4 py-2 rounded bg-red-500 text-white">
                Delete
              </button>
            )}
          </div>
          <div className="flex space-x-4">
            <button onClick={onClose} className="px-4 py-2 rounded">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded bg-blue-500 text-white">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

CardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  task: PropTypes.object,
  listId: PropTypes.string,
  projectLabels: PropTypes.array.isRequired,
  onNewLabel: PropTypes.func.isRequired,
};

export default CardModal;
