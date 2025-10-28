import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import CreateBoardModal from "../../components/CreateBoardModal";

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
        if (!token) throw new Error("Authentication token not found.");

        const response = await fetch(`/api/projects/${projectId}/boards`, {
          headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/projects/${projectId}/boards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(boardData),
      });

      if (!response.ok) throw new Error("Failed to create board");

      const newBoard = await response.json();
      setBoards((prev) => [...prev, newBoard]);
      setIsModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-base-200 text-base-content">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-base-content">Boards</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          + Create Board
        </button>
      </div>

      {/* Modal */}
      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateBoard}
      />

      {/* Loading & Error States */}
      {loading && (
        <div className="flex justify-center items-center mt-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {error && (
        <div className="alert alert-error shadow-lg mb-6">
          <span>Error: {error}</span>
        </div>
      )}

      {/* Boards Grid */}
      {!loading && !error && (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {boards.length > 0 ? (
            boards.map((board) => (
              <Link
                key={board._id}
                to={`/projects/${projectId}/boards/${board._id}`}
                className="card bg-base-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-base-300"
              >
                <div className="card-body">
                  <h2 className="card-title text-base-content">
                    {board.name}
                  </h2>
                  <p className="text-sm text-base-content/70">
                    {board.description || "No description"}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center text-base-content/70 italic">
              No boards yet. Create your first one!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Boards;
