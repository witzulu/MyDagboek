import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const EditBoardModal = ({ isOpen, onClose, onSave, board }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (board) {
      setName(board.name);
      setDescription(board.description);
    }
  }, [board]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSave({ name, description });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Board</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Board name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded border"
          />
          <textarea
            placeholder="Board description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded border h-32"
          />
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded bg-blue-500 text-white">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

EditBoardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  board: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default EditBoardModal;
