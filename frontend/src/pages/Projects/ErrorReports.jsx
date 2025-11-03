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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchErrorReports = async () => {
      try {
        setLoading(true);
        const data = await api(`/projects/${projectId}/errors`);
        setErrorReports(data);
      } catch (err) {
        setError('Failed to load error reports.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchErrorReports();
    }
  }, [projectId]);

  const handleSaveReport = async (reportData) => {
    try {
      const newReport = await api.post(`/projects/${projectId}/errors`, reportData);
      setErrorReports((prevReports) => [...prevReports, newReport]);
      toast.success('Error report created successfully!');
    } catch (err) {
      toast.error('Failed to create error report.');
      console.error(err);
    }
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
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          New Report
        </button>
      </div>

      <CreateErrorReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveReport}
      />

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Reported By</th>
              <th>Date</th>
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
                  <td>{report.createdBy?.username || 'N/A'}</td>
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
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
