import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas'; // Still needed for charts
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const ProgressReports = () => {
  const { projectId } = useParams();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [project, setProject] = useState({ name: 'Project' }); // Placeholder

  const pieChartRef = useRef();
  const barChartRef = useRef();
  const burndownChartRef = useRef();

  // Fetch project details separately if needed, for now using placeholder
  // useEffect(() => { ... fetch project name ... }, [projectId]);

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
    if (!report) return;
    setIsExporting(true);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    let yPos = margin;

    // 1. Add Title
    pdf.setFontSize(22);
    pdf.text(`${project.name} - Progress Report`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    pdf.setFontSize(14);
    pdf.text(`Period: ${startDate || 'Start'} to ${endDate || 'End'}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // 2. Add Stats Table
    const tableData = [
      ["Tasks Created", report.tasksCreated],
      ["Tasks Completed", report.tasksCompleted],
      ["Tasks Overdue", report.tasksOverdue],
      ["Tasks In Progress", report.tasksInProgress],
    ];
    autoTable(pdf, {
      head: [['Metric', 'Value']],
      body: tableData,
      startY: yPos,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
    });
    yPos = pdf.lastAutoTable.finalY + 15;

    // 3. Add Charts as Images
    const addChartToPdf = async (elementRef, title) => {
      if (elementRef.current) {
        try {
          // Use html2canvas to render the chart to a canvas
          const canvas = await html2canvas(elementRef.current, {
            backgroundColor: null, // Use transparent background
            scale: 2 // Increase resolution
          });
          const imgData = canvas.toDataURL('image/png');
          const imgProps = pdf.getImageProperties(imgData);
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

          if (yPos + imgHeight + 10 > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
          }

          pdf.setFontSize(16);
          pdf.text(title, margin, yPos);
          yPos += 8;

          pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 10;
        } catch (e) {
          console.error(`Failed to capture chart: ${title}`, e);
          // Add a placeholder text if chart capture fails
          pdf.setFontSize(12);
          pdf.setTextColor(255, 0, 0); // Red color for error
          pdf.text(`Could not render chart: ${title}`, margin, yPos);
          pdf.setTextColor(0, 0, 0);
          yPos += 10;
        }
      }
    };

    if (report.pieChartData && report.pieChartData.done + report.pieChartData.inProgress + report.pieChartData.toDo > 0) {
        await addChartToPdf(pieChartRef, 'Task Status Distribution');
    }
    if (report.barChartData && report.barChartData.length > 0) {
        await addChartToPdf(barChartRef, 'Tasks Completed Per Day');
    }
    if (report.burndownChartData && report.burndownChartData.length > 0) {
        await addChartToPdf(burndownChartRef, 'Burndown Chart');
    }

    pdf.save(`progress-report-${project.name}.pdf`);
    setIsExporting(false);
  };

  const handleExportMarkdown = () => {
    if (!report) return;

    const md = `
# ${project.name} - Progress Report
## Period: ${startDate || 'Start'} to ${endDate || 'End'}

| Metric              | Value |
| ------------------- | ----- |
| Tasks Created       | ${report.tasksCreated} |
| Tasks Completed     | ${report.tasksCompleted} |
| Tasks Overdue       | ${report.tasksOverdue} |
| Tasks In Progress   | ${report.tasksInProgress} |
`;

    const blob = new Blob([md.trim()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-report-${project.name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pieData = report?.pieChartData ? [
    { name: 'Done', value: report.pieChartData.done },
    { name: 'In Progress', value: report.pieChartData.inProgress },
    { name: 'To-Do', value: report.pieChartData.toDo },
  ].filter(item => item.value > 0) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

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
          <>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="self-end px-4 py-2 rounded-md bg-secondary text-secondary-content disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export to PDF'}
            </button>
            <button
              onClick={handleExportMarkdown}
              className="self-end px-4 py-2 rounded-md bg-accent text-accent-content"
            >
              Export to Markdown
            </button>
          </>
        )}
      </div>

      {error && <div className="text-red-500">Error: {error}</div>}

      {report && (
        <div id="report-content-wrapper" className="bg-base-100 p-4 rounded-lg">
          {/* This container is now for on-screen display only. PDF is generated from data. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Tasks Created" value={report.tasksCreated} />
            <StatCard title="Tasks Completed" value={report.tasksCompleted} />
            <StatCard title="Tasks Overdue" value={report.tasksOverdue} />
            <StatCard title="Tasks In Progress" value={report.tasksInProgress} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {pieData.length > 0 && (
                <div ref={pieChartRef} className="bg-base-200 p-6 rounded-lg shadow-md">
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

              {report.barChartData && (
                <div ref={barChartRef} className="bg-base-200 p-6 rounded-lg shadow-md">
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

          {report.burndownChartData && report.burndownChartData.length > 0 && (
            <div ref={burndownChartRef} className="mt-8 bg-base-200 p-6 rounded-lg shadow-md">
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
      )}
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-base-300 p-6 rounded-lg shadow-md">
    <h3 className="text-lg font-medium text-base-content-secondary">{title}</h3>
    <p className="text-4xl font-bold mt-2">{value}</p>
  </div>
);

export default ProgressReports;
