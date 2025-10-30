import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Plus, Trash2, X, Save, FolderPlus, Folder, File, ChevronRight, ChevronDown, Edit, GripVertical } from "lucide-react";
import { useProject } from "../hooks/useProject";
import { useParams } from "react-router-dom";
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
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

export default function Notebook() {
    const { selectedProject } = useProject();
    const { projectId } = useParams();
    const [notes, setNotes] = useState([]);
    const [folders, setFolders] = useState([]);
    const [currentNote, setCurrentNote] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeView, setActiveView] = useState("text");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState("saved");
    const [lastSaved, setLastSaved] = useState(null);
    const [Excalidraw, setExcalidraw] = useState(null);

    const excalidrawAPIRef = useRef(null);
    const currentProjectId = selectedProject?._id || projectId;

    // --- Data Fetching ---
    const fetchData = useCallback(async () => {
      if (!currentProjectId) return;
      try {
        const [notesRes, foldersRes] = await Promise.all([
          fetch(`/api/projects/${currentProjectId}/notes`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          fetch(`/api/projects/${currentProjectId}/folders`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ]);
        if (!notesRes.ok) throw new Error("Failed to fetch notes");
        if (!foldersRes.ok) throw new Error("Failed to fetch folders");
        const notesData = await notesRes.json();
        const foldersData = await foldersRes.json();
        setNotes(notesData);
        setFolders(foldersData);
      } catch (err) {
        setError(err.message);
      }
    }, [currentProjectId]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    useEffect(() => {
        import("@excalidraw/excalidraw")
          .then((comp) => setExcalidraw(() => comp.Excalidraw))
          .catch((err) => {
            console.error("Failed to load Excalidraw:", err);
            setError("Drawing component failed to load. Please try again later.");
          });
        // Dynamically import the CSS as well
        import("@excalidraw/excalidraw/index.css");
      }, []);

    // --- Note Actions ---
    const addNote = async () => {
        if (!currentProjectId) return alert("Please select a project first");
        try {
          const response = await fetch(`/api/projects/${currentProjectId}/notes`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ title: "New Note", content: "", folder: selectedFolder }),
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

    // --- Folder Actions ---
    const addFolder = async (name, parent = null) => {
      if (!currentProjectId) return;
      try {
        const res = await fetch(`/api/projects/${currentProjectId}/folders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ name, parent }),
        });
        if (!res.ok) throw new Error('Failed to create folder');
        const newFolder = await res.json();
        setFolders(prev => [...prev, newFolder]);
      } catch (err) {
        console.error('Error adding folder', err);
      }
    };

    const renameFolder = async (folderId, newName) => {
        await updateFolder(folderId, { name: newName });
    };

    const updateFolder = async (folderId, fields) => {
        try {
          const res = await fetch(`/api/folders/${folderId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(fields),
          });
          if (!res.ok) throw new Error('Failed to update folder');
          const updatedFolder = await res.json();
          setFolders(prev => prev.map(f => f._id === folderId ? updatedFolder : f));
        } catch (err) {
          console.error('Error updating folder', err);
        }
      };

    const deleteFolder = async (folderId) => {
      if (window.confirm('Are you sure you want to delete this folder and all its contents?')) {
        try {
          const res = await fetch(`/api/folders/${folderId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          if (!res.ok) throw new Error('Failed to delete folder');
          setFolders(prev => prev.filter(f => f._id !== folderId));
          // Refetch notes to remove deleted notes
          fetchData();
        } catch (err) {
          console.error('Error deleting folder', err);
        }
      }
    };

    // --- Debounced & Auto Save ---
      const debouncedSave = useMemo(
        () =>
          debounce(async (noteToSave) => {
            if (!noteToSave) return;
            setSaveStatus("saving");
            try {
              await updateNote(noteToSave._id, {
                title: noteToSave.title,
                content: noteToSave.content,
              });
              setSaveStatus("saved");
              setLastSaved(new Date());
            } catch {
              setSaveStatus("error");
            }
          }, 1500),
        [updateNote]
      );

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

    // --- Event Handlers ---
    const handleSelectNote = async (note) => {
        if (currentNote && currentNote._id !== note._id) {
          await handleManualSave();
        }

        setSaveStatus("saved");
        setCurrentNote(note);
        setActiveView("text");
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

    const handleSave = async () => {
        await handleManualSave();
        setActiveView("text");
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;
    
        const draggedId = active.id;
        const droppedId = over.id;

        if (draggedId === droppedId) return;

        const isDraggedItemNote = notes.some(n => n._id === draggedId);
        const isDroppedOnFolder = folders.some(f => f._id === droppedId);

        if (isDraggedItemNote && isDroppedOnFolder) {
            updateNote(draggedId, { folder: droppedId });
        } else if (!isDraggedItemNote && isDroppedOnFolder) {
            updateFolder(draggedId, { parent: droppedId });
        }
    };

    // --- Tree & Filtering Logic ---
    const { tree, notesWithoutFolder } = useMemo(() => {
        const filteredNotes = notes.filter(note =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        const tree = [];
        const notesWithoutFolder = [];
        const folderMap = new Map(folders.map(f => [f._id, { ...f, children: [], isFolder: true }]));

        for (const folder of folderMap.values()) {
          if (folder.parent && folderMap.has(folder.parent)) {
            folderMap.get(folder.parent).children.push(folder);
          } else {
            tree.push(folder);
          }
        }

        for (const note of filteredNotes) {
          if (note.folder && folderMap.has(note.folder)) {
            folderMap.get(note.folder).children.push(note);
          } else {
            notesWithoutFolder.push(note);
          }
        }

        return { tree, notesWithoutFolder };
    }, [folders, notes, searchTerm]);

    // --- UI Components ---

    const FolderTreeItem = ({ folder, level }) => {
        const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: folder._id });
        const { isOver, setNodeRef: dropRef } = useDroppable({ id: folder._id });
        const [isOpen, setIsOpen] = useState(true);
        const [isEditing, setIsEditing] = useState(false);
        const [name, setName] = useState(folder.name);

        const handleRename = () => {
            if (name.trim() && name !== folder.name) {
                renameFolder(folder._id, name);
            }
            setIsEditing(false);
        }

        return (
            <div
                ref={dropRef}
                style={{
                    paddingLeft: `${level * 16}px`,
                    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
                    backgroundColor: isOver ? 'rgba(0, 128, 0, 0.1)' : 'transparent',
                }}
            >
                <div
                    className={`flex items-center justify-between p-2 rounded-lg group ${selectedFolder === folder._id ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`}
                    onClick={() => setSelectedFolder(folder._id)}
                >
                    <div className="flex items-center gap-2 flex-grow">
                        <span onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="cursor-pointer">
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                        <Folder size={16} />
                        {isEditing ? (
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                onBlur={handleRename}
                                onKeyDown={e => e.key === 'Enter' && handleRename()}
                                className="input input-xs"
                                autoFocus
                                onClick={e => e.stopPropagation()} // Prevent folder selection
                            />
                        ) : (
                            <span className="cursor-pointer flex-grow">{folder.name}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div ref={setNodeRef} {...listeners} {...attributes} className="cursor-grab touch-none p-1">
                            <GripVertical size={14} />
                        </div>
                        <button className="btn btn-xs btn-ghost" onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}><Edit size={12} /></button>
                        <button className="btn btn-xs btn-ghost" onClick={(e) => { e.stopPropagation(); deleteFolder(folder._id); }}><Trash2 size={12} /></button>
                    </div>
                </div>
                {isOpen && (
                    <div className="pt-1">
                        {folder.children.map(item => (
                            item.isFolder ? <FolderTreeItem key={item._id} folder={item} level={level + 1} /> : <NoteTreeItem key={item._id} note={item} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    const NoteTreeItem = ({ note, level }) => {
        const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: note._id });
        return (
            <div
                style={{
                    paddingLeft: `${level * 16}px`,
                    transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
                }}
                onClick={() => handleSelectNote(note)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group ${currentNote?._id === note._id ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`}
            >
                <div className="flex items-center gap-2">
                    <File size={16} />
                    <span>{note.title || "Untitled"}</span>
                </div>
                <div ref={setNodeRef} {...listeners} {...attributes} className="cursor-grab touch-none p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <GripVertical size={14} />
                </div>
            </div>
        )
    };

    // --- Render ---

    if (error) return <div className="text-error">Error: {error}</div>;

    return (
        <DndContext onDragEnd={handleDragEnd}>
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
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-base-content">Notes</h3>
                        <button className="btn btn-xs btn-ghost" onClick={() => addFolder('New Folder', selectedFolder)}>
                            <FolderPlus size={16}/>
                        </button>
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-[70vh]">
                        {tree.length === 0 && notesWithoutFolder.length === 0 ? (
                            <div className="text-center text-base-content/60 p-4">
                                No matches found.
                            </div>
                        ) : (
                            <>
                                {tree.map(item => (
                                    item.isFolder ? <FolderTreeItem key={item._id} folder={item} level={0} /> : <NoteTreeItem key={item._id} note={item} level={0} />
                                ))}
                                {notesWithoutFolder.map(note => <NoteTreeItem key={note._id} note={note} level={0} />)}
                            </>
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
                                setCurrentNote(prev => {
                                    const newNote = { ...prev, content: newContent };
                                    debouncedSave(newNote);
                                    return newNote;
                                  });
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
                                {Excalidraw ? (
                                    <Excalidraw
                                        key={currentNote._id}
                                        excalidrawAPI={(api) => (excalidrawAPIRef.current = api)}
                                        initialData={currentNote.drawing}
                                        onChange={handleDrawingChange}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        Loading Drawing Canvas...
                                    </div>
                                )}
                            </div>
                        )}
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
        </DndContext>
    );
}