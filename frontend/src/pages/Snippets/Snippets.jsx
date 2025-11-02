import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { csharp } from '@replit/codemirror-lang-csharp';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import SnippetEditorModal from './SnippetEditorModal';

const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
];

const getLanguageExtension = (language) => {
  if (!language || typeof language !== 'string') return javascript({ jsx: true }); // default fallback

  switch (language.toLowerCase()) {
    case 'python':
      return python();
    case 'html':
      return html();
    case 'cpp':
      return cpp();
    case 'csharp':
      return csharp();
    case 'css':
        return css();
    case 'javascript':
    default:
      return javascript({ jsx: true });
  }
};

const getLanguageLabel = (value) => {
    const lang = languages.find(l => l.value === value);
    return lang ? lang.label : value;
};


const Snippets = () => {
  const { projectId } = useParams();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);

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

  useEffect(() => {
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

      fetchSnippets(); // Refetch snippets to ensure UI is up-to-date
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {snippets.map((snippet) => (
          <div key={snippet._id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{snippet.title}</h2>
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs capitalize">{getLanguageLabel(snippet.language)}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">{snippet.description}</p>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden max-h-48">
                <CodeMirror
                  value={snippet.code}
                  theme={okaidia}
                  extensions={[getLanguageExtension(snippet.language)]}
                  readOnly
                  className="text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {(snippet.tags || []).map((tag, index) => (
                  <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={() => navigator.clipboard.writeText(snippet.code)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white">Copy</button>
                <button onClick={() => { setEditingSnippet(snippet); setIsModalOpen(true); }} className="text-gray-500 hover:text-gray-700 dark:hover:text-white">Edit</button>
                <button onClick={() => handleDeleteSnippet(snippet._id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Snippets;
