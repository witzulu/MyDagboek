import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, Save, X, Bot, User, Download } from 'lucide-react';
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

    // Set default date range to last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(thirtyDaysAgo);
    const [endDate, setEndDate] = useState(today);

    const [activeFilters, setActiveFilters] = useState({
        board: true,
        note: true,
        manual: true,
    });

    const token = localStorage.getItem('token');

    const fetchEntries = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/changelog`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch changelog entries.');
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
        if (projectId) fetchEntries();
    }, [projectId, fetchEntries]);

    const filteredEntries = useMemo(() => {
        let dateFilteredEntries = entries;
        if (startDate) {
            const start = new Date(startDate);
            start.setUTCHours(0, 0, 0, 0);
            dateFilteredEntries = dateFilteredEntries.filter(entry => new Date(entry.createdAt) >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            dateFilteredEntries = dateFilteredEntries.filter(entry => new Date(entry.createdAt) <= end);
        }

        return dateFilteredEntries.filter(entry => activeFilters[entry.category]);
    }, [entries, activeFilters, startDate, endDate]);

    const handleFilterChange = (filter) => {
        setActiveFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
    };

    const handleCreateEntry = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return toast.error('Message cannot be empty.');

        try {
            const response = await fetch(`/api/projects/${projectId}/changelog`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: newMessage, category: 'manual' }),
            });
            if (!response.ok) throw new Error('Failed to create entry.');
            const newEntry = await response.json();
            setEntries([newEntry, ...entries]);
            setNewMessage('');
            toast.success('Entry added!');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDeleteEntry = async (entryId) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const response = await fetch(`/api/changelog/${entryId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete entry.');
            setEntries(entries.filter((entry) => entry._id !== entryId));
            toast.success('Entry deleted!');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleUpdateEntry = async (entryId) => {
        if (!editingText.trim()) return toast.error('Message cannot be empty.');
        try {
            const response = await fetch(`/api/changelog/${entryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: editingText }),
            });
            if (!response.ok) throw new Error('Failed to update entry.');
            const updatedEntry = await response.json();
            setEntries(entries.map((entry) => (entry._id === entryId ? updatedEntry : entry)));
            setEditingEntryId(null);
            setEditingText('');
            toast.success('Entry updated!');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleToggleReportInclusion = async (entryId) => {
        try {
            const response = await fetch(`/api/changelog/${entryId}/toggle-report`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to update entry status.');
            const updatedEntry = await response.json();
            setEntries(entries.map((entry) => (entry._id === entryId ? updatedEntry : entry)));
            toast.success(`Entry will ${updatedEntry.includeInReport ? 'now' : 'no longer'} be included in reports.`);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const startEditing = (entry) => {
        setEditingEntryId(entry._id);
        setEditingText(entry.message);
    };

    const handleExportMarkdown = () => {
        const exportableEntries = filteredEntries.filter(entry => entry.includeInReport);
        if (exportableEntries.length === 0) {
            toast.error("No entries to export with current filters.");
            return;
        }

        const markdownContent = exportableEntries
            .map(entry => `**[${new Date(entry.createdAt).toLocaleDateString()}]** - **${entry.user?.name || 'System'}**: ${entry.message}`)
            .join('\n\n');

        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `changelog-${projectId}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Changelog exported!");
    };

    return (
        <div className="container mx-auto p-4 flex-1">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-foreground">Change Log</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Export Change Log</h2>
                        <div className="flex items-center space-x-4">
                             <div>
                                <label htmlFor="start-date" className="block text-sm font-medium">Start Date</label>
                                <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input input-bordered w-full" />
                            </div>
                            <div>
                                <label htmlFor="end-date" className="block text-sm font-medium">End Date</label>
                                <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input input-bordered w-full" />
                            </div>
                        </div>
                         <div className="card-actions justify-end mt-4">
                            <button onClick={handleExportMarkdown} className="btn btn-secondary">
                                <Download size={16} /> Export to Markdown
                            </button>
                        </div>
                    </div>
                </div>
                 <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Add a Manual Entry</h2>
                        <form onSubmit={handleCreateEntry}>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                rows="2"
                                placeholder="Manually log a change..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <div className="card-actions justify-end mt-4">
                                <button type="submit" className="btn btn-primary">Add Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <h2 className="card-title">Filter by Category</h2>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(activeFilters).map(filter => (
                            <button
                                key={filter}
                                onClick={() => handleFilterChange(filter)}
                                className={`btn btn-sm ${activeFilters[filter] ? 'btn-primary' : 'btn-outline'}`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isLoading && <div className="text-center"><span className="loading loading-spinner"></span></div>}
            {error && <p className="text-center text-error">{error}</p>}

            <div className="space-y-4">
                {filteredEntries.map((entry) => (
                    <div key={entry._id} className={`card shadow-lg ${entry.type === 'automatic' ? 'bg-base-200' : 'bg-base-100'}`}>
                        <div className="card-body">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    {entry.type === 'automatic' ? <Bot size={20} className="text-accent" /> : <User size={20} />}
                                    <div>
                                        <p className="font-bold text-lg text-foreground">{entry.user?.name || 'Unknown'}</p>
                                        <p className="text-xs text-base-content opacity-60">{new Date(entry.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="card-actions items-center">
                                    <div className="form-control" title={entry.includeInReport ? 'Include in reports' : 'Exclude from reports'}>
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-sm"
                                            checked={entry.includeInReport}
                                            onChange={() => handleToggleReportInclusion(entry._id)}
                                        />
                                    </div>
                                    {user && entry.user?._id === user.id && entry.type === 'manual' && (
                                        <>
                                            {editingEntryId === entry._id ? (
                                                <>
                                                    <button onClick={() => handleUpdateEntry(entry._id)} className="btn btn-ghost btn-sm"><Save size={16} /></button>
                                                    <button onClick={() => setEditingEntryId(null)} className="btn btn-ghost btn-sm"><X size={16} /></button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEditing(entry)} className="btn btn-ghost btn-sm"><Edit size={16} /></button>
                                                    <button onClick={() => handleDeleteEntry(entry._id)} className="btn btn-ghost btn-sm text-error"><Trash2 size={16} /></button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
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
            {!isLoading && filteredEntries.length === 0 && <p className="text-center text-base-content opacity-70 mt-8">No entries match the current filters.</p>}
        </div>
    );
};

export default ChangeLog;
