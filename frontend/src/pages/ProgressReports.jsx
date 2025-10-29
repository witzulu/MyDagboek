import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const ProgressReports = () => {
  const { projectId } = useParams();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const statsRef = useRef();
  const pieChartRef = useRef();
  const barChartRef = useRef();
  const burndownChartRef = useRef();
  const changelogRef = useRef();

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

  const handleExportPDF = async () => {
    setIsExporting(true);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    let yPos = margin;

    pdf.setFontSize(20);
    pdf.text('Progress Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    pdf.setFontSize(12);
    pdf.text(`Period: ${startDate} to ${endDate}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    const captureElement = async (element, title) => {
        if (!element) return;

        // Temporarily change background for capture
        const originalBg = element.style.backgroundColor;
        element.style.backgroundColor = 'white'; // Or any non-transparent color

        const canvas = await html2canvas(element);

        // Restore original background
        element.style.backgroundColor = originalBg;

        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        if (yPos + imgHeight > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
        }

        pdf.setFontSize(16);
        pdf.text(title, margin, yPos);
        yPos += 8;

        pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 15;
    };

    // --- Add Changelog Table ---
    if (report && report.changelogEntries && report.changelogEntries.length > 0) {
        if (yPos + 20 > pageHeight - margin) { // Check if space for header
            pdf.addPage();
            yPos = margin;
        }
        pdf.setFontSize(16);
        pdf.text('Change Log', margin, yPos);
        yPos += 8;

        pdf.autoTable({
            startY: yPos,
            head: [['Date', 'User', 'Change']],
            body: report.changelogEntries.map(entry => [
                new Date(entry.createdAt).toLocaleDateString(),
                entry.user ? entry.user.name : 'System',
                entry.message
            ]),
            theme: 'striped',
             headStyles: { fillColor: [22, 160, 133] },
        });
        yPos = pdf.autoTable.previous.finalY + 15;
    }


    await captureElement(statsRef.current, 'Summary');
    await captureElement(pieChartRef.current, 'Task Status Distribution');
    await captureElement(barChartRef.current, 'Tasks Completed Per Day');
    await captureElement(burndownChartRef.current, 'Burndown Chart');

    pdf.save('progress-report.pdf');
    setIsExporting(false);
  };

  const pieData = report?.pieChartData ? [
    { name: 'Done', value: report.pieChartData.done },
    { name: 'In Progress', value: report.pieChartData.inProgress },
    { name: 'To-Do', value: report.pieChartData.toDo },
  ].filter(item => item.value > 0) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
        <div className="p-6  w-full">

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
              onClick={handleExportPDF}
              disabled={isExporting}
              className="self-end px-4 py-2 rounded-md bg-secondary text-secondary-content disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export to PDF'}
            </button>
        )}
      </div>

      {error && <div className="text-red-500">Error: {error}</div>}

      {report && (
        <div>
          <div id="report-content">
            <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-base-200 p-6 rounded-lg">
              <StatCard title="Tasks Created" value={report.tasksCreated} />
              <StatCard title="Tasks Completed" value={report.tasksCompleted} />
              <StatCard title="Tasks Overdue" value={report.tasksOverdue} />
              <StatCard title="Tasks In Progress" value={report.tasksInProgress} />
            </div>

            {report.changelogEntries && report.changelogEntries.length > 0 && (
              <div ref={changelogRef} className="mt-8 bg-base-200 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Change Log Summary</h3>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.changelogEntries.map(entry => (
                        <tr key={entry._id}>
                          <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                           <td>{entry.user ? entry.user.name : 'System'}</td>
                          <td>{entry.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <div ref={pieChartRef}>
                {pieData.length > 0 && (
                  <div className="bg-base-200 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">Task Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <div ref={barChartRef}>
                {report.barChartData && (
                  <div className="bg-base-200 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">Tasks Completed Per Day</h3>
                    {report.barChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={report.barChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#8884d8" name="Tasks Completed" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px]">
                        <p className="text-base-content-secondary">No tasks were completed in this period.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div ref={burndownChartRef} className="mt-8">
              {report.burndownChartData && report.burndownChartData.length > 0 && (
                <div className="bg-base-200 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4">Burndown Chart</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={report.burndownChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="remaining" stroke="#8884d8" name="Remaining Tasks" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-base-100 p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-medium text-base-content-secondary">{title}</h3>
    <p className="text-4xl font-bold mt-2">{value}</p>
  </div>
);

export default ProgressReports;
