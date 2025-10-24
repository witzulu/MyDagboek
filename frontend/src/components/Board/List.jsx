import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from './Card'; // Import the Card component

const List = ({ list, tasks, onAddTask, onEditTask }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({ id: list._id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4" {...listeners}>
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">
          {list.name}
          <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">({tasks.length})</span>
        </h3>
        <button
          onClick={onAddTask}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto">
        {tasks.map(task => (
          <Card key={task._id} task={task} onClick={() => onEditTask(task)} />
        ))}
      </div>
      <button
        onClick={onAddTask}
        className="mt-4 w-full text-left p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
      >
        + Add New Task
      </button>
    </div>
  );
};

export default List;
