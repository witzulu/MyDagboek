import { useState } from 'react';
import PropTypes from 'prop-types';
import { useProject } from '../hooks/useProject';
import { X } from 'lucide-react';

export default function ErrorReports({ errorReports, parseErrorReport, updateErrorReport, deleteErrorReport, getSeverityColor, getStatusColor }) {
  const { selectedProject } = useProject();
  const [selectedError, setSelectedError] = useState(null);
  const [errorUploadText, setErrorUploadText] = useState('');

  return (
    <div>
      <div className="flex items-center justify-between mb-6  w-full">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            {selectedProject ? `${selectedProject.name}: Error Reports` : 'Error Reports'}
        </h2>
        <button
          onClick={() => {
            const example = JSON.stringify({
              timestamp: new Date().toISOString(),
              severity: "high",
              errorType: "TypeError",
              message: "Cannot read property 'data' of undefined",
              stackTrace: "at getData (app.js:45)\\nat processRequest (handler.js:120)",
              environment: "production",
              userAgent: "Chrome 118.0",
              userId: "user_12345"
            }, null, 2);
            setErrorUploadText(example);
          }}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm transition-colors"
        >
          Load Example
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold mb-4 text-slate-800 dark:text-white">Import Error Report (JSON)</h3>
          <textarea
            value={errorUploadText}
            onChange={(e) => setErrorUploadText(e.target.value)}
            placeholder='Paste JSON error report here...'
            className="w-full h-48 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg p-4 text-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          />
          <button
            onClick={() => parseErrorReport(errorUploadText)}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
          >
            Import Error Report
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-semibold mb-4 text-slate-800 dark:text-white">Statistics</h3>
          <div className="space-y-3">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Total Reports</p>
              <p className="text-2xl font-bold">{errorReports.length}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Open</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{errorReports.filter(e => e.status === 'open').length}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Investigating</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{errorReports.filter(e => e.status === 'investigating').length}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Fixed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{errorReports.filter(e => e.status === 'fixed').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold mb-4 text-slate-800 dark:text-white">All Error Reports</h3>
        <div className="space-y-3">
          {errorReports.map(error => (
            <div
              key={error.id}
              onClick={() => setSelectedError(error)}
              className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(error.severity)}`}>
                      {error.severity}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(error.status)}`}>
                      {error.status}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                      {error.environment}
                    </span>
                  </div>
                  <h4 className="font-medium text-lg text-slate-800 dark:text-white">{error.errorType}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{error.message}</p>
                </div>
                <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                  <p>{new Date(error.timestamp).toLocaleString()}</p>
                  {error.assignedTo && <p className="mt-1">Assigned: {error.assignedTo}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedError(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedError.errorType}</h2>
              <button
                onClick={() => setSelectedError(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded text-sm ${getSeverityColor(selectedError.severity)}`}>
                  {selectedError.severity}
                </span>
                <select
                  value={selectedError.status}
                  onChange={(e) => updateErrorReport(selectedError.id, { status: e.target.value })}
                  className={`px-3 py-1 rounded text-sm ${getStatusColor(selectedError.status)} bg-slate-100 dark:bg-slate-700 border-none outline-none`}
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="fixed">Fixed</option>
                  <option value="closed">Closed</option>
                </select>
                <span className="px-3 py-1 rounded text-sm bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                  {selectedError.environment}
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Error Message</p>
                <p className="text-slate-800 dark:text-white">{selectedError.message}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Stack Trace</p>
                <pre className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-300 overflow-x-auto">
                  {selectedError.stackTrace}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Timestamp</p>
                  <p className="text-slate-800 dark:text-white">{new Date(selectedError.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">User Agent</p>
                  <p className="text-slate-800 dark:text-white">{selectedError.userAgent}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">User ID</p>
                  <p className="text-slate-800 dark:text-white">{selectedError.userId}</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Assign To</label>
                  <input
                    type="text"
                    value={selectedError.assignedTo || ''}
                    onChange={(e) => updateErrorReport(selectedError.id, { assignedTo: e.target.value })}
                    placeholder="Assign developer..."
                    className="w-full px-3 py-2 bg-slate-100/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedError.reproduced}
                    onChange={(e) => updateErrorReport(selectedError.id, { reproduced: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-slate-500 dark:text-slate-400">Error Reproduced</label>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400 mb-2">Investigation Notes</label>
                <textarea
                  value={selectedError.notes}
                  onChange={(e) => updateErrorReport(selectedError.id, { notes: e.target.value })}
                  placeholder="Add notes about investigation, fixes, etc..."
                  className="w-full h-32 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg p-3 text-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this error report?')) {
                    deleteErrorReport(selectedError.id);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ErrorReports.propTypes = {
  errorReports: PropTypes.array.isRequired,
  parseErrorReport: PropTypes.func.isRequired,
  updateErrorReport: PropTypes.func.isRequired,
  deleteErrorReport: PropTypes.func.isRequired,
  getSeverityColor: PropTypes.func.isRequired,
  getStatusColor: PropTypes.func.isRequired,
};
