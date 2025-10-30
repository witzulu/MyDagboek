import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Bot, User, Edit, Trash2, Save, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, markdownShortcutPlugin } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

const ChangeLog = () => {
    const { projectId } = useParams();
    const { user } = useContext(AuthContext);
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newMessage, setNewMessage] = useState('');
    const [newTags, setNewTags] = useState('');
    const [editingEntryId, setEditingEntryId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [editingTags, setEditingTags] = useState([]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(thirtyDaysAgo);
    const [endDate, setEndDate] = useState(today);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');

    const categoryStyles = {
        board: 'border-l-4 border-blue-500',
        note: 'border-l-4 border-green-500',
        team: 'border-l-4 border-yellow-500',
        snippet: 'border-l-4 border-purple-500',
        report: 'border-l-4 border-red-500',
        manual: 'border-l-4 border-gray-500',
    };

    const [activeFilters, setActiveFilters] = useState({
        board: true,
        note: true,
        team: true,
        snippet: true,
        report: true,
        manual: true,
    });

    const uniqueUsers = useMemo(() => {
        const userMap = new Map();
        entries.forEach(entry => {
            if (entry.user && !userMap.has(entry.user._id)) {
                userMap.set(entry.user._id, entry.user.name);
            }
        });
        return Array.from(userMap, ([id, name]) => ({ id, name }));
    }, [entries]);

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

        let categoryFilteredEntries = dateFilteredEntries.filter(entry => activeFilters[entry.category]);

        if (selectedUserId) {
            categoryFilteredEntries = categoryFilteredEntries.filter(entry => entry.user?._id === selectedUserId);
        }

        if (searchTerm) {
            categoryFilteredEntries = categoryFilteredEntries.filter(entry =>
                entry.message.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return categoryFilteredEntries;
    }, [entries, activeFilters, startDate, endDate, searchTerm, selectedUserId]);

    const handleFilterChange = (filter) => {
        setActiveFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
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

    const handleCreateEntry = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return toast.error('Message cannot be empty.');

        const tags = newTags.split(',').map(tag => tag.trim()).filter(Boolean);

        try {
            const response = await fetch(`/api/projects/${projectId}/changelog`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: newMessage, tags, category: 'manual' }),
            });
            if (!response.ok) throw new Error('Failed to create entry.');
            const newEntry = await response.json();
            setEntries([newEntry, ...entries]);
            setNewMessage('');
            setNewTags('');
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

        const tags = Array.isArray(editingTags)
            ? editingTags
            : editingTags.split(',').map(tag => tag.trim()).filter(Boolean);

        try {
            const response = await fetch(`/api/changelog/${entryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: editingText, tags }),
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

    const startEditing = (entry) => {
        setEditingEntryId(entry._id);
        setEditingText(entry.message);
        setEditingTags(entry.tags || []);
    };

    return (
        <div className="container mx-auto p-4 flex-1">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">Change Log</h1>
            </div>

            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <h2 className="card-title">Add a Manual Entry</h2>
                    <form onSubmit={handleCreateEntry}>
                        <div className="prose-sm max-w-none">
                            <MDXEditor
                                markdown={newMessage}
                                onChange={setNewMessage}
                                plugins={[headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(), markdownShortcutPlugin()]}
                                contentEditableClassName="!h-24"
                                placeholder="Manually log a change using Markdown..."
                            />
                        </div>
                        <input
                            type="text"
                            className="input input-bordered w-full mt-2"
                            placeholder="Tags (comma-separated)"
                            value={newTags}
                            onChange={(e) => setNewTags(e.target.value)}
                        />
                        <div className="card-actions justify-end mt-4">
                            <button type="submit" className="btn btn-primary">Add Entry</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <h2 className="card-title">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Start Date</span></label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input input-bordered w-full" />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">End Date</span></label>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input input-bordered w-full" />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Search</span></label>
                            <input type="text" placeholder="Search in messages..." className="input input-bordered" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Filter by User</span></label>
                            <select className="select select-bordered" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                                <option value="">All Users</option>
                                {uniqueUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="divider">Categories</div>
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
                    <div key={entry._id} className={`card shadow-lg ${entry.type === 'automatic' ? 'bg-base-200' : 'bg-base-100'} ${categoryStyles[entry.category] || categoryStyles.manual}`}>
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
                                <div className="prose-sm max-w-none mt-2">
                                    <MDXEditor
                                        markdown={editingText}
                                        onChange={setEditingText}
                                        plugins={[headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(), markdownShortcutPlugin()]}
                                        contentEditableClassName="!h-32"
                                    />
                                    <input
                                        type="text"
                                        className="input input-bordered w-full mt-2"
                                        placeholder="Tags (comma-separated)"
                                        value={Array.isArray(editingTags) ? editingTags.join(', ') : editingTags}
                                        onChange={(e) => setEditingTags(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="prose-sm max-w-none mt-2 text-base-content">
                                    <ReactMarkdown>{entry.message}</ReactMarkdown>
                                </div>
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
