import React, { useState, useEffect } from 'react';

const CardModal = ({ isOpen, onClose, onSave, task, listId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
    } else {
      setTitle('');
      setDescription('');
    }
  }, [task]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSave({
      title,
      description,
      listId: task ? task.list : listId,
      taskId: task ? task._id : null
    });
    onClose();
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
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded bg-blue-500 text-white">Save</button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
