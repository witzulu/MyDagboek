import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import NotebookList from '../components/notebook/NotebookList';

const NotebookPage = () => {
  const { projectId } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await api(`/projects/${projectId}/notes?search=${searchTerm}`);
        setNotes(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
        fetchNotes();
    }, 500);

    return () => {
        clearTimeout(handler);
    };
  }, [projectId, searchTerm]);

  const handleCreateNote = async () => {
    try {
      const data = await api(`/projects/${projectId}/notes`, {
        method: 'POST',
        body: { title: 'New Note' },
      });
      setNotes([...notes, data]);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notebook</h1>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md bg-transparent"
          />
          <button
            onClick={handleCreateNote}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            New Note
          </button>
        </div>
      </div>
      <NotebookList notes={notes} setNotes={setNotes} />
    </div>
  );
};

export default NotebookPage;
