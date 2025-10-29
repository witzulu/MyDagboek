import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, Save, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ChangeLog = () => {
    const { projectId } = useParams();
    const { user } = useContext(AuthContext);
    const [entries, setEntries] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingEntryId, setEditingEntryId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const token = localStorage.getItem('token');

    const fetchEntries = useCallback(async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/changelog`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch changelog entries.');
            }
            const data = await response.json();
            setEntries(data);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [projectId, token]);

    useEffect(() => {
        if (projectId) {
            fetchEntries();
        }
    }, [projectId, fetchEntries]);

    const handleCreateEntry = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) {
            toast.error('Message cannot be empty.');
            return;
        }
        try {
            const response = await fetch(`/api/projects/${projectId}/changelog`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: newMessage }),
            });
            if (!response.ok) {
                throw new Error('Failed to create entry.');
            }
            const newEntry = await response.json();
            setEntries([newEntry, ...entries]);
            setNewMessage('');
            toast.success('Entry added successfully!');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteEntry = async (entryId) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                const response = await fetch(`/api/changelog/${entryId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) {
                    throw new Error('Failed to delete entry.');
                }
                setEntries(entries.filter((entry) => entry._id !== entryId));
                toast.success('Entry deleted!');
            } catch (err) {
                toast.error(err.message);
            }
        }
    };

    const handleUpdateEntry = async (entryId) => {
        if (!editingText.trim()) {
            toast.error('Message cannot be empty.');
            return;
        }
        try {
            const response = await fetch(`/api/changelog/${entryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: editingText }),
            });
            if (!response.ok) {
                throw new Error('Failed to update entry.');
            }
            const updatedEntry = await response.json();
            setEntries(entries.map((entry) => (entry._id === entryId ? updatedEntry : entry)));
            setEditingEntryId(null);
            setEditingText('');
            toast.success('Entry updated!');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const startEditing = (entry) => {
        setEditingEntryId(entry._id);
        setEditingText(entry.message);
    };

    const cancelEditing = () => {
        setEditingEntryId(null);
        setEditingText('');
    };

    return (
        <div className="container mx-auto p-4 flex-1">
            <h1 className="text-3xl font-bold mb-6 text-foreground">Change Log</h1>

            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <h2 className="card-title">Add a New Entry</h2>
                    <form onSubmit={handleCreateEntry}>
                        <textarea
                            className="textarea textarea-bordered w-full"
                            rows="3"
                            placeholder="What's new?"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        ></textarea>
                        <div className="card-actions justify-end mt-4">
                            <button type="submit" className="btn btn-primary">
                                Add Entry
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {isLoading && <p className="text-center">Loading entries...</p>}
            {error && <p className="text-center text-error">{error}</p>}

            <div className="space-y-4">
                {entries.map((entry) => (
                    <div key={entry._id} className="card bg-base-100 shadow-lg">
                        <div className="card-body">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg text-foreground">
                                        {entry.user?.name || 'Unknown User'}
                                    </p>
                                    <p className="text-xs text-base-content opacity-60">
                                        {new Date(entry.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                {user && entry.user?._id === user.id && (
                                    <div className="card-actions">
                                        {editingEntryId === entry._id ? (
                                            <>
                                                <button onClick={() => handleUpdateEntry(entry._id)} className="btn btn-ghost btn-sm">
                                                    <Save size={16} />
                                                </button>
                                                <button onClick={cancelEditing} className="btn btn-ghost btn-sm">
                                                    <X size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEditing(entry)} className="btn btn-ghost btn-sm">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteEntry(entry._id)} className="btn btn-ghost btn-sm text-error">
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                             {editingEntryId === entry._id ? (
                                <textarea
                                    className="textarea textarea-bordered w-full mt-2"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    rows={3}
                                />
                            ) : (
                                <p className="mt-2 text-base-content">{entry.message}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
             { !isLoading && entries.length === 0 && (
                <p className="text-center text-base-content opacity-70 mt-8">No changelog entries yet. Be the first to add one!</p>
            )}
        </div>
    );
};

export default ChangeLog;
