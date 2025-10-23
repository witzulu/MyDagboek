import React, { useState } from 'react';
import api from '../../../services/api';
import NoteEditor from './NoteEditor';

const NoteItem = ({ note, setNotes }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api.delete(`/projects/${note.project}/notes/${note._id}`);
        setNotes(prevNotes => prevNotes.filter(n => n._id !== note._id));
      } catch (err) {
        console.error('Failed to delete note:', err);
      }
    }
  };

  const handleUpdate = updatedNote => {
    setNotes(prevNotes =>
      prevNotes.map(n => (n._id === updatedNote._id ? updatedNote : n))
    );
  };

  const handlePin = async () => {
    try {
      const { data } = await api.put(`/projects/${note.project}/notes/${note._id}`, {
        isPinned: !note.isPinned,
      });
      handleUpdate(data);
    } catch (err) {
      console.error('Failed to pin note:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col justify-between">
      {isEditing ? (
        <NoteEditor note={note} onSave={handleUpdate} setIsEditing={setIsEditing} />
      ) : (
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg">{note.title}</h3>
            <button onClick={handlePin} className="text-yellow-500">
              {note.isPinned ? '★' : '☆'}
            </button>
          </div>
          <div className="mt-2">
            {note.tags.map(tag => (
              <span key={tag} className="bg-gray-200 dark:bg-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2 truncate">{note.content || 'No content'}</p>
        </div>
      )}
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm text-blue-500 hover:underline"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
        <button
          onClick={handleDelete}
          className="text-sm text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NoteItem;
