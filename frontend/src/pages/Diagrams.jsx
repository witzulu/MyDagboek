import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { useProject } from "../hooks/useProject";
import { useParams } from "react-router-dom";
import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

export default function Diagrams() {
  const { selectedProject } = useProject();
  const { projectId } = useParams();
  const [diagrams, setDiagrams] = useState([]);
  const [currentDiagram, setCurrentDiagram] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const editorRef = useRef(null);
  const currentProjectId = selectedProject?._id || projectId;

  // Fetch diagrams for project
  useEffect(() => {
    const fetchDiagrams = async () => {
      try {
        const response = await fetch(`/api/projects/${currentProjectId}/diagrams`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch diagrams");
        const data = await response.json();
        setDiagrams(data);
      } catch (err) {
        setError(err.message);
      }
    };
    if (currentProjectId) fetchDiagrams();
  }, [currentProjectId]);

  // Add Diagram
  const addDiagram = async () => {
    if (!currentProjectId) return alert("Please select a project first");
    try {
      const response = await fetch(`/api/projects/${currentProjectId}/diagrams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: "New Diagram" }),
      });
      if (!response.ok) throw new Error(`Failed to create diagram: ${response.status}`);
      const newDiagram = await response.json();
      setDiagrams((prev) => [newDiagram, ...prev]);
      setCurrentDiagram(newDiagram);
    } catch (err) {
      console.error("Error creating diagram:", err);
      alert("Failed to create diagram. Please try again.");
    }
  };

  // Update Diagram
  const updateDiagram = useCallback(async (id, fields) => {
    try {
      const response = await fetch(`/api/diagrams/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(fields),
      });

      if (!response.ok) throw new Error(`Failed to update diagram: ${response.status}`);
      const updated = await response.json();
      setDiagrams((prev) => prev.map((d) => (d._id === id ? updated : d)));
      setCurrentDiagram((prev) => (prev?._id === id ? updated : prev));
    } catch (err) {
      console.error("Error updating diagram:", err);
      alert("Failed to save diagram. Please try again.");
    }
  }, []);

  // Delete Diagram
  const deleteDiagram = async (id) => {
    if (!window.confirm("Are you sure you want to delete this diagram?")) return;
    try {
      const response = await fetch(`/api/diagrams/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error(`Failed to delete diagram: ${response.status}`);
      setDiagrams((prev) => prev.filter((d) => d._id !== id));
      if (currentDiagram?._id === id) setCurrentDiagram(null);
    } catch (err) {
      console.error("Error deleting diagram:", err);
      alert("Failed to delete diagram. Please try again.");
    }
  };

  // Manual Save Button
  const handleManualSave = async () => {
    if (!currentDiagram?._id || !editorRef.current) return;
    try {
      setIsSaving(true);
      const editor = editorRef.current;
      const snapshot = editor.store.getSnapshot();
      await updateDiagram(currentDiagram._id, {
        name: currentDiagram.name,
        data: snapshot,
      });
    } catch (err) {
      console.error("Manual save failed:", err);
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
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
        Please select a project to view diagrams.
      </div>
    );
  }

  // UI
  if (currentDiagram) {
    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDiagram(null)} className="btn btn-ghost btn-sm btn-square">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={currentDiagram.name}
              onChange={(e) => setCurrentDiagram((prev) => ({ ...prev, name: e.target.value }))}
              onBlur={handleManualSave}
              className="text-2xl font-bold bg-transparent border-none outline-none text-base-content"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleManualSave} className="btn btn-success btn-sm" disabled={isSaving}>
              {isSaving ? <span className="loading loading-spinner w-4 h-4" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <button onClick={() => deleteDiagram(currentDiagram._id)} className="btn btn-error btn-sm">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="flex-grow relative border rounded-lg overflow-hidden">
          <Tldraw
            persistenceKey={`tldraw-diagram-${currentDiagram._id}`}
            snapshot={currentDiagram.data}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-primary">
          {selectedProject ? `${selectedProject.name}: Diagrams` : "Diagrams"}
        </h2>
        <button onClick={addDiagram} className="btn btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          New Diagram
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {diagrams.map((diagram) => (
          <div
            key={diagram._id}
            onClick={() => setCurrentDiagram(diagram)}
            className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow cursor-pointer border border-base-300"
          >
            <div className="card-body">
              <h3 className="card-title text-base">{diagram.name}</h3>
              <p className="text-xs text-base-content/70">
                Updated: {new Date(diagram.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
