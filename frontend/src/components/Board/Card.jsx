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
      className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm mb-2 cursor-pointer hover:shadow-md"
    >
      <div className="flex flex-wrap gap-1 mb-2">
        {task.labels?.map(label => (
          <span key={label._id} style={{ backgroundColor: label.color }} className="px-2 py-0.5 rounded text-white text-xs">
            {label.name}
          </span>
        ))}
      </div>
      <p className="text-sm">{task.title}</p>
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
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
        <div className="flex -space-x-2">
            {(task.assignees || []).map(user => (
               <div key={user._id} className="relative group">
                  <span className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold ring-2 ring-white dark:ring-gray-700">
                     {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </span>
                   <span className="absolute bottom-full mb-2 w-max px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {user.name}
                  </span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Card;
