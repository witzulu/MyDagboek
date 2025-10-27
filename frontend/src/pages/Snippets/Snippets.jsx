import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import SnippetEditorModal from './SnippetEditorModal';

const getLanguageExtension = (language) => {
  if (!language || typeof language !== 'string') return javascript({ jsx: true }); // default fallback

  switch (language.toLowerCase()) {
    case 'python':
      return python();
    case 'html':
      return html();
    case 'javascript':
    default:
      return javascript({ jsx: true });
  }
};


const Snippets = () => {
  const { projectId } = useParams();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);

  useEffect(() => {
    const fetchSnippets = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/projects/${projectId}/snippets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch snippets');
        }
        const data = await res.json();
       setSnippets(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSnippets();
  }, [projectId]);

  if (loading) return <div>Loading snippets...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const handleSaveSnippet = async ({ title, description, code, language, tags, snippetId }) => {
    const url = snippetId ? `/api/projects/${projectId}/snippets/${snippetId}` : `/api/projects/${projectId}/snippets`;
    const method = snippetId ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, code, language, tags }),
      });

      if (!response.ok) {
        throw new Error('Failed to save snippet');
      }

      const savedSnippet = await response.json();

      if (snippetId) {
        setSnippets(snippets.map(s => s._id === snippetId ? savedSnippet : s));
      } else {
        setSnippets([...snippets, savedSnippet]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSnippet = async (snippetId) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/projects/${projectId}/snippets/${snippetId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Failed to delete snippet');
            }
            setSnippets(snippets.filter(s => s._id !== snippetId));
        } catch (err) {
            setError(err.message);
        }
    }
  };

  return (
    <div className="p-4">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Code Snippets</h1>
            <button
                onClick={() => { setEditingSnippet(null); setIsModalOpen(true); }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
                Add Snippet
            </button>
        </div>

        <SnippetEditorModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveSnippet}
            snippet={editingSnippet}
        />

      <div className="space-y-4">
        {snippets.map((snippet, index) => (
           <div key={snippet._id || index} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-semibold text-white">{snippet.title}</h2>
                    <p className="text-gray-400 mb-2">{snippet.description}</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => { setEditingSnippet(snippet); setIsModalOpen(true); }} className="text-gray-400 hover:text-white">Edit</button>
                    <button onClick={() => handleDeleteSnippet(snippet._id)} className="text-gray-400 hover:text-white">Delete</button>
                    <button onClick={() => navigator.clipboard.writeText(snippet.code)} className="text-gray-400 hover:text-white">Copy</button>
                </div>
            </div>
            <CodeMirror
              value={snippet.code}
              theme={okaidia}
              extensions={[getLanguageExtension(snippet.language)]}
              readOnly
            />
            <div className="mt-2 flex flex-wrap gap-2">
             {Array.isArray(snippet.tags) && snippet.tags.map((tag, index) => (
  <span key={`${snippet._id}-${tag}-${index}`} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
    {tag}
  </span>
))}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Snippets;
