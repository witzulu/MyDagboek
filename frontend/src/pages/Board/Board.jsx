import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const Board = () => {
  const { projectId, boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
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

        const response = await fetch(`/api/boards/${boardId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch board details: ${response.status}`);
        }

        const data = await response.json();
        setBoard(data.board);
        setLists(data.lists);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchBoardDetails();
    }
  }, [boardId]);

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

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setLists((items) => {
        const oldIndex = items.findIndex(item => item._id === active.id);
        const newIndex = items.findIndex(item => item._id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // After reordering, update the backend
        const orderedListIds = newOrder.map(item => item._id);
        updateListOrder(orderedListIds);

        return newOrder;
      });
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

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">{board.name}</h1>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={lists.map(l => l._id)} strategy={horizontalListSortingStrategy}>
          <div className="flex items-start space-x-4 overflow-x-auto">
            {lists.map(list => (
              <SortableList
                key={list._id}
                list={list}
                onUpdateList={handleUpdateList}
                onDeleteList={handleDeleteList}
              />
            ))}
            <div className="w-72 flex-shrink-0">
              <AddListForm onCreateList={handleCreateList} />
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

const SortableList = ({ list, onUpdateList, onDeleteList }) => {
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <List list={list} onUpdateList={onUpdateList} onDeleteList={onDeleteList} />
    </div>
  );
};

const List = ({ list, onUpdateList, onDeleteList }) => {
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
        {!isRenaming ? (
          <h2 className="font-semibold">{list.name}</h2>
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
      {/* Cards will go here */}
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
