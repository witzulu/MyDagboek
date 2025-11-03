import { useState } from 'react';
import PropTypes from 'prop-types';

const CreateErrorReportModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [status, setStatus] = useState('New');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, description, severity, status });
    onClose();
    // Reset form
    setTitle('');
    setDescription('');
    setSeverity('Medium');
    setStatus('New');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="modal-box w-full max-w-lg">
        <h3 className="font-bold text-lg">New Error Report</h3>
        <form onSubmit={handleSubmit} className="py-4">
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea textarea-bordered w-full"
                rows="4"
              ></textarea>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Severity</span>
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="select select-bordered w-full"
              >
                <option>Trivial</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="select select-bordered w-full"
              >
                <option>New</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Verified</option>
                <option>Closed</option>
              </select>
            </div>
          </div>
          <div className="modal-action mt-6">
            <button type="button" onClick={onClose} className="btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreateErrorReportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default CreateErrorReportModal;
