import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  imagePlugin
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

const NoteEditor = ({ note, onSave, setIsEditing }) => {
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [tags, setTags] = useState(note.tags.join(', '));

  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        const { data } = await api.put(`/projects/${note.project}/notes/${note._id}`, {
          title,
          content,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        });
        onSave(data);
      } catch (err) {
        console.error('Failed to save note:', err);
      }
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [title, content, tags, note._id, note.project, onSave]);

  const handleImageUpload = async (image) => {
    const formData = new FormData();
    formData.append('image', image);
    try {
      const { data } = await api.post('/notes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.imageUrl;
    } catch (err) {
      console.error('Failed to upload image:', err);
      return null;
    }
  };

  return (
    <div>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full p-2 mb-2 font-bold text-lg bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none"
      />
      <input
        type="text"
        value={tags}
        onChange={e => setTags(e.target.value)}
        placeholder="Tags (comma-separated)"
        className="w-full p-2 mb-2 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none"
      />
      <MDXEditor
        markdown={content}
        onChange={setContent}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          imagePlugin({
            imageUploadHandler: handleImageUpload,
          }),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
              </>
            )
          })
        ]}
        contentEditableClassName="prose"
      />
      <button
        onClick={() => setIsEditing(false)}
        className="mt-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded"
      >
        Done
      </button>
    </div>
  );
};

export default NoteEditor;
