import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const ProgressReports = () => {
  const { projectId } = useParams();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      setReport(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const queryParams = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await fetch(`/api/projects/${projectId}/progress-report?${queryParams}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.status}`);
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!report) return;

    let csvContent = "Metric,Value\n";
    csvContent += `Tasks Created,${report.tasksCreated}\n`;
    csvContent += `Tasks Completed,${report.tasksCompleted}\n`;
    csvContent += `Tasks Overdue,${report.tasksOverdue}\n`;
    csvContent += `Tasks In Progress,${report.tasksInProgress}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Progress Reports</h2>

      <div className="flex items-center space-x-4 mb-6 p-4 bg-base-200 rounded-lg">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full p-2 rounded border bg-base-100"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full p-2 rounded border bg-base-100"
          />
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="self-end px-4 py-2 rounded-md bg-primary text-primary-content disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        {report && (
          <button
            onClick={handleExportCSV}
            className="self-end px-4 py-2 rounded-md bg-info text-info-content"
          >
            Export to CSV
          </button>
        )}
      </div>

      {error && <div className="text-red-500">Error: {error}</div>}

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Tasks Created" value={report.tasksCreated} />
          <StatCard title="Tasks Completed" value={report.tasksCompleted} />
          <StatCard title="Tasks Overdue" value={report.tasksOverdue} />
          <StatCard title="Tasks In Progress" value={report.tasksInProgress} />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-base-200 p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-medium text-base-content-secondary">{title}</h3>
    <p className="text-4xl font-bold mt-2">{value}</p>
  </div>
);

export default ProgressReports;
