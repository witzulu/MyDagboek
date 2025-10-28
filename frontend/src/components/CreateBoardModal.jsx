import { useState } from "react";
import PropTypes from "prop-types";

const CreateBoardModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, description });
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-base-100 bg-opacity-50 flex justify-center items-center z-50">
      <div className="card bg-base-100 shadow-xl w-full max-w-lg border border-base-300 animate-fadeIn">
        <div className="card-body">
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h2 className="card-title text-xl font-semibold text-base-content">
              Create New Board
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm text-base-content/70 hover:text-base-content"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Board Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter board name"
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">
                  Description
                </span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a short description..."
                className="textarea textarea-bordered w-full"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost text-base-content/70 hover:text-base-content"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

CreateBoardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default CreateBoardModal;
