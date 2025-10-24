import { useState, useEffect } from 'react';
import { useProject } from '../hooks/useProject';
import { Plus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import CreateBoardModal from '../components/CreateBoardModal';

export default function Boards() {
  const { selectedProject } = useProject();
  const { projectId } = useParams();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentProjectId = selectedProject?._id || projectId;

  useEffect(() => {
    if (!currentProjectId) {
        setLoading(false);
        return;
    };

    const fetchBoards = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${currentProjectId}/boards`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch boards');
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
  }, [currentProjectId]);

  const handleBoardCreated = (newBoard) => {
    setBoards(prevBoards => [...prevBoards, newBoard]);
  };

  if (loading) return <div>Loading boards...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            {selectedProject ? `${selectedProject.name}: Boards` : 'Boards'}
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
        >
          <Plus className="w-4 h-4" />
          New Board
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board) => (
          <Link to={`/projects/${currentProjectId}/boards/${board._id}`} key={board._id}>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">{board.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{board.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBoardCreated={handleBoardCreated}
        projectId={currentProjectId}
      />
    </div>
  );
}
