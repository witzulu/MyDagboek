import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CreateBoardModal from '../../components/CreateBoardModal';

const Boards = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { projectId } = useParams();

  useEffect(() => {
    if (!projectId) return;

    const fetchBoards = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const response = await fetch(`/api/projects/${projectId}/boards`, {
          headers: {
            "Authorization": `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch boards: ${response.status}`);
        }

        const data = await response.json();
        setBoards(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [projectId]);

  const handleCreateBoard = async (boardData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(boardData),
      });

      if (!response.ok) {
        throw new Error('Failed to create board');
      }

      const newBoard = await response.json();
      setBoards(prevBoards => [...prevBoards, newBoard]);
      setIsModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Boards</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create New Board
        </button>
      </div>

      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateBoard}
      />

      {loading && <p>Loading boards...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {!loading && !error && boards.map(board => (
          <Link to={`/projects/${projectId}/boards/${board._id}`} key={board._id} className="block bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2">{board.name}</h2>
            <p className="text-gray-700 dark:text-gray-300">{board.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Boards;
