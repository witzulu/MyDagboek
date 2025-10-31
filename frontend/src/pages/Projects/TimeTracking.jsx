import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import TimeEntryModal from '../../components/TimeEntry/TimeEntryModal';

const TimeTracking = () => {
  const { projectId } = useParams();
  const [timeEntries, setTimeEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const fetchTimeEntries = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/${projectId}/time-entries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch time entries');
      }
      const data = await res.json();
      setTimeEntries(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load time entries.');
      setTimeEntries([]); // Ensure timeEntries is an array on error
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchTimeEntries();
    }
  }, [projectId, fetchTimeEntries]);

  const handleSave = () => {
    fetchTimeEntries(); // Re-fetch entries after saving
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/time-entries/${entryId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('Failed to delete time entry');
        }
        toast.success('Time entry deleted.');
        fetchTimeEntries(); // Refresh the list
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete time entry.');
      }
    }
  };

  // Defensive check for timeEntries
  if (!Array.isArray(timeEntries)) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Time Tracking</h1>
        <button
          onClick={() => {
            setSelectedEntry(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          Add Manual Entry
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Task</th>
              <th>Date</th>
              <th>Duration (HH:MM)</th>
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timeEntries.map((entry) => (
              <tr key={entry._id}>
                <td>{entry.task?.title || 'N/A'}</td>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>{`${Math.floor(entry.duration / 60)
                  .toString()
                  .padStart(2, '0')}:${(entry.duration % 60)
                  .toString()
                  .padStart(2, '0')}`}</td>
                <td>{entry.note}</td>
                <td>
                  <button
                    onClick={() => handleEdit(entry)}
                    className="btn btn-ghost btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="btn btn-ghost btn-sm text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <TimeEntryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          projectId={projectId}
          timeEntry={selectedEntry}
        />
      )}
    </div>
  );
};

export default TimeTracking;