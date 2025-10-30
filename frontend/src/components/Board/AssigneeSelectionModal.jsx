import React, { useState, useMemo } from 'react';

const AssigneeSelectionModal = ({ isOpen, onClose, members, selectedAssignees, onConfirm }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelection, setLocalSelection] = useState(selectedAssignees);

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    return members.filter(member =>
      member.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  const handleToggle = (memberId) => {
    setLocalSelection(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const handleConfirm = () => {
    onConfirm(localSelection);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-base-200 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Assign Members</h2>
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full mb-4"
        />
        <div className="max-h-60 overflow-y-auto mb-4">
          {filteredMembers.map(member => (
            <div key={member.user._id} className="flex items-center p-2 rounded-lg hover:bg-base-300">
              <label className="flex items-center cursor-pointer w-full">
                <input
                  type="checkbox"
                  checked={localSelection.includes(member.user._id)}
                  onChange={() => handleToggle(member.user._id)}
                  className="checkbox checkbox-primary"
                />
                <span className="ml-3">{member.user.name}</span>
              </label>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleConfirm} className="btn btn-primary">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default AssigneeSelectionModal;
