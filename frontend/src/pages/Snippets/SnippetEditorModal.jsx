import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { okaidia } from '@uiw/codemirror-theme-okaidia';

const getLanguageExtension = (language) => {
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

const SnippetEditorModal = ({ isOpen, onClose, onSave, snippet }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (snippet) {
        setTitle(snippet.title);
        setDescription(snippet.description || '');
        setCode(snippet.code);
        setLanguage(snippet.language);
        setTags(snippet.tags.join(', '));
      } else {
        setTitle('');
        setDescription('');
        setCode('');
        setLanguage('javascript');
        setTags('');
      }
    }
  }, [snippet, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSave({
      title,
      description,
      code,
      language,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      snippetId: snippet ? snippet._id : null
    });
    onClose();
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
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded border"
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
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 rounded border select"
            >
              {['javascript', 'python', 'c++', 'c#', 'html', 'css'].map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-2 rounded border"
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
