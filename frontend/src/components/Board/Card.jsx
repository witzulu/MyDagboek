import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckSquare, MessageSquare } from 'lucide-react';

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

  const checklistExists = task.checklist && task.checklist.length > 0;
  let completedItems = 0;
  if (checklistExists) {
    completedItems = task.checklist.filter(item => item.done).length;
  }

  const commentsExist = task.comments && task.comments.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className=" p-3 btn-accent rounded-md shadow-sm mb-2 cursor-pointer hover:shadow-md m-2  bg-accent-content/10 "
    >
  

      <div className="flex flex-wrap gap-1 mb-2">
        {task.labels?.map(label => (
          <span key={label._id} style={{ backgroundColor: label.color }} className="px-2 py-0.5 rounded text-xs text-accent-content">
            {label.name}
          </span>
        ))}
      </div>
      <p className="text-sm text-primary/">{task.title}</p>
      <div className="flex justify-between items-center mt-2 text-xs  text-secondary">
        <div>
        {task.dueDate && (
          <span>
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        </div>
        <div className="flex items-center space-x-2">
        {commentsExist && (
          <span className="flex items-center space-x-1">
            <MessageSquare size={14} />
            <span>{task.comments.length}</span>
          </span>
        )}
        {checklistExists && (
          <span className={`flex items-center space-x-1 px-2 py-1 rounded ${completedItems === task.checklist.length ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : ''}`}>
            <CheckSquare size={14} />
            <span>{completedItems}/{task.checklist.length}</span>
          </span>
        )}
        </div>
      </div>
    </div>
  );
};

export default Card;
