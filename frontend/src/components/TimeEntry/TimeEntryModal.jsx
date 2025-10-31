
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const TimeEntryModal = ({ isOpen, onClose, onSave, projectId, timeEntry, task = null }) => {
  const [formData, setFormData] = useState({
    task: '',
    date: new Date().toISOString().split('T')[0],
    duration: '00:00',
    note: '',
  });
  const [projectTasks, setProjectTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (projectId) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/projects/${projectId}/tasks`, {
             headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to fetch tasks');
          const data = await res.json();
          setProjectTasks(data);
        } catch (error) {
          console.error("Could not fetch project tasks:", error);
          toast.error("Could not load tasks for project.");
        }
      }
    };
    fetchTasks();
  }, [projectId]);

  useEffect(() => {
    if (timeEntry) {
      // Editing existing entry
      setFormData({
        task: timeEntry.task?._id || '',
        date: new Date(timeEntry.date).toISOString().split('T')[0],
        duration: `${Math.floor(timeEntry.duration / 60)
          .toString()
          .padStart(2, '0')}:${(timeEntry.duration % 60).toString().padStart(2, '0')}`,
        note: timeEntry.note || '',
      });
    } else if (task) {
      // Creating new entry from a specific task
      setFormData({
        task: task._id,
        date: new Date().toISOString().split('T')[0],
        duration: '00:00',
        note: '',
      });
    } else {
      // Creating a new manual entry
      setFormData({
        task: '',
        date: new Date().toISOString().split('T')[0],
        duration: '00:00',
        note: '',
      });
    }
  }, [timeEntry, task, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [hours, minutes] = formData.duration.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;

    const payload = {
      date: formData.date,
      duration: totalMinutes,
      note: formData.note,
      project: projectId,
    };

    if (formData.task) {
      payload.task = formData.task;
    }

    const url = timeEntry ? `/api/time-entries/${timeEntry._id}` : `/api/projects/${projectId}/time-entries`;
    const method = timeEntry ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save time entry');
      }

      toast.success('Time entry saved.');
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save time entry.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{timeEntry ? 'Edit' : 'Log'} Time</h3>
        <div className="py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
              <span className="label-text">Task</span>
            </label>
            <select
              name="task"
              value={formData.task}
              onChange={handleChange}
              className="select select-bordered"
              disabled={!!task} // Disable if adding time from a specific task card
            >
              <option value="">Select a task (optional)</option>
              {projectTasks.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Date</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Duration (HH:MM)</span>
            </label>
            <input
              type="time"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Note</span>
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="textarea textarea-bordered"
            />
          </div>
          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default TimeEntryModal;
