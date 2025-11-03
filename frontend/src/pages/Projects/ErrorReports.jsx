import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { AlertTriangle } from 'lucide-react';
import CreateErrorReportModal from '../../components/CreateErrorReportModal';
import toast from 'react-hot-toast';

const ErrorReports = () => {
  const { projectId } = useParams();
  const [errorReports, setErrorReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const [reportsData, membersData] = await Promise.all([
          api(`/projects/${projectId}/errors`),
          api(`/projects/${projectId}/members`),
        ]);
        setErrorReports(reportsData);
        setProjectMembers(membersData);
      } catch (err) {
        setError('Failed to load page data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchPageData();
    }
  }, [projectId]);

  const handleSaveReport = async (reportData) => {
    try {
      if (reportData._id) {
        // Update existing report
        const updatedReport = await api(`/errors/${reportData._id}`, {
          method: 'PUT',
          body: reportData,
        });
        setErrorReports((prevReports) =>
          prevReports.map((r) => (r._id === updatedReport._id ? updatedReport : r))
        );
        toast.success('Error report updated successfully!');
      } else {
        // Create new report
        const newReport = await api(`/projects/${projectId}/errors`, {
          method: 'POST',
          body: reportData,
        });
        setErrorReports((prevReports) => [...prevReports, newReport]);
        toast.success('Error report created successfully!');
      }
    } catch (err) {
      toast.error(`Failed to ${reportData._id ? 'update' : 'create'} error report.`);
      console.error(err);
    }
  };

  const openEditModal = (report) => {
    setEditingReport(report);
    setIsModalOpen(true);
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'badge-error';
      case 'High':
        return 'badge-warning';
      case 'Medium':
        return 'badge-info';
      case 'Low':
        return 'badge-success';
      case 'Trivial':
        return 'badge-ghost';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New':
        return 'badge-primary';
      case 'In Progress':
        return 'badge-info';
      case 'Resolved':
        return 'badge-success';
      case 'Verified':
        return 'badge-accent';
      case 'Closed':
        return 'badge-ghost';
      default:
        return 'badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold flex items-center">
          <AlertTriangle className="mr-3 text-error" />
          Error Reports
        </h2>
        <button
          onClick={() => {
            setEditingReport(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          New Report
        </button>
      </div>

      <CreateErrorReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveReport}
        report={editingReport}
        projectMembers={projectMembers}
      />

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Reported By</th>
              <th>Assigned To</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {errorReports.length > 0 ? (
              errorReports.map((report) => (
                <tr key={report._id} className="hover">
                  <td>{report.title}</td>
                  <td>
                    <span className={`badge ${getSeverityBadge(report.severity)}`}>
                      {report.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>{report.createdBy?.name || 'N/A'}</td>
                  <td>
                    <div className="avatar-group -space-x-6">
                      {report.assignedTo && report.assignedTo.length > 0 ? (
                        report.assignedTo.map(assignee => (
                          assignee && typeof assignee.name === 'string' ? (
                            <div key={assignee._id} className="tooltip" data-tip={assignee.name}>
                              <div className="avatar">
                                <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs">
                                  {assignee.name.charAt(0)}
                                </div>
                              </div>
                            </div>
                          ) : null
                        ))
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </td>
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => openEditModal(report)}
                      className="btn btn-ghost btn-xs"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No error reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ErrorReports;
