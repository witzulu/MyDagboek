import React, { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';

const AssigneeSelectionModal = ({ isOpen, onClose, members, selectedAssignees, onConfirm }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelection, setLocalSelection] = useState(selectedAssignees || []);

  // ✅ Ensure members is always an array
  const safeMembers = Array.isArray(members) ? members : [];

  useEffect(() => {
    if (isOpen) {
      setLocalSelection(selectedAssignees || []);
    }
  }, [isOpen, selectedAssignees]);

  // ✅ Setup Fuse for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(safeMembers, {
        keys: ['user.name'],
        threshold: 0.3,
      }),
    [safeMembers]
  );

  // ✅ Filter members safely
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return safeMembers;
    return fuse.search(searchTerm).map(result => result.item);
  }, [safeMembers, searchTerm, fuse]);

  // ✅ Toggle selection
  const handleToggle = (memberId) => {
    setLocalSelection(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleConfirm = () => {
    onConfirm(localSelection);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60">
      <div className="bg-base-200 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Assign Members</h2>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered w-full mb-4"
        />

        {/* Members List */}
        <div className="max-h-60 overflow-y-auto mb-4">
          {filteredMembers
            .filter(m => m && m.user && m.user._id) // ✅ Avoid null crashes
            .map(member => (
              <div
                key={member.user._id}
                className="flex items-center p-2 rounded-lg hover:bg-base-300"
              >
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

          {/* Empty State */}
          {filteredMembers.filter(m => m && m.user && m.user._id).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              No members found.
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn btn-primary">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssigneeSelectionModal;
