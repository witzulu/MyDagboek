import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckSquare, MessageSquare, MoreVertical, Star } from 'lucide-react';

const Card = ({ task, onEditTask, onCompleteTask }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    attributes,
    listeners: dndListeners,
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

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEditTask(task);
    setIsMenuOpen(false);
  };

  const handleCompleteClick = (e) => {
    e.stopPropagation();
    onCompleteTask(task._id);
    setIsMenuOpen(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative p-3 btn-accent rounded-md shadow-sm mb-2 hover:shadow-md m-2 bg-accent-content/10"
    >
      <div {...dndListeners} onClick={() => onEditTask(task)} className="cursor-pointer">
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels?.map(label => (
            <span key={label._id} style={{ backgroundColor: label.color }} className="px-2 py-0.5 rounded text-xs text-accent-content">
              {label.name}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-start">
          <p className="text-sm text-primary flex-grow">{task.title}</p>
          {task.isImportant && <Star size={16} className="text-yellow-500 fill-current ml-2" />}
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-secondary">
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
      <div className="absolute top-1 right-1">
        <button onClick={handleMenuClick} className="p-1 rounded-full hover:bg-base-100/50">
          <MoreVertical size={16} />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-md shadow-lg z-20">
            <button
              onClick={handleEditClick}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary"
            >
              Edit
            </button>
            <button
              onClick={handleCompleteClick}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary"
            >
              Mark as Complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
