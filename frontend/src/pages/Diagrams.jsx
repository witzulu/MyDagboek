import { useEffect, useState, useCallback, useRef, DragEvent } from "react";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { useProject } from "../hooks/useProject";
import { useParams } from "react-router-dom";
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';


let id = 0;
const getId = () => `dndnode_${id++}`;

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="border-r-2 border-base-300 p-4 text-sm text-base-content bg-base-100 w-64">
      <h3 className="text-xl font-semibold mb-4 text-primary">Nodes</h3>
      <div className="space-y-2">
        <div className="p-3 border-2 border-dashed rounded-md cursor-grab bg-base-200 text-center" onDragStart={(event) => onDragStart(event, 'input')} draggable>
          Input Node
        </div>
        <div className="p-3 border-2 border-dashed rounded-md cursor-grab bg-base-200 text-center" onDragStart={(event) => onDragStart(event, 'default')} draggable>
          Default Node
        </div>
        <div className="p-3 border-2 border-dashed rounded-md cursor-grab bg-base-200 text-center" onDragStart={(event) => onDragStart(event, 'output')} draggable>
          Output Node
        </div>
      </div>
    </aside>
  );
};

export default function Diagrams() {
  const { selectedProject } = useProject();
  const { projectId } = useParams();
  const [diagrams, setDiagrams] = useState([]);
  const [currentDiagram, setCurrentDiagram] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const currentProjectId = selectedProject?._id || projectId;

  useEffect(() => {
    if (currentDiagram && currentDiagram.data) {
      const { nodes: savedNodes = [], edges: savedEdges = [] } = currentDiagram.data;
      setNodes(savedNodes);
      setEdges(savedEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [currentDiagram]);


  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );


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
    if (!currentDiagram?._id || !reactFlowInstance) return;
    try {
      setIsSaving(true);
      const flow = reactFlowInstance.toObject();
      await updateDiagram(currentDiagram._id, {
        name: currentDiagram.name,
        data: flow,
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
      <div className="p-6 h-full flex flex-col w-full">
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
        <div className="flex-grow flex border rounded-lg overflow-hidden" ref={reactFlowWrapper}>
            <Sidebar />
            <div className="flex-grow h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    fitView
                >
                    <Controls />
                    <Background />
                </ReactFlow>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-base-200 text-base-content w-full">
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