import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { csharp } from '@replit/codemirror-lang-csharp';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import { githubLight } from '@uiw/codemirror-theme-github';
import SnippetEditorModal from './SnippetEditorModal';
import { useTheme } from '../../components/ThemeContext';
import { Moon } from 'lucide-react';
import Fuse from 'fuse.js';
import { toast } from 'react-hot-toast';

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
  const location = useLocation();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const { currentTheme } = useTheme();
  const isDarkMode = currentTheme.icon === Moon;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [projectTags, setProjectTags] = useState([]);
  const [selectedSnippets, setSelectedSnippets] = useState([]);
  const snippetRefs = useRef({});

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
    const fetchTags = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/projects/${projectId}/snippets/tags`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setProjectTags(data);
            }
        } catch (error) {
            console.error("Failed to fetch project tags", error);
        }
    };

    fetchSnippets();
    fetchTags();
  }, [projectId]);

  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(location.search);
    const highlightId = params.get('highlight');

    if (highlightId && snippetRefs.current[highlightId]) {
      const element = snippetRefs.current[highlightId];
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight');
      setTimeout(() => {
        element.classList.remove('highlight');
      }, 3000); // Highlight for 3 seconds
    }
  }, [loading, location.search, snippets]);

  const filteredSnippets = useMemo(() => {
    let result = snippets;

    if (selectedLanguage) {
      result = result.filter(snippet => snippet.language === selectedLanguage);
    }

    if (selectedTag) {
      result = result.filter(snippet => snippet.tags.includes(selectedTag));
    }

    if (searchQuery) {
      const fuse = new Fuse(result, {
        keys: ['title', 'description', 'tags'],
        threshold: 0.4,
      });
      result = fuse.search(searchQuery).map(item => item.item);
    }

    return result;
  }, [snippets, searchQuery, selectedLanguage, selectedTag]);

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

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const handleShare = (snippetId) => {
    const url = `${window.location.origin}/projects/${projectId}/snippets?highlight=${snippetId}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied!');
  };

  const handleSelectSnippet = (snippetId) => {
    setSelectedSnippets(prev =>
        prev.includes(snippetId)
            ? prev.filter(id => id !== snippetId)
            : [...prev, snippetId]
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedSnippets.length} selected snippets?`)) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/projects/${projectId}/snippets`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ snippetIds: selectedSnippets }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete snippets');
            }

            setSnippets(prev => prev.filter(snippet => !selectedSnippets.includes(snippet._id)));
            setSelectedSnippets([]);
            toast.success('Snippets deleted successfully');
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        }
    }
  };

  return (
    <div className="p-4">
        {selectedSnippets.length > 0 && (
            <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md mb-4">
                <span>{selectedSnippets.length} snippet(s) selected</span>
                <button
                    onClick={handleBulkDelete}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                >
                    Delete Selected
                </button>
            </div>
        )}
        <div className="flex justify-between items-center mb-4 gap-4">
            <h1 className="text-2xl font-bold">Code Snippets</h1>
            <div className="flex-grow flex justify-center items-center gap-4">
                <input
                    type="text"
                    placeholder="Search snippets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-xs p-2 rounded border"
                />
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="p-2 rounded border select"
                >
                    <option value="">All Languages</option>
                    {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                </select>
                <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="p-2 rounded border select"
                >
                    <option value="">All Tags</option>
                    {projectTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredSnippets.map((snippet) => (
          <div
            key={snippet._id}
            ref={el => snippetRefs.current[snippet._id] = el}
            className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md flex flex-col justify-between border-2 ${selectedSnippets.includes(snippet._id) ? 'border-blue-500' : 'border-transparent'}`}
          >
            <div>
              <div className="flex justify-between items-start mb-1">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{snippet.title}</h2>
                <div className="flex items-center gap-2">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs capitalize">{getLanguageLabel(snippet.language)}</span>
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded-full text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        checked={selectedSnippets.includes(snippet._id)}
                        onChange={() => handleSelectSnippet(snippet._id)}
                    />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">{snippet.description}</p>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden max-h-40">
                <CodeMirror
                  value={snippet.code}
                  theme={isDarkMode ? okaidia : githubLight}
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
                <button onClick={() => handleCopyCode(snippet.code)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white">Copy</button>
                <button onClick={() => handleShare(snippet._id)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white">Share</button>
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
