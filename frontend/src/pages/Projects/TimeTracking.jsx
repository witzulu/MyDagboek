import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TimeEntryModal from '../../components/TimeEntry/TimeEntryModal';

const TimeTracking = () => {
  const { projectId } = useParams();
  const [timeEntries, setTimeEntries] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [days, setDays] = useState(30);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);

  useEffect(() => {
    const fetchProjectTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/projects/${projectId}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch project tasks');
        }
        const data = await res.json();
        setProjectTasks(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load project tasks for the dropdown.');
      }
    };

    if (projectId) {
      fetchProjectTasks();
    }
  }, [projectId]);

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

  const fetchSummaryData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/projects/${projectId}/time-entries/summary?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch summary data');
      }
      const data = await res.json();
      setSummaryData(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load summary data.');
    }
  }, [projectId, days]);

  useEffect(() => {
    if (projectId) {
      fetchTimeEntries();
      fetchSummaryData();
    }
  }, [projectId, fetchTimeEntries, fetchSummaryData]);

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
    <div className="p-6 w-full">
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

      <div className="mb-8 p-4 border rounded-lg bg-base-100 w-full">
        <h2 className="text-xl font-bold mb-4">Daily Summary</h2>
        <div className="flex space-x-2 mb-4">
            <button onClick={() => setDays(7)} className={`btn btn-sm ${days === 7 ? 'btn-primary' : ''}`}>Last 7 Days</button>
            <button onClick={() => setDays(30)} className={`btn btn-sm ${days === 30 ? 'btn-primary' : ''}`}>Last 30 Days</button>
        </div>
        {summaryData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p>No time entries recorded for the selected period.</p>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summaryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${Math.floor(value / 60)}h ${value % 60}m`} />
            <Legend />
            <Bar dataKey="totalDuration" fill="#8884d8" name="Total Duration (minutes)" />
          </BarChart>
        </ResponsiveContainer>
        )}
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
                <td>
                  {entry.task ? (
                    <Link to={`/projects/${projectId}/boards/${entry.task.board}?highlight=${entry.task._id}`} className="hover:underline">
                      {entry.task.title}
                    </Link>
                  ) : (
                    'N/A'
                  )}
                </td>
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
          projectTasks={projectTasks}
        />
      )}
    </div>
  );
};

export default TimeTracking;