import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value }) => (
  <div className="bg-base-100 p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-medium text-base-content-secondary">{title}</h3>
    <p className="text-4xl font-bold mt-2">{value}</p>
  </div>
);

const ReportDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found.");

        const response = await fetch('/api/reports/dashboard', {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Failed to fetch dashboard data: ${response.status}`);

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6 w-full">
      <h2 className="text-3xl font-bold mb-6">Reports Dashboard</h2>

      {dashboardData && (
        <>
          {/* Global Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-base-200 p-6 rounded-lg">
            <StatCard title="Total Tasks Created" value={dashboardData.globalStats.totalTasksCreated} />
            <StatCard title="Total Tasks Completed" value={dashboardData.globalStats.totalTasksCompleted} />
            <StatCard title="Total Tasks Overdue" value={dashboardData.globalStats.totalTasksOverdue} />
            <StatCard title="Total Tasks In Progress" value={dashboardData.globalStats.totalTasksInProgress} />
          </div>

          {/* Projects Overview */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-base-200 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Projects Completion</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.projects}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completionPercentage" fill="#8884d8" name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-base-200 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Projects List</h3>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Tasks</th>
                      <th>Completed</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.projects.map(project => (
                      <tr key={project._id}>
                        <td><Link to={`/projects/${project._id}`} className="link link-hover">{project.name}</Link></td>
                        <td>{project.taskCount}</td>
                        <td>{project.completedTaskCount}</td>
                        <td>
                          <progress
                            className="progress progress-primary w-56"
                            value={project.completionPercentage}
                            max="100"
                          ></progress>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportDashboard;
