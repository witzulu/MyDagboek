import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AssigneeSelectionModal from './Board/AssigneeSelectionModal';
import { UserPlus } from 'lucide-react';

const CreateErrorReportModal = ({ isOpen, onClose, onSave, report, projectMembers }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [status, setStatus] = useState('New');
  const [assignedTo, setAssignedTo] = useState([]);
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && report) {
      setTitle(report.title || '');
      setDescription(report.description || '');
      setSeverity(report.severity || 'Medium');
      setStatus(report.status || 'New');
      setAssignedTo(report.assignedTo ? report.assignedTo.map(a => a._id) : []);
    } else if (isOpen) {
      // Reset form for new report
      setTitle('');
      setDescription('');
      setSeverity('Medium');
      setStatus('New');
      setAssignedTo([]);
    }
  }, [isOpen, report]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...report, title, description, severity, status, assignedTo });
    onClose();
  };

  const handleAssigneeConfirm = (selected) => {
    setAssignedTo(selected);
    setIsAssigneeModalOpen(false);
  };

  const assignedMembers = projectMembers.filter(m => m.user && assignedTo.includes(m.user._id));

  return (
    <>
      <AssigneeSelectionModal
        isOpen={isAssigneeModalOpen}
        onClose={() => setIsAssigneeModalOpen(false)}
        members={projectMembers}
        selectedAssignees={assignedTo}
        onConfirm={handleAssigneeConfirm}
        multiSelect={true}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-base-100/75">
        <div className="card bg-base-100 rounded-xl border p-6 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-4">{report ? 'Edit Error Report' : 'New Error Report'}</h2>
          <form onSubmit={handleSubmit}>
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
            <div>
              <h3 className="font-semibold mb-2">Assigned To</h3>
              <div className="flex items-center space-x-2">
                <div className="avatar-group -space-x-4">
                  {assignedMembers.map(member => (
                    member.user ? (
                      <div key={member.user._id} className="tooltip" data-tip={member.user.name}>
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs">
                            {member.user.name.charAt(0)}
                          </div>
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssigneeModalOpen(true)}
                  className="btn btn-outline btn-circle btn-sm"
                >
                  <UserPlus size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {report ? 'Save Changes' : 'Create Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

CreateErrorReportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  report: PropTypes.object,
  projectMembers: PropTypes.array.isRequired,
};

export default CreateErrorReportModal;
