import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

const DependencySelectionModal = ({ isOpen, onClose, onAddDependency, projectId, currentTask }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const getToken = () => localStorage.getItem('token');

  const debouncedSearch = useCallback(debounce(async (term) => {
    if (term && projectId) {
      const res = await fetch(`/api/projects/${projectId}/tasks/search?term=${term}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Filter out the current task from the search results
        setSearchResults(data.filter(task => task._id !== currentTask._id));
      }
    } else {
      setSearchResults([]);
    }
  }, 300), [projectId, currentTask]);

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-base-200/50 flex justify-center items-center z-50">
      <div className="bg-base-300 p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Add Dependency</h2>
        <input
          type="text"
          placeholder="Search for a task..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded border bg-base-100"
        />
        <ul className="menu bg-base-100 w-full rounded-box mt-4 max-h-60 overflow-y-auto">
          {searchResults.map(task => (
            <li key={task._id}>
              <div className="flex justify-between items-center">
                <span>{task.title}</span>
                <div>
                  <button onClick={() => onAddDependency(task._id, 'dependsOn')} className="btn btn-xs btn-primary mr-2">Depends On</button>
                  <button onClick={() => onAddDependency(task._id, 'blocking')} className="btn btn-xs btn-secondary">Blocking</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-right">
          <button onClick={onClose} className="btn">Close</button>
        </div>
      </div>
    </div>
  );
};

export default DependencySelectionModal;
