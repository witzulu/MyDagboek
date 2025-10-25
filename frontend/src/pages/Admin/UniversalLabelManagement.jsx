import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const UniversalLabelManagement = () => {
  const [labels, setLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#ff0000');

  const colorPalette = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#d946ef', '#ec4899', '#f43f5e',
  ];

  const fetchLabels = async () => {
    try {
      setIsLoading(true);
      const fetchedLabels = await api('/admin/labels');
      setLabels(fetchedLabels);
    } catch (err) {
      setError('Failed to fetch labels');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  const handleCreate = async () => {
    if (!newLabelName.trim()) return;
    try {
      const newLabel = await api('/admin/labels', {
        method: 'POST',
        body: { name: newLabelName, color: newLabelColor },
      });
      setLabels([...labels, newLabel]);
      setNewLabelName('');
      setNewLabelColor('#ff0000');
    } catch (err) {
      setError('Failed to create label');
    }
  };

  const handleUpdate = async (labelId) => {
    try {
      const updatedLabel = await api(`/admin/labels/${labelId}`, {
        method: 'PUT',
        body: { name: editingLabel.name, color: editingLabel.color },
      });
      await fetchLabels(); // Refetch all labels to see the "detach" effect
      setEditingLabel(null);
    } catch (err) {
      setError('Failed to update label');
    }
  };

  const handleDelete = async (labelId) => {
    if (window.confirm('Are you sure you want to delete this universal label? This will convert it to a project-specific label in all projects where it is used.')) {
      try {
        await api(`/admin/labels/${labelId}`, { method: 'DELETE' });
        setLabels(labels.filter(l => l._id !== labelId));
      } catch (err) {
        setError('Failed to delete label');
      }
    }
  };

  const startEdit = (label) => {
    setEditingLabel({ ...label });
  };

  if (isLoading) return <p>Loading labels...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="font-semibold text-lg mb-2">Create New Universal Label</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="Label name"
            className="p-2 border rounded"
          />
          <div className="flex items-center gap-2">
             {colorPalette.map(color => (
                <div
                  key={color}
                  onClick={() => setNewLabelColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-6 h-6 rounded-full cursor-pointer ${newLabelColor === color ? 'ring-2 ring-offset-2' : ''}`}
                />
              ))}
              <input
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                className="w-8 h-8"
              />
          </div>
          <button onClick={handleCreate} className="px-4 py-2 bg-blue-500 text-white rounded">Create</button>
        </div>
      </div>

      <div className="space-y-2">
        {labels.map(label => (
          <div key={label._id} className="flex items-center justify-between p-2 border rounded-lg">
            {editingLabel && editingLabel._id === label._id ? (
              <div className="flex-1 flex items-center gap-4">
                <input
                  type="text"
                  value={editingLabel.name}
                  onChange={(e) => setEditingLabel({ ...editingLabel, name: e.target.value })}
                  className="p-1 border rounded"
                />
                <input
                  type="color"
                  value={editingLabel.color}
                  onChange={(e) => setEditingLabel({ ...editingLabel, color: e.target.value })}
                  className="w-8 h-8"
                />
                <button onClick={() => handleUpdate(label._id)} className="px-3 py-1 bg-green-500 text-white rounded text-sm">Save</button>
                <button onClick={() => setEditingLabel(null)} className="text-sm">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span style={{ backgroundColor: label.color }} className="px-3 py-1 rounded text-white text-sm">
                  {label.name}
                </span>
                <div>
                  <button onClick={() => startEdit(label)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm">Edit</button>
                  <button onClick={() => handleDelete(label._id)} className="ml-2 px-3 py-1 bg-red-500 text-white rounded-md text-sm">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UniversalLabelManagement;
