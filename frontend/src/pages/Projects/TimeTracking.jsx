
import React, { useState, useEffect } from 'react';

const TimeTracking = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [note, setNote] = useState('');
  const [timeEntries, setTimeEntries] = useState([]);

  useEffect(() => {
    // Fetch projects
    const fetchProjects = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    // Fetch tasks for selected project
    if (selectedProject) {
      const fetchTasks = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/projects/${selectedProject}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTasks(data);
      };
      fetchTasks();
    }
  }, [selectedProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await fetch('/api/time-entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        project: selectedProject,
        task: selectedTask,
        date,
        duration,
        note,
      }),
    });
    // Clear form
    setSelectedProject('');
    setSelectedTask('');
    setDate('');
    setDuration('');
    setNote('');
    fetchTimeEntries();
  };

  const fetchTimeEntries = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/time-entries', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTimeEntries(data);
  };

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Time Tracking</h1>
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-2 rounded border"
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Task</label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full p-2 rounded border"
              disabled={!selectedProject}
            >
              <option value="">Select a task</option>
              {tasks.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 rounded border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2 rounded border"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2 rounded border"
          />
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Log Time
        </button>
      </form>
      <div>
        <h2 className="text-xl font-bold mb-4">Time Entries</h2>
        <div className="space-y-4">
          {timeEntries.map((entry) => (
            <div key={entry._id} className="p-4 border rounded-lg">
              <div className="flex justify-between">
                <div>
                  <p className="font-bold">{entry.project.name} - {entry.task.title}</p>
                  <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                  <p className="text-sm">{entry.duration} minutes</p>
                  <p className="text-sm italic">{entry.note}</p>
                </div>
                <div>
                  <button className="text-sm text-blue-500">Edit</button>
                  <button className="ml-4 text-sm text-red-500">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;
