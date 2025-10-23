import React from 'react';
import NoteItem from './NoteItem';

const NotebookList = ({ notes, setNotes }) => {
  const sortedNotes = [...notes].sort((a, b) => b.isPinned - a.isPinned);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedNotes.map(note => (
        <NoteItem key={note._id} note={note} setNotes={setNotes} />
      ))}
    </div>
  );
};

export default NotebookList;
