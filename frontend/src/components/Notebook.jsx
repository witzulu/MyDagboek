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
  Separator,
  CodeToggle,
  diffSourcePlugin,
  DiffSourceToggleWrapper
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

export default function Notebook() {
  const { selectedProject } = useProject();
  const { projectId } = useParams();
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);

  const filteredNotes = notes
    .filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (note) =>
        !selectedTag || (note.tags && note.tags.includes(selectedTag))
    );

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
      setNotes((prev) => [newNote, ...prev]);
      setCurrentNote(newNote);
    } catch (err) {
      console.error("Error creating note:", err);
      alert("Failed to create note. Please try again.");
    }
  };

  const updateNote = useCallback(
    async (id, fields) => {
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
        setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
        if (currentNote?._id === id) {
          setCurrentNote((prev) => ({ ...prev, ...fields }));
        }
      } catch (err) {
        console.error("Error updating note:", err);
        alert("Failed to save note. Please try again.");
      }
    },
    [currentNote]
  );

  const deleteNote = async (id) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.status}`);
      }

      setNotes((prev) => prev.filter((n) => n._id !== id));
      if (currentNote?._id === id) setCurrentNote(null);
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Failed to delete note. Please try again.");
    }
  };

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

  const handleSelectNote = async (note) => {
    if (currentNote && currentNote._id !== note._id) {
      const hasChanges =
        currentNote.title !==
          notes.find((n) => n._id === currentNote._id)?.title ||
        currentNote.content !==
          notes.find((n) => n._id === currentNote._id)?.content;

      if (hasChanges) {
        await updateNote(currentNote._id, {
          title: currentNote.title,
          content: currentNote.content,
          tags: currentNote.tags,
        });
      }
    }

    setCurrentNote(note);
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

  return (
    <div className="p-6 min-h-screen bg-base-200 text-base-content">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2">
          {selectedProject
            ? `${selectedProject.name}: Notebook`
            : "Notebook"}
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
                    currentNote?._id === note._id
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-200"
                  }`}
                >
                  <p className="font-medium text-sm">
                    {note.title || "Untitled"}
                  </p>
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
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="btn btn-ghost btn-xs w-full text-primary mt-2"
              >
                Clear Tag Filter
              </button>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 card bg-base-100 shadow border border-base-300 p-6">
          {currentNote ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={currentNote.title}
                  onChange={(e) =>
                    setCurrentNote((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="text-2xl font-bold bg-transparent border-none outline-none text-base-content w-full"
                />
                <button
                  onClick={() => deleteNote(currentNote._id)}
                  className="btn btn-error btn-sm btn-square"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {currentNote.tags?.map((tag, index) => (
                  <div
                    key={index}
                    className="badge badge-primary gap-1 py-3 px-4"
                  >
                    {tag}
                    <button
                      onClick={() => {
                        const newTags = currentNote.tags.filter(
                          (_, i) => i !== index
                        );
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
                      const newTags = [
                        ...(currentNote.tags || []),
                        e.target.value.trim(),
                      ];
                      setCurrentNote((prev) => ({
                        ...prev,
                        tags: newTags,
                      }));
                      updateNote(currentNote._id, { tags: newTags });
                      e.target.value = "";
                    }
                  }}
                  className="input input-bordered input-xs w-auto"
                />
              </div>

              {/* MDX Editor */}
              <MDXEditor
                key={currentNote._id}
                markdown={currentNote.content}
                onChange={(newContent) =>
                  setCurrentNote((prev) => ({ ...prev, content: newContent }))
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
                        <BlockTypeSelect
                          blockTypes={[
                            "paragraph",
                            "h1",
                            "h2",
                            "h3",
                            "quote",
                            "code",
                          ]}
                        />
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
                contentEditableClassName="prose max-w-none"
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-96 text-base-content/60">
              {notes.length === 0
                ? "Create your first note to get started"
                : "Select a note to edit"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
