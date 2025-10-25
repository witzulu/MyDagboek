import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const Card = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm mb-2 cursor-pointer hover:shadow-md"
    >
      <div className="flex flex-wrap gap-1 mb-2">
        {task.labels?.map(label => (
          <span key={label._id} style={{ backgroundColor: label.color }} className="px-2 py-0.5 rounded text-white text-xs">
            {label.name}
          </span>
        ))}
      </div>
      <p>{task.title}</p>
      {task.dueDate && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default Card;
