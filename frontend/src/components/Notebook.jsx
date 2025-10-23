import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useProject } from "../hooks/useProject";
import { useParams } from "react-router-dom";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  imagePlugin,
  linkPlugin,
  tablePlugin,
  codeBlockPlugin,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

export default function Notebook() {
  const { selectedProject } = useProject();
  const { projectId } = useParams();
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);

  const filteredNotes = notes
    .filter(note =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(note =>
      !selectedTag || (note.tags && note.tags.includes(selectedTag))
    );

  // Use projectId from URL if selectedProject is not available
  const currentProjectId = selectedProject?._id || projectId;

  useEffect(() => {
    if (!currentProjectId) return;
    
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/projects/${currentProjectId}/notes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load notes: ${response.status}`);
        }
        
        const data = await response.json();
        setNotes(data);
      } catch (err) {
        console.error("Error fetching notes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, [currentProjectId]);

  const addNote = async () => {
    if (!currentProjectId) {
      alert("Please select a project first");
      return;
    }
    
    try {
      const response = await fetch(`/api/projects/${currentProjectId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title: "New Note", content: "" }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create note: ${response.status}`);
      }
      
      const newNote = await response.json();
      setNotes(prev => [newNote, ...prev]);
      setCurrentNote(newNote);
    } catch (err) {
      console.error("Error creating note:", err);
      alert("Failed to create note. Please try again.");
    }
  };

  const updateNote = useCallback(async (id, fields) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(fields),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update note: ${response.status}`);
      }
      
      const updated = await response.json();
      setNotes(prev => prev.map(n => (n._id === id ? updated : n)));
      if (currentNote?._id === id) {
        setCurrentNote(prev => ({ ...prev, ...fields }));
      }
    } catch (err) {
      console.error("Error updating note:", err);
      alert("Failed to save note. Please try again.");
    }
  }, [currentNote]);

  const deleteNote = async (id) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.status}`);
      }
      
      setNotes(prev => prev.filter(n => n._id !== id));
      if (currentNote?._id === id) setCurrentNote(null);
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Failed to delete note. Please try again.");
    }
  };

  const handleImageUpload = async (image) => {
    const formData = new FormData();
    formData.append('image', image);
    const res = await fetch('/api/notes/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
    });
    const { imageUrl } = await res.json();
    return imageUrl;
  };

  // Debounced update for editor changes
  useEffect(() => {
    if (!currentNote) return;
    const handler = setTimeout(() => {
      updateNote(currentNote._id, { title: currentNote.title, content: currentNote.content });
    }, 1000); // Auto-save after 1 second of inactivity
    return () => clearTimeout(handler);
  }, [currentNote?.title, currentNote?.content, updateNote]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading notes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!currentProjectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Please select a project to view notes</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
          {selectedProject ? `${selectedProject.name}: Notebook` : "Notebook"}
        </h2>
        <button
          onClick={addNote}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 mb-4 bg-slate-100/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <h3 className="font-semibold mb-4 text-slate-800 dark:text-white">All Notes</h3>
          <div className="space-y-2">
            {filteredNotes.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">No notes found</p>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => setCurrentNote(note)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentNote?._id === note._id
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  <p className="font-medium text-sm">{note.title || "Untitled"}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags && note.tags.map((tag, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTag(tag);
                        }}
                        className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs hover:bg-purple-200 dark:hover:bg-purple-800"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
             {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="w-full mt-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Clear Tag Filter
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          {currentNote ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={currentNote.title}
                  onChange={(e) =>
                    setCurrentNote(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="text-2xl font-bold bg-transparent border-none outline-none text-slate-800 dark:text-white w-full"
                />
                <button
                  onClick={() => deleteNote(currentNote._id)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-red-500 dark:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  {currentNote.tags && currentNote.tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full px-3 py-1 text-sm">
                      <span>{tag}</span>
                      <button
                        onClick={() => {
                          const newTags = currentNote.tags.filter((_, i) => i !== index);
                          setCurrentNote(prev => ({ ...prev, tags: newTags }));
                          updateNote(currentNote._id, { tags: newTags });
                        }}
                        className="text-purple-500 hover:text-purple-700 dark:text-purple-300 dark:hover:text-purple-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim() !== '') {
                        const newTags = [...(currentNote.tags || []), e.target.value.trim()];
                        setCurrentNote(prev => ({ ...prev, tags: newTags }));
                        updateNote(currentNote._id, { tags: newTags });
                        e.target.value = '';
                      }
                    }}
                    className="bg-transparent outline-none"
                  />
                </div>
              </div>
              <MDXEditor
                markdown={currentNote.content}
                onChange={(newContent) =>
                  setCurrentNote(prev => ({ ...prev, content: newContent }))
                }
                plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    linkPlugin(),
                    tablePlugin(),
                    codeBlockPlugin(),
                    imagePlugin({ imageUploadHandler: handleImageUpload }),
                    toolbarPlugin({
                        toolbarContents: () => (
                        <>
                            <UndoRedo />
                            <Separator />
                            <BoldItalicUnderlineToggles />
                            <Separator />
                            <ListsToggle />
                            <Separator />
                            <BlockTypeSelect />
                            <Separator />
                            <CreateLink />
                            <InsertImage />
                            <Separator />
                            <InsertTable />
                            <InsertThematicBreak />
                        </>
                        )
                    })
                ]}
                contentEditableClassName="prose"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-slate-500 dark:text-slate-500">
              <p>{notes.length === 0 ? "Create your first note to get started" : "Select a note to edit"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}