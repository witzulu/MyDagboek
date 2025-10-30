import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Plus, Trash2, X, Save } from "lucide-react";
import { useProject } from "../hooks/useProject";
import { useParams } from "react-router-dom";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import debounce from "lodash.debounce";
import "@mdxeditor/editor/style.css";
import '../mdxeditor.css'
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
  Separator,
  CodeToggle,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";

export default function Notebook() {
  const { selectedProject } = useProject();
  const { projectId } = useParams();
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [activeView, setActiveView] = useState("text");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [lastSaved, setLastSaved] = useState(null);

  const excalidrawAPIRef = useRef(null);
  const currentProjectId = selectedProject?._id || projectId;
  const noteStateRef = useRef();
  noteStateRef.current = currentNote;

  // --- Fetch notes for project ---
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`/api/projects/${currentProjectId}/notes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch notes");
        const data = await response.json();
        setNotes(data);
      } catch (err) {
        setError(err.message);
      }
    };
    if (currentProjectId) fetchNotes();
  }, [currentProjectId]);

  // --- Add Note ---
  const addNote = async () => {
    if (!currentProjectId) return alert("Please select a project first");
    try {
      const response = await fetch(`/api/projects/${currentProjectId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title: "New Note", content: "" }),
      });
      if (!response.ok) throw new Error(`Failed to create note: ${response.status}`);
      const newNote = await response.json();
      setNotes((prev) => [newNote, ...prev]);
      setCurrentNote(newNote);
    } catch (err) {
      console.error("Error creating note:", err);
      alert("Failed to create note. Please try again.");
    }
  };

  // --- Update Note ---
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

      if (!response.ok) throw new Error(`Failed to update note: ${response.status}`);

      const updated = await response.json();
      setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
      setCurrentNote((prev) => (prev?._id === id ? updated : prev));
    } catch (err) {
      console.error("Error updating note:", err);
      alert("Failed to save note. Please try again.");
    }
  }, []);

  // --- Debounced text save ---
  const debouncedUpdateNote = useMemo(
    () => debounce(async (id, fields) => {
      setSaveStatus("saving");
      try {
        const latestNote = noteStateRef.current;
        const payload = {
            ...fields,
            title: latestNote.title,
        };
        await updateNote(id, payload);
        setSaveStatus("saved");
        setLastSaved(new Date());
      } catch {
        setSaveStatus("error");
      }
    }, 1000),
    [updateNote]
  );

  // --- Manual Save Button ---
  const handleManualSave = async () => {
    if (!currentNote?._id) return;
    try {
      setIsSaving(true);
      setSaveStatus("saving");

      let drawingData = currentNote.drawing;
      if (activeView === 'drawing' && excalidrawAPIRef.current) {
        const elements = excalidrawAPIRef.current.getSceneElements();
        const appState = excalidrawAPIRef.current.getAppState();
        drawingData = { elements, appState };
      }

      await updateNote(currentNote._id, {
        title: currentNote.title,
        content: currentNote.content,
        drawing: drawingData,
      });

      setSaveStatus("saved");
      setLastSaved(new Date());
    } catch (err) {
      console.error("Manual save failed:", err);
      setSaveStatus("error");
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  // --- Auto Save Drawings ---
  const handleDrawingChange = useCallback(
    debounce(async (elements, appState) => {
      if (!currentNote?._id) return;

      setSaveStatus("saving");
      try {
        await updateNote(currentNote._id, { drawing: { elements, appState } });
        setSaveStatus("saved");
        setLastSaved(new Date());
      } catch {
        setSaveStatus("error");
      }
    }, 1500),
    [currentNote?._id, updateNote]
  );

  // --- Delete Note ---
  const deleteNote = async (id) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error(`Failed to delete note: ${response.status}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      if (currentNote?._id === id) setCurrentNote(null);
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Failed to delete note. Please try again.");
    }
  };

  // --- Select Note ---
  const handleSelectNote = async (note) => {
    if (currentNote && currentNote._id !== note._id) {
      await handleManualSave();
    }
    
    setSaveStatus("saved");
    setCurrentNote(note);
    setActiveView("text");
  };

  // --- Image Upload ---
  const handleImageUpload = async (image) => {
    const formData = new FormData();
    formData.append("image", image);
    const res = await fetch("/api/notes/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    });
    const { imageUrl } = await res.json();
    return imageUrl;
  };

  // --- Handle Save Button (reuses manual save) ---
  const handleSave = async () => {
    await handleManualSave();
    setActiveView("text");
  };

  // --- UI ---

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return "";
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000); // seconds
    
    if (diff < 10) return "just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-error">
        Error: {error}
      </div>
    );
  }

  if (!currentProjectId) {
    return (
      <div className="flex items-center justify-center h-64 text-base-content/70">
        Please select a project to view notes
      </div>
    );
  }

  const filteredNotes = notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter((note) => !selectedTag || (note.tags && note.tags.includes(selectedTag)));

  return (
    <div className="p-6 min-h-screen bg-base-200 text-base-content  w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2">
          {selectedProject ? `${selectedProject.name}: Notebook` : "Notebook"}
        </h2>
        <button onClick={addNote} className="btn btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="card bg-base-100 shadow border border-base-300 p-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-bordered input-sm w-full mb-4"
          />
          <h3 className="font-semibold mb-3 text-base-content">All Notes</h3>
          <div className="space-y-2 overflow-y-auto max-h-[70vh]">
            {filteredNotes.length === 0 ? (
              <p className="text-base-content/70 text-sm">No notes found</p>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => handleSelectNote(note)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentNote?._id === note._id ? "bg-primary text-primary-content" : "hover:bg-base-200"
                  }`}
                >
                  <p className="font-medium text-sm">{note.title || "Untitled"}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags?.map((tag, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTag(tag);
                        }}
                        className="badge badge-outline badge-primary text-xs"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs opacity-60 mt-1">{new Date(note.updatedAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
            {selectedTag && (
              <button onClick={() => setSelectedTag(null)} className="btn btn-ghost btn-xs w-full text-primary mt-2">
                Clear Tag Filter
              </button>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 card bg-base-100 shadow border border-base-300 p-6">
          {currentNote ? (
            <>
              {/* Title + Save/Delete */}
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote((prev) => ({ ...prev, title: e.target.value }))}
                  className="text-2xl font-bold bg-transparent border-none outline-none text-base-content w-full"
                />
                <div className="flex items-center gap-2">
                  <button onClick={handleSave} className="btn btn-success btn-sm btn-square" disabled={isSaving}>
                    {isSaving ? <span className="loading loading-spinner w-4 h-4" /> : <Save className="w-4 h-4" />}
                  </button>
                  <button onClick={() => deleteNote(currentNote._id)} className="btn btn-error btn-sm btn-square">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {currentNote.tags?.map((tag, index) => (
                  <div key={index} className="badge badge-primary gap-1 py-3 px-4">
                    {tag}
                    <button
                      onClick={() => {
                        const newTags = currentNote.tags.filter((_, i) => i !== index);
                        setCurrentNote((prev) => ({ ...prev, tags: newTags }));
                        updateNote(currentNote._id, { tags: newTags });
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value.trim() !== "") {
                      const newTags = [...(currentNote.tags || []), e.target.value.trim()];
                      setCurrentNote((prev) => ({ ...prev, tags: newTags }));
                      updateNote(currentNote._id, { tags: newTags });
                      e.target.value = "";
                    }
                  }}
                  className="input input-bordered input-xs w-auto"
                />
              </div>

              {/* Tabs */}
              <div className="tabs tabs-boxed mb-4">
                <a className={`tab ${activeView === "text" ? "tab-active" : ""}`} onClick={() => setActiveView("text")}>
                  Text
                </a>
                <a
                  className={`tab ${activeView === "drawing" ? "tab-active" : ""}`}
                  onClick={() => setActiveView("drawing")}
                >
                  Drawing
                </a>
              </div>
              <div className="bg-white p-3 rounded-lg text-2xl ">
              {/* Text Editor */}
              {activeView === "text" && (
                <MDXEditor
                  contentEditableClassName="mxEditor"
                  key={currentNote._id}
                  markdown={currentNote.content || ""}
                  onChange={(newContent) => {
                    setCurrentNote((prev) => ({ ...prev, content: newContent }));
                    debouncedUpdateNote(currentNote._id, { content: newContent });
                  }}
                  plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    linkPlugin(),
                    tablePlugin(),
                    codeBlockPlugin(),
                    imagePlugin({ imageUploadHandler: handleImageUpload }),
                    diffSourcePlugin(),
                    toolbarPlugin({
                      toolbarContents: () => (
                        <>
                          <UndoRedo />
                          <Separator />
                          <BoldItalicUnderlineToggles />
                          <Separator />
                          <ListsToggle />
                          <Separator />
                          <BlockTypeSelect blockTypes={["paragraph", "h1", "h2", "h3", "quote", "code"]} />
                          <Separator />
                          <CreateLink />
                          <InsertImage />
                          <Separator />
                          <InsertTable />
                          <InsertThematicBreak />
                          <Separator />
                          <CodeToggle />
                          <Separator />
                          <DiffSourceToggleWrapper />
                        </>
                      ),
                    }),
                  ]}
                  
                />
              )}

              {/* Drawing Editor */}
              {activeView === "drawing" && (
                <div className="relative h-[600px] border rounded-lg overflow-hidden">
                  <Excalidraw
                    key={currentNote._id}
                    excalidrawAPI={(api) => (excalidrawAPIRef.current = api)}
                    initialData={currentNote.drawing}
                    onChange={handleDrawingChange}
                  />
                </div>
              )}
            </div>
            
            {/* Google Docs-style save indicator */}
            <div className="fixed bottom-4 right-4 z-50">
              <div className={`
                flex items-center gap-2 px-4 py-2 rounded-full shadow-lg
                transition-all duration-300 ease-in-out
                ${saveStatus === "saving" ? "bg-blue-500 text-white" : ""}
                ${saveStatus === "saved" ? "bg-green-500 text-white" : ""}
                ${saveStatus === "error" ? "bg-red-500 text-white" : ""}
              `}>
                {saveStatus === "saving" && (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    <span className="text-sm font-medium">Saving...</span>
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">
                      Saved {formatLastSaved()}
                    </span>
                  </>
                )}
                {saveStatus === "error" && (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm font-medium">Save failed</span>
                  </>
                )}
              </div>
            </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-96 text-base-content/60">
              {notes.length === 0 ? "Create your first note to get started" : "Select a note to edit"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}