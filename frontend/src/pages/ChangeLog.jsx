import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, Bot, User, PlusCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, markdownShortcutPlugin, toolbarPlugin, UndoRedo, BoldItalicUnderlineToggles } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

const ChangeLog = () => {
    const { projectId } = useParams();
    const { user } = useContext(AuthContext);
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form states
    const [isCreating, setIsCreating] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [newSelectedLabels, setNewSelectedLabels] = useState([]);
    const [editingEntryId, setEditingEntryId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [editingLabels, setEditingLabels] = useState([]);

    const [projectLabels, setProjectLabels] = useState([]);

    // Filtering state
    const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedLabelIds, setSelectedLabelIds] = useState([]);
    const [activeFilters, setActiveFilters] = useState({ board: true, note: true, team: true, snippet: true, report: true, manual: true });

    const categoryStyles = {
        board: 'border-l-4 border-blue-500', note: 'border-l-4 border-green-500', team: 'border-l-4 border-yellow-500',
        snippet: 'border-l-4 border-purple-500', report: 'border-l-4 border-red-500', manual: 'border-l-4 border-gray-500',
    };

    const token = localStorage.getItem('token');

    const fetchProjectData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [entriesRes, labelsRes] = await Promise.all([
                fetch(`/api/projects/${projectId}/changelog`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/projects/${projectId}/labels`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            if (!entriesRes.ok) throw new Error('Failed to fetch changelog entries.');
            if (!labelsRes.ok) throw new Error('Failed to fetch project labels.');
            const entriesData = await entriesRes.json();
            const labelsData = await labelsRes.json();
            setEntries(entriesData);
            setProjectLabels(labelsData);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [projectId, token]);

    useEffect(() => { if (projectId) fetchProjectData(); }, [projectId, fetchProjectData]);

    const uniqueUsers = useMemo(() => Array.from(new Map(entries.map(e => [e.user?._id, e.user])).values()).filter(Boolean), [entries]);
    const allLabelsInEntries = useMemo(() => Array.from(new Map(entries.flatMap(e => e.labels).map(l => [l?._id, l])).values()).filter(Boolean), [entries]);

    const filteredEntries = useMemo(() => entries.filter(entry => {
        const createdAt = new Date(entry.createdAt);
        if (startDate && new Date(entry.createdAt) < new Date(startDate)) return false;
        if (endDate) {
             const end = new Date(endDate);
             end.setUTCHours(23, 59, 59, 999);
             if (createdAt > end) return false;
        }
        if (!activeFilters[entry.category]) return false;
        if (selectedUserId && entry.user?._id !== selectedUserId) return false;
        if (searchTerm && !entry.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (selectedLabelIds.length > 0 && !selectedLabelIds.every(id => entry.labels?.some(l => l._id === id))) return false;
        return true;
    }), [entries, activeFilters, startDate, endDate, searchTerm, selectedUserId, selectedLabelIds]);

    const handleCreateEntry = async () => {
        if (!newMessage.trim()) return toast.error('Message cannot be empty.');
        try {
            const response = await fetch(`/api/projects/${projectId}/changelog`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: newMessage, labels: newSelectedLabels }),
            });
            if (!response.ok) throw new Error('Failed to create entry.');
            const newEntry = await response.json();
            setEntries(prev => [newEntry, ...prev]);
            toast.success('New manual entry added!');
            setNewMessage(''); setNewSelectedLabels([]); setIsCreating(false);
        } catch (err) { toast.error(err.message); }
    };

    const handleUpdateEntry = async (entryId) => {
        if (!editingText.trim()) return toast.error('Message cannot be empty.');
        try {
            const response = await fetch(`/api/changelog/${entryId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: editingText, labels: editingLabels }),
            });
            if (!response.ok) throw new Error('Failed to update entry.');
            const updatedEntry = await response.json();
            setEntries(entries.map((entry) => (entry._id === entryId ? updatedEntry : entry)));
            setEditingEntryId(null);
            toast.success('Entry updated!');
        } catch (err) { toast.error(err.message); }
    };

    const handleDeleteEntry = async (entryId) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            const response = await fetch(`/api/changelog/${entryId}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete entry.');
            setEntries(entries.filter((entry) => entry._id !== entryId));
            toast.success('Entry deleted!');
        } catch (err) { toast.error(err.message); }
    };

    const handleToggleReportInclusion = async (entryId) => {
        try {
            const response = await fetch(`/api/changelog/${entryId}/toggle-report`, {
                method: 'PUT', headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to update status.');
            const updatedEntry = await response.json();
            setEntries(entries.map((entry) => (entry._id === entryId ? updatedEntry : entry)));
            toast.success(`Entry will ${updatedEntry.includeInReport ? 'now' : 'no longer'} be in reports.`);
        } catch (err) { toast.error(err.message); }
    };

    const startEditing = (entry) => {
        setEditingEntryId(entry._id);
        setEditingText(entry.message);
        setEditingLabels(entry.labels.map(l => l._id));
    };

    const toggleLabel = (labelId, stateSetter) => {
        stateSetter(prev => prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]);
    };

    const renderLabelSelector = (selectedLabels, handler) => (
        <div className="form-control mt-4">
            <label className="label"><span className="label-text">Labels</span></label>
            <div className="flex flex-wrap gap-2">
                {projectLabels.map(label => (
                    <button key={label._id} onClick={() => handler(label._id)}
                        className={`btn btn-xs ${selectedLabels.includes(label._id) ? '' : 'btn-outline'}`}
                        style={selectedLabels.includes(label._id) ? { backgroundColor: label.color, color: 'white' } : { borderColor: label.color, color: label.color }}>
                        {label.name}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="container mx-auto p-4 flex-1">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">Change Log</h1>
                <button onClick={() => setIsCreating(!isCreating)} className="btn btn-primary"><PlusCircle size={20} /> Add Manual Entry</button>
            </div>

            {isCreating && (
                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <h2 className="card-title">New Manual Entry</h2>
                        <MDXEditor markdown={newMessage} onChange={setNewMessage} plugins={[toolbarPlugin({ toolbarContents: () => <><UndoRedo /><BoldItalicUnderlineToggles /></> }), headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(), markdownShortcutPlugin()]} contentEditableClassName="!h-32 bg-base-200" />
                        {renderLabelSelector(newSelectedLabels, (id) => toggleLabel(id, setNewSelectedLabels))}
                        <div className="card-actions justify-end mt-4">
                            <button onClick={() => setIsCreating(false)} className="btn btn-ghost">Cancel</button>
                            <button onClick={handleCreateEntry} className="btn btn-success">Submit</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card bg-base-100 shadow-xl mb-6">
                 <div className="card-body">
                    <h2 className="card-title">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="form-control"><label className="label"><span className="label-text">Start Date</span></label><input type="date" className="input input-bordered" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                        <div className="form-control"><label className="label"><span className="label-text">End Date</span></label><input type="date" className="input input-bordered" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
                        <div className="form-control"><label className="label"><span className="label-text">Search</span></label><input type="text" placeholder="Search..." className="input input-bordered" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                        <div className="form-control"><label className="label"><span className="label-text">User</span></label><select className="select select-bordered" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}><option value="">All Users</option>{uniqueUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}</select></div>
                    </div>
                    <div className="divider">Categories</div>
                    <div className="flex flex-wrap gap-2">{Object.keys(activeFilters).map(filter => <button key={filter} onClick={() => setActiveFilters(p => ({ ...p, [filter]: !p[filter] }))} className={`btn btn-sm ${activeFilters[filter] ? 'btn-primary' : 'btn-outline'}`}>{filter}</button>)}</div>
                    <div className="divider">Labels</div>
                    <div className="flex flex-wrap gap-2">{allLabelsInEntries.map(label => <button key={label._id} onClick={() => toggleLabel(label._id, setSelectedLabelIds)} className={`btn btn-xs ${selectedLabelIds.includes(label._id) ? '' : 'btn-outline'}`} style={selectedLabelIds.includes(label._id) ? { backgroundColor: label.color, color: 'white' } : { borderColor: label.color, color: label.color }}>{label.name}</button>)}</div>
                </div>
            </div>

            {isLoading && <div className="text-center"><span className="loading loading-spinner"></span></div>}
            {error && <p className="text-center text-error">{error}</p>}

            <div className="space-y-4">
                {filteredEntries.map(entry => (
                    <div key={entry._id} className={`card shadow-lg ${entry.type === 'automatic' ? 'bg-base-200' : 'bg-base-100'} ${categoryStyles[entry.category] || categoryStyles.manual}`}>
                        <div className="card-body">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    {entry.type === 'automatic' ? <Bot size={20} className="text-accent" /> : <User size={20} />}
                                    <div>
                                        <p className="font-bold text-lg text-foreground">{entry.user?.name || 'Unknown'}</p>
                                        <p className="text-xs text-base-content opacity-60">{new Date(entry.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className={`badge ${entry.type === 'manual' ? 'badge-info' : 'badge-ghost'}`}>{entry.type}</div>
                                </div>
                                <div className="card-actions items-center">
                                    <div className="form-control" title={entry.includeInReport ? 'Include in reports' : 'Exclude from reports'}><input type="checkbox" className="toggle toggle-sm" checked={entry.includeInReport} onChange={() => handleToggleReportInclusion(entry._id)} /></div>
                                    {user && entry.user?._id === user.id && entry.type === 'manual' && (
                                        <>
                                            <button onClick={() => editingEntryId === entry._id ? setEditingEntryId(null) : startEditing(entry)} className="btn btn-ghost btn-sm"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteEntry(entry._id)} className="btn btn-ghost btn-sm text-error"><Trash2 size={16} /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                            {editingEntryId === entry._id ? (
                                <div>
                                    <MDXEditor markdown={editingText} onChange={setEditingText} plugins={[toolbarPlugin({ toolbarContents: () => <><UndoRedo /><BoldItalicUnderlineToggles /></> }), headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(), markdownShortcutPlugin()]} contentEditableClassName="!h-32 bg-base-200" />
                                    {renderLabelSelector(editingLabels, (id) => toggleLabel(id, setEditingLabels))}
                                    <div className="card-actions justify-end mt-2">
                                        <button onClick={() => setEditingEntryId(null)} className="btn btn-ghost">Cancel</button>
                                        <button onClick={() => handleUpdateEntry(entry._id)} className="btn btn-success">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="prose-sm max-w-none mt-2 text-base-content"><ReactMarkdown>{entry.message}</ReactMarkdown></div>
                            )}
                            {entry.labels && entry.labels.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {entry.labels.map(label => <div key={label._id} className="badge" style={{ backgroundColor: label.color, color: 'white', border: 'none' }}>{label.name}</div>)}
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