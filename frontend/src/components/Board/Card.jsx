import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Star, CheckSquare, MessageSquare, MoreVertical, Edit, Trash2, Check, GripVertical, Clock } from 'lucide-react';

const Card = ({ task, onEditTask, onUpdateTask, onDeleteTask, onCompleteTask, onAddTimeEntry, isHighlighted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cardRef = useRef(null);
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

  const handlePriorityToggle = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${task._id}/priority`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to update priority');
      const updatedTask = await response.json();
      onUpdateTask(updatedTask);
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const priorityConfig = {
    'High': { color: 'text-red-500', fill: 'fill-red-500' },
    'Medium': { color: 'text-yellow-500', fill: 'fill-yellow-500' },
    'Low': { color: 'text-green-500', fill: 'fill-green-500' },
  };

  const { color: priorityColor, fill: priorityFill } = priorityConfig[task.priority] || { color: 'text-gray-400', fill: 'none' };

  const checklistExists = task.checklist && task.checklist.length > 0;
  let completedItems = 0;
  if (checklistExists) {
    completedItems = task.checklist.filter(item => item.done).length;
  }

  const commentsExist = task.comments && task.comments.length > 0;

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  const formatTime = (minutes) => {
    if (!minutes || minutes < 1) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let formatted = '';
    if (hours > 0) {
      formatted += `${hours}h `;
    }
    if (mins > 0) {
      formatted += `${mins}m`;
    }
    return formatted.trim();
  };

  return (
    <div
      ref={node => {
        setNodeRef(node);
        cardRef.current = node;
      }}
      style={style}
      className={`p-3 bg-base-100 rounded-md shadow-sm mb-2 flex items-start gap-2 ${isHighlighted ? 'ring-2 ring-primary ring-offset-2' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-move pt-1">
        <GripVertical size={18} className="text-base-content/50" />
      </div>
      <div className="flex-grow">
        <div onClick={() => onEditTask(task)} className="cursor-pointer">
          <div className="flex flex-wrap gap-1 mb-2">
            {task.labels?.map(label => (
              <span key={label._id} style={{ backgroundColor: label.color }} className="px-2 py-0.5 rounded text-xs text-white">
                {label.name}
              </span>
            ))}
          </div>
          <p className="text-sm text-base-content">{task.title}</p>
        </div>

        <div className="flex justify-between items-center mt-2 text-xs text-base-content/70">
          <div className="flex items-center space-x-2">
            {task.totalTimeSpent > 0 && (
              <span className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{formatTime(task.totalTimeSpent)}</span>
              </span>
            )}
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
              {task.assignees?.map(assignee => (
                  assignee && assignee._id && assignee.name && (
                      <div key={assignee._id} className="tooltip" data-tip={assignee.name}>
                          <div className="avatar">
                              <div className="w-6 h-6 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs">
                                  {assignee.name.charAt(0)}
                              </div>
                          </div>
                      </div>
                  )
              ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-center">
            <button onClick={handlePriorityToggle} className={`p-1 ${priorityColor}`}>
              <Star size={18} className={priorityFill} />
            </button>
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="p-1">
                <MoreVertical size={18} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-md shadow-lg z-10">
                  <button onClick={(e) => { e.stopPropagation(); onEditTask(task); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary"><Edit size={14} className="inline mr-2" />Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); onAddTimeEntry(task); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary"><Clock size={14} className="inline mr-2" />Add Time Entry</button>
                  <button onClick={(e) => { e.stopPropagation(); onDeleteTask(task._id); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary"><Trash2 size={14} className="inline mr-2" />Delete</button>
                  <button onClick={(e) => { e.stopPropagation(); onCompleteTask(task._id); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary"><Check size={14} className="inline mr-2" />Mark as Completed</button>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
