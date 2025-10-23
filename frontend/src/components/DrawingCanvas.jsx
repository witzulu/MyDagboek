import { Excalidraw } from "@excalidraw/excalidraw";
import { useState, useEffect } from "react";

export default function DrawingCanvas({ initialData, onSave, onClose }) {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    if (initialData) {
      try {
        const parsedData = JSON.parse(initialData);
        if (Array.isArray(parsedData)) {
          setElements(parsedData);
        }
      } catch (error) {
        console.error("Failed to parse initial drawing data:", error);
      }
    }
  }, [initialData]);

  const handleSave = () => {
    const drawingData = JSON.stringify(elements);
    onSave(drawingData);
  };

  return (
    <div style={{ height: "500px", position: "relative" }}>
      <Excalidraw
        initialData={{ elements }}
        onChange={(newElements) => setElements(newElements)}
      />
      <div style={{ position: "absolute", bottom: "10px", right: "10px", zIndex: 10 }}>
        <button onClick={handleSave} style={{ marginRight: "10px" }}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
