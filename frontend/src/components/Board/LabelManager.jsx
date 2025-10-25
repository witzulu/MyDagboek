import { useState } from 'react';
import PropTypes from 'prop-types';

const LabelManager = ({ projectLabels, assignedLabels, onLabelToggle, onNewLabel }) => {
  const [showNewLabelForm, setShowNewLabelForm] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#ff0000');

  const handleCreateLabel = () => {
    if (newLabelName.trim()) {
      onNewLabel({ name: newLabelName, color: newLabelColor });
      setNewLabelName('');
      setShowNewLabelForm(false);
    }
  };

  const colorPalette = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#d946ef', '#ec4899', '#f43f5e',
  ];

  return (
    <div>
      <h4 className="font-semibold mb-2">Labels</h4>
      <div className="flex flex-wrap gap-2 mb-2">
        {assignedLabels.map(labelId => {
          const label = projectLabels.find(l => l._id === labelId);
          if (!label) return null;
          return (
            <span key={label._id} style={{ backgroundColor: label.color }} className="px-2 py-1 rounded text-white text-xs">
              {label.name}
            </span>
          );
        })}
      </div>
      <div className="border-t pt-2">
        <h5 className="text-sm font-medium mb-2">Available Labels</h5>
        <div className="flex flex-wrap gap-1">
          {projectLabels.map(label => (
            <div
              key={label._id}
              onClick={() => onLabelToggle(label._id)}
              className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <input
                type="checkbox"
                checked={assignedLabels.includes(label._id)}
                readOnly
                className="form-checkbox h-4 w-4"
              />
              <span style={{ backgroundColor: label.color }} className="px-2 py-0.5 rounded text-white text-xs">
                {label.name}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2">
          {showNewLabelForm ? (
            <div className="p-2 border rounded">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="New label name"
                className="w-full p-1 border rounded mb-2"
              />
              <div className="flex flex-wrap gap-1 mb-2">
                {colorPalette.map(color => (
                  <div
                    key={color}
                    onClick={() => setNewLabelColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full cursor-pointer ${newLabelColor === color ? 'ring-2 ring-offset-2' : ''}`}
                  />
                ))}
              </div>
               <div className="flex items-center">
                <input
                  type="color"
                  value={newLabelColor}
                  onChange={(e) => setNewLabelColor(e.target.value)}
                  className="w-8 h-8"
                />
                <span className="ml-2 text-sm">{newLabelColor}</span>
              </div>
              <div className="mt-2">
                <button onClick={handleCreateLabel} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Create</button>
                <button onClick={() => setShowNewLabelForm(false)} className="ml-2 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNewLabelForm(true)} className="text-sm w-full text-left p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
              + Create a new label
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

LabelManager.propTypes = {
  projectLabels: PropTypes.array.isRequired,
  assignedLabels: PropTypes.array.isRequired,
  onLabelToggle: PropTypes.func.isRequired,
  onNewLabel: PropTypes.func.isRequired,
};

export default LabelManager;
