import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useProject } from "../hooks/useProject";
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
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);

  useEffect(() => {
    if (!selectedProject || !selectedProject._id) return;
    fetch(`/api/projects/${selectedProject._id}/notes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load notes");
        return res.json();
      })
      .then(setNotes)
      .catch(err => console.error("Error fetching notes:", err));
  }, [selectedProject]);

  const addNote = async () => {
    if (!selectedProject?._id) return;
    const res = await fetch(`/api/projects/${selectedProject._id}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ title: "New Note", content: "" }),
    });
    const newNote = await res.json();
    setNotes(prev => [newNote, ...prev]);
    setCurrentNote(newNote);
  };

  const updateNote = useCallback(async (id, fields) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(fields),
    });
    const updated = await res.json();
    setNotes(prev => prev.map(n => (n._id === id ? updated : n)));
    if (currentNote?._id === id) {
      setCurrentNote(prev => ({ ...prev, ...fields }));
    }
  }, [currentNote]);

  const deleteNote = async (id) => {
    await fetch(`/api/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setNotes(prev => prev.filter(n => n._id !== id));
    if (currentNote?._id === id) setCurrentNote(null);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
          {selectedProject ? `${selectedProject.name}: Notebook` : "Select a Project"}
        </h2>
        <button
          onClick={addNote}
          disabled={!selectedProject}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold mb-4 text-slate-800 dark:text-white">All Notes</h3>
          <div className="space-y-2">
            {notes.map((note) => (
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
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
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
              <p>Select a note or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
