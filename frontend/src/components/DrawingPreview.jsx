import { Excalidraw } from "@excalidraw/excalidraw";
import { useEffect, useState } from "react";

export default function DrawingPreview({ drawingData, onEdit }) {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    if (drawingData) {
      try {
        const parsedData = JSON.parse(drawingData);
        if (Array.isArray(parsedData)) {
          setElements(parsedData);
        }
      } catch (error) {
        console.error("Failed to parse drawing data:", error);
      }
    }
  }, [drawingData]);

  if (!elements.length) {
    return null;
  }

  return (
    <div className="relative border rounded-lg my-4">
      <div style={{ height: "400px" }}>
        <Excalidraw
          initialData={{ elements }}
          viewModeEnabled={true}
        />
      </div>
      <button
        onClick={onEdit}
        className="absolute top-2 right-2 bg-white dark:bg-slate-700 p-2 rounded-lg shadow-md hover:bg-slate-100 dark:hover:bg-slate-600"
      >
        Edit Drawing
      </button>
    </div>
  );
}
