import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import List from '../../components/Board/List';
import CardModal from '../../components/Board/CardModal';

export default function Board() {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, task: null, listId: null });

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (!boardId) return;
    const fetchBoard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/boards/${boardId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error('Failed to fetch board');
        const data = await response.json();
        setBoard(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBoard();
  }, [boardId]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      // Logic for reordering lists
      setBoard((board) => {
        const oldIndex = board.lists.findIndex((list) => list._id === active.id);
        const newIndex = board.lists.findIndex((list) => list._id === over.id);
        return {
          ...board,
          lists: arrayMove(board.lists, oldIndex, newIndex),
        };
      });
      // Here you would also make an API call to save the new order of lists
    }
  };

  const openModal = (task = null, listId = null) => {
    setModalState({ isOpen: true, task, listId });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, task: null, listId: null });
  };

  const handleSaveTask = (savedTask) => {
    setBoard(prevBoard => {
      const newBoard = { ...prevBoard };
      const list = newBoard.lists.find(l => l._id === (savedTask.list || modalState.listId));
      if (list) {
        if (modalState.task) { // Editing
          const taskIndex = list.tasks.findIndex(t => t._id === savedTask._id);
          list.tasks[taskIndex] = savedTask;
        } else { // Creating
          list.tasks.push(savedTask);
        }
      }
      return newBoard;
    });
    closeModal();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!board) return <div>Board not found.</div>;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold">{board.name}</h2>
          <div>
            {/* TODO: Implement Edit and Delete Board functionality */}
            <button className="p-2 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Edit Board</button>
            <button className="p-2 ml-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">Delete Board</button>
          </div>
        </div>
        <div className="flex-1 overflow-x-auto">
          <SortableContext items={(board.lists || []).map(list => list._id)} strategy={horizontalListSortingStrategy}>
            <div className="flex h-full gap-4">
              {(board.lists || []).map(list => (
                <List
                  key={list._id}
                  list={list}
                  tasks={list.tasks}
                  onAddTask={() => openModal(null, list._id)}
                  onEditTask={(task) => openModal(task)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
        <CardModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onSave={handleSaveTask}
          task={modalState.task}
          listId={modalState.listId}
        />
      </div>
    </DndContext>
  );
}