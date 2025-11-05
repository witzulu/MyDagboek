import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import hljs from 'highlight.js';
import { toast } from 'react-hot-toast';


import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { csharp } from '@replit/codemirror-lang-csharp';

const getLanguageExtension = (language) => {
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

const SnippetEditorModal = ({ isOpen, onClose, onSave, snippet }) => {
  const { projectId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [tags, setTags] = useState([]);
  const [manualLanguageChange, setManualLanguageChange] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [projectTags, setProjectTags] = useState([]);

  const hljsToInternalLanguage = {
    'javascript': 'javascript',
    'python': 'python',
    'c++': 'cpp',
    'csharp': 'csharp',
    'cs': 'csharp',
    'html': 'html',
    'css': 'css',

  };
  const supportedLanguages = ['javascript', 'python', 'cpp', 'c++', 'csharp', 'cs', 'html', 'css'];

  useEffect(() => {
    if (isOpen) {
        const fetchProjectTags = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/projects/${projectId}/snippets/tags`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setProjectTags(data.map(tag => ({ value: tag, label: tag })));
                }
            } catch (error) {
                console.error("Failed to fetch project tags", error);
            }
        };
        fetchProjectTags();

        if (snippet) {
            setTitle(snippet.title);
            setDescription(snippet.description || '');
            setCode(snippet.code);
            setLanguage(snippet.language);
            setTags(snippet.tags.map(tag => ({ value: tag, label: tag })));
        } else {
            setTitle('');
            setDescription('');
            setCode('');
            setLanguage('javascript');
            setTags([]);
        }
        setManualLanguageChange(false);
        setTitleError(false);
    }
  }, [snippet, isOpen, projectId]);

  // Debounced language detection
 useEffect(() => {
    if (manualLanguageChange || !code || code.trim().length < 20) {
        return;
    }

    const handler = setTimeout(() => {
        const result = hljs.highlightAuto(code, supportedLanguages);
        const detectedLanguage = result.language;

        if (detectedLanguage && result.relevance > 10 && supportedLanguages.includes(detectedLanguage)) {
            // Map the detected language to internal name
            const mappedLanguage = hljsToInternalLanguage[detectedLanguage] || detectedLanguage;
            console.log('Detected language:', detectedLanguage, 'Mapped to:', mappedLanguage);
            if (mappedLanguage !== language) {
                setLanguage(mappedLanguage);
                const langLabel = languages.find(l => l.value === mappedLanguage)?.label || mappedLanguage;
                toast.success(`Language detected: ${langLabel}`);
            }
        }
    }, 500);

    return () => {
        clearTimeout(handler);
    };
}, [code, language, manualLanguageChange]);


  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) {
        toast.error('Title is required.');
        setTitleError(true);
        return;
    }
    onSave({
      title,
      description,
      code,
      language,
      tags: tags.map(tag => tag.value),
      snippetId: snippet ? snippet._id : null
    });
    onClose();
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setManualLanguageChange(true);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (titleError) {
        setTitleError(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-base-100/75  flex justify-center items-center z-50">
      <div className="card bg-base-100 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <h2 className="text-2xl font-bold mb-4">{snippet ? 'Edit Snippet' : 'Create Snippet'}</h2>
        <div className="space-y-4 flex-grow overflow-y-auto">
          <input
            type="text"
            placeholder="Snippet title"
            value={title}
            onChange={handleTitleChange}
            className={`w-full p-2 rounded border ${titleError ? 'border-red-500' : ''}`}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded border h-24"
          />
          <CodeMirror
            value={code}
            onChange={(value) => setCode(value)}
            theme={okaidia}
            extensions={[getLanguageExtension(language)]}
            height="300px"
          />
          <div className="flex space-x-4">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="w-full p-2 rounded border select"
            >
              {[{value: 'javascript', label: 'JavaScript'}, {value: 'python', label: 'Python'}, {value: 'cpp', label: 'C++'}, {value: 'csharp', label: 'C#'}, {value: 'html', label: 'HTML'}, {value: 'css', label: 'CSS'}].map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
            <CreatableSelect
              isMulti
              options={projectTags}
              value={tags}
              onChange={setTags}
              className="w-full"
              placeholder="Select or create tags..."
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded bg-blue-500 text-white">Save</button>
        </div>
      </div>
    </div>
  );
};

export default SnippetEditorModal;
