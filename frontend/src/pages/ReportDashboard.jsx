import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const StatCard = ({ title, value, change }) => (
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
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("Authentication token not found.");
                }

                const response = await fetch('/api/reports/dashboard', {
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Failed to fetch dashboard data:", errorText);
                    throw new Error(`Failed to fetch dashboard data: ${response.status}`);
                }

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
        return <div className="p-6"><span className="loading loading-spinner"></span> Loading dashboard...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">Error: {error}</div>;
    }

    if (!dashboardData) {
        return <div className="p-6">No dashboard data available.</div>;
    }

    const { completionTrend, totalOverdue, recentAchievements } = dashboardData;

    return (
        <div className="p-6 w-full">
            <h2 className="text-3xl font-bold mb-6">Reports Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Overdue Tasks" value={totalOverdue} />
            </div>

            <div className="mt-8">
                <div className="bg-base-200 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">Task Completion Trend (Last 14 Days)</h3>
                    {completionTrend && completionTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={completionTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis allowDecals={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Tasks Completed" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px]">
                            <p className="text-base-content-secondary">No task completion data available for this period.</p>
                        </div>
                    )}
                </div>
            </div>

            {recentAchievements && recentAchievements.length > 0 && (
                <div className="mt-8 bg-base-200 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Recent Achievements</h3>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Project</th>
                                    <th>User</th>
                                    <th>Achievement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAchievements.map(entry => (
                                    <tr key={entry._id}>
                                        <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                                        <td>{entry.project ? entry.project.name : 'N/A'}</td>
                                        <td>{entry.user ? entry.user.name : 'System'}</td>
                                        <td>{entry.title || entry.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportDashboard;
