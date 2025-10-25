import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from '../../components/Board/Card';
import CardModal from '../../components/Board/CardModal';
import EditBoardModal from '../../components/Board/EditBoardModal';
import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';


const Board = () => {
  const sensors = useSensors(
  useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
  useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
);

  const { projectId, boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [projectLabels, setProjectLabels] = useState([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isEditBoardModalOpen, setIsEditBoardModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [targetListId, setTargetListId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoardDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const [boardRes, labelsRes] = await Promise.all([
          fetch(`/api/boards/${boardId}`, {
            headers: { "Authorization": `Bearer ${token}` },
          }),
          fetch(`/api/projects/${projectId}/labels`, {
            headers: { "Authorization": `Bearer ${token}` },
          }),
        ]);

        if (!boardRes.ok) {
          throw new Error(`Failed to fetch board details: ${boardRes.status}`);
        }
        if (!labelsRes.ok) {
          throw new Error(`Failed to fetch labels: ${labelsRes.status}`);
        }

        const boardData = await boardRes.json();
        const labelsData = await labelsRes.json();

        setBoard(boardData.board);
        setLists(boardData.lists);
        setProjectLabels(labelsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchBoardDetails();
    }
  }, [boardId, projectId]);

  if (loading) return <div className="p-4">Loading board...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!board) return <div className="p-4">Board not found.</div>;

  const handleCreateList = async (listName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/boards/${boardId}/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: listName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create list');
      }

      const newList = await response.json();
      setLists(prevLists => [...prevLists, newList]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateList = async (listId, newName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update list');
      }

      const updatedList = await response.json();
      setLists(prevLists => prevLists.map(l => l._id === listId ? updatedList : l));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/lists/${listId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete list');
        }

        setLists(prevLists => prevLists.filter(l => l._id !== listId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const findList = (taskId) => lists.find(list => list.tasks.some(task => task._id === taskId));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    // Distinguish between list and task dragging
    const isListDrag = lists.some(list => list._id === active.id);

    if (isListDrag) {
      if (active.id !== over.id) {
        setLists((items) => {
          const oldIndex = items.findIndex(item => item._id === active.id);
          const newIndex = items.findIndex(item => item._id === over.id);
          const newOrder = arrayMove(items, oldIndex, newIndex);
          const orderedListIds = newOrder.map(item => item._id);
          updateListOrder(orderedListIds);
          return newOrder;
        });
      }
    } else {
      // Handle task drag
      const sourceList = findList(active.id);
      const destList = findList(over.id) || lists.find(list => list._id === over.id);

      if (!sourceList || !destList) return;

      setLists(prevLists => {
        const newLists = JSON.parse(JSON.stringify(prevLists));
        const sourceListIndex = newLists.findIndex(l => l._id === sourceList._id);
        const destListIndex = newLists.findIndex(l => l._id === destList._id);
        const sourceTaskIndex = newLists[sourceListIndex].tasks.findIndex(t => t._id === active.id);

        const [movedTask] = newLists[sourceListIndex].tasks.splice(sourceTaskIndex, 1);
        movedTask.list = destList._id;

        let destTaskIndex;
        if (sourceList._id === destList._id) {
          // Reordering within the same list
          destTaskIndex = newLists[destListIndex].tasks.findIndex(t => t._id === over.id);
          newLists[destListIndex].tasks.splice(destTaskIndex, 0, movedTask);
        } else {
          // Moving to a different list
          destTaskIndex = newLists[destListIndex].tasks.length;
          newLists[destListIndex].tasks.push(movedTask);
        }

        updateTaskPosition(movedTask, destList._id, destTaskIndex);

        return newLists;
      });
    }
  };

  const updateTaskPosition = async (task, newListId, newPosition) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/tasks/${task._id}/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newListId, newPosition }),
      });
    } catch (err) {
      setError("Failed to save task position.");
      // Optionally, revert the optimistic update here
    }
  };

  const updateListOrder = async (orderedListIds) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/boards/${boardId}/lists/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderedListIds }),
      });
    } catch (err) {
      setError("Failed to save list order.");
    }
  };

  const handleSaveTask = async ({ title, description, dueDate, labels, listId, taskId }) => {
    const url = taskId ? `/api/tasks/${taskId}` : '/api/tasks';
    const method = taskId ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, dueDate, labels, listId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save task: ${await response.text()}`);
      }

      const savedTask = await response.json();

      setLists(prevLists => {
        const newLists = JSON.parse(JSON.stringify(prevLists));
        const listIndex = newLists.findIndex(l => l._id === listId);

        if (listIndex === -1) return prevLists;

        if (taskId) {
          // Update existing task
          const taskIndex = newLists[listIndex].tasks.findIndex(t => t._id === taskId);
          if (taskIndex !== -1) {
            newLists[listIndex].tasks[taskIndex] = savedTask;
          }
        } else {
          // Add new task
          if (!newLists[listIndex].tasks) {
            newLists[listIndex].tasks = [];
          }
          newLists[listIndex].tasks.push(savedTask);
        }
        return newLists;
      });

    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateBoard = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error('Failed to update board');
      const updatedBoard = await response.json();
      setBoard(updatedBoard);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBoard = async () => {
    if (window.confirm('Are you sure you want to delete this board and all its contents?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/boards/${boardId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to delete board');
        navigate(`/projects/${projectId}/boards`);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to delete task');
        }

        setLists(prevLists => {
          const newLists = JSON.parse(JSON.stringify(prevLists));
          for (const list of newLists) {
            const taskIndex = list.tasks.findIndex(t => t._id === taskId);
            if (taskIndex !== -1) {
              list.tasks.splice(taskIndex, 1);
              break;
            }
          }
          return newLists;
        });
        setIsCardModalOpen(false);
        setEditingTask(null);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleNewLabel = async (labelData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(labelData),
      });
      if (!response.ok) throw new Error('Failed to create label');
      const newLabel = await response.json();
      setProjectLabels(prev => [...prev, newLabel]);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setEditingTask(null);
          setTargetListId(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={editingTask}
        listId={targetListId}
        projectLabels={projectLabels}
        onNewLabel={handleNewLabel}
      />
      <EditBoardModal
        isOpen={isEditBoardModalOpen}
        onClose={() => setIsEditBoardModalOpen(false)}
        onSave={handleUpdateBoard}
        board={board}
      />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{board.name}</h1>
        <div className="flex space-x-2">
          <button onClick={() => setIsEditBoardModalOpen(true)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">Edit</button>
          <button onClick={handleDeleteBoard} className="px-3 py-1 bg-red-500 text-white rounded-md">Delete</button>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={lists.map(l => l._id)} strategy={horizontalListSortingStrategy}>
            <div className="inline-flex h-full items-start space-x-4 pb-4">
              {lists.map(list => (
                <SortableList
                  key={list._id}
                  list={list}
                  onUpdateList={handleUpdateList}
                  onDeleteList={handleDeleteList}
                  onAddTask={() => { setTargetListId(list._id); setIsCardModalOpen(true); }}
                  onEditTask={(task) => { setEditingTask(task); setIsCardModalOpen(true); }}
                />
              ))}
              <div className="w-72 flex-shrink-0">
                <AddListForm onCreateList={handleCreateList} />
              </div>
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

const SortableList = ({ list, onUpdateList, onDeleteList, onAddTask, onEditTask }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: list._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <List
        list={list}
        onUpdateList={onUpdateList}
        onDeleteList={onDeleteList}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        dragHandleProps={{...attributes, ...listeners}}
      />
    </div>
  );
};

const List = ({ list, onUpdateList, onDeleteList, onAddTask, onEditTask, dragHandleProps }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(list.name);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (newName.trim() && newName.trim() !== list.name) {
      onUpdateList(list._id, newName.trim());
    }
    setIsRenaming(false);
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg w-72 flex-shrink-0">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div {...dragHandleProps} className="cursor-move p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip-vertical"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
          {!isRenaming ? (
            <h2 className="font-semibold ml-2">{list.name}</h2>
          ) : (
          <form onSubmit={handleRenameSubmit} className="flex-grow">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              onBlur={handleRenameSubmit}
              className="w-full p-1 rounded border-blue-500 border-2"
            />
          </form>
        )}
        </div>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1">...</button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg z-10">
              <button
                onClick={() => { setIsRenaming(true); setIsMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Rename
              </button>
              <button
                onClick={() => onDeleteList(list._id)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <SortableContext items={list.tasks?.map(t => t._id) || []}>
        <div className="mt-2 space-y-2">
          {list.tasks && list.tasks.map(task => (
            <div key={task._id} onClick={() => onEditTask(task)}>
              <Card task={task} />
            </div>
          ))}
        </div>
      </SortableContext>
      <div className="mt-3">
        <button onClick={onAddTask} className="w-full text-left p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
          + Add a card
        </button>
      </div>
    </div>
  );
};

const AddListForm = ({ onCreateList }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [listName, setListName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (listName.trim()) {
      onCreateList(listName.trim());
      setListName('');
      setIsEditing(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-left p-2 rounded-lg"
      >
        + Add another list
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
      <input
        type="text"
        value={listName}
        onChange={(e) => setListName(e.target.value)}
        placeholder="Enter list title..."
        autoFocus
        className="w-full p-2 rounded border-blue-500 border-2"
      />
      <div className="mt-2">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add List
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="ml-2 text-gray-600 dark:text-gray-400"
        >
          ✕
        </button>
      </div>
    </form>
  );
};

export default Board;
