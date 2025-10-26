import React, { useState, useEffect, useContext } from 'react';
import LabelManager from './LabelManager';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { 
  MDXEditor, 
  UndoRedo, 
  BoldItalicUnderlineToggles, 
  linkPlugin, 
  headingsPlugin, 
  listsPlugin, 
  quotePlugin, 
  thematicBreakPlugin,
  diffSourcePlugin,
   DiffSourceToggleWrapper, 
  toolbarPlugin
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { AuthContext } from '../../context/AuthContext';

const CardModal = ({ isOpen, onClose, onSave, onDelete, task, listId, projectMembers, projectLabels, onNewLabel, onTaskUpdate }) => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState('Medium');
  const [assignedLabels, setAssignedLabels] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [comments, setComments] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingChecklistItem, setEditingChecklistItem] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null);
        setPriority(task.priority || 'Medium');
        setAssignedLabels(task.labels || []);
        setAssignedUsers(task.assignees || []);
        setAttachments(task.attachments || []);
        setChecklist(task.checklist || []);
        setComments(task.comments || []);
      } else {
        setTitle('');
        setDescription('');
        setDueDate(null);
        setPriority('Medium');
        setAssignedLabels([]);
        setAssignedUsers([]);
        setAttachments([]);
        setChecklist([]);
        setComments([]);
      }
      setNewChecklistItem('');
      setEditingChecklistItem(null);
      setEditingText('');
      setNewComment('');
      setEditingComment(null);
      setEditingCommentText('');
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const getToken = () => localStorage.getItem('token');

  const handleSubmit = () => {
    onSave({
      title,
      description,
      dueDate,
      priority,
      labels: assignedLabels.map(l => l._id || l),
      assignees: assignedUsers.map(u => u._id || u),
      listId: task ? task.list : listId,
      taskId: task ? task._id : null
    });
    onClose();
  };

  const handleLabelToggle = (labelId) => {
    const isAssigned = assignedLabels.some(l => l._id === labelId);
    if (isAssigned) {
        setAssignedLabels(prev => prev.filter(l => l._id !== labelId));
    } else {
        const labelToAdd = projectLabels.find(l => l._id === labelId);
        if(labelToAdd) setAssignedLabels(prev => [...prev, labelToAdd]);
    }
  };

  const handleAssigneeToggle = (userId) => {
    const isAssigned = assignedUsers.some(u => u._id === userId);
    if (isAssigned) {
      setAssignedUsers(prev => prev.filter(u => u._id !== userId));
    } else {
      const userToAdd = (projectMembers || []).find(m => m._id === userId);
      if (userToAdd) {
        setAssignedUsers(prev => [...prev, userToAdd]);
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !task) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/tasks/${task._id}/attachments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData,
      });
      if (res.ok) {
        const updatedAttachments = await res.json();
        setAttachments(updatedAttachments);
        onTaskUpdate({ ...task, attachments: updatedAttachments });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      const res = await fetch(`/api/tasks/${task._id}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const updatedAttachments = await res.json();
        setAttachments(updatedAttachments);
        onTaskUpdate({ ...task, attachments: updatedAttachments });
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${task._id}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ text: newChecklistItem }),
      });
      if (res.ok) {
        const updatedChecklist = await res.json();
        setChecklist(updatedChecklist);
        setNewChecklistItem('');
        onTaskUpdate({ ...task, checklist: updatedChecklist });
      }
    } catch (error) {
      console.error('Error adding checklist item:', error);
    }
  };

  const handleUpdateChecklistItem = async (itemId) => {
    if (!editingText.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${task._id}/checklist/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ text: editingText }),
      });
      if (res.ok) {
        const updatedChecklist = await res.json();
        setChecklist(updatedChecklist);
        setEditingChecklistItem(null);
        setEditingText('');
        onTaskUpdate({ ...task, checklist: updatedChecklist });
      }
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const handleToggleChecklistItem = async (itemId, currentStatus) => {
    try {
      const res = await fetch(`/api/tasks/${task._id}/checklist/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ done: !currentStatus }),
      });
      if (res.ok) {
        const updatedChecklist = await res.json();
        setChecklist(updatedChecklist);
        onTaskUpdate({ ...task, checklist: updatedChecklist });
      }
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const handleDeleteChecklistItem = async (itemId) => {
    try {
      const res = await fetch(`/api/tasks/${task._id}/checklist/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const updatedChecklist = await res.json();
        setChecklist(updatedChecklist);
        onTaskUpdate({ ...task, checklist: updatedChecklist });
      }
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${task._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        const updatedComments = await res.json();
        setComments(updatedComments);
        setNewComment('');
        onTaskUpdate({ ...task, comments: updatedComments });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentText.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${task._id}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ content: editingCommentText }),
      });
      if (res.ok) {
        const updatedComments = await res.json();
        setComments(updatedComments);
        setEditingComment(null);
        setEditingCommentText('');
        onTaskUpdate({ ...task, comments: updatedComments });
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`/api/tasks/${task._id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const updatedComments = await res.json();
        setComments(updatedComments);
        onTaskUpdate({ ...task, comments: updatedComments });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const checklistProgress = checklist.length > 0 ? (checklist.filter(item => item.done).length / checklist.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{task ? 'Edit Card' : 'Create Card'}</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Card title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          />
          <textarea
            placeholder="Card description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded border h-32 bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
            <input
              type="date"
              value={dueDate || ''}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full p-2 rounded border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 block w-full p-2 rounded border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <LabelManager
            projectLabels={projectLabels}
            assignedLabels={assignedLabels.map(l => l._id || l)}
            onLabelToggle={handleLabelToggle}
            onNewLabel={onNewLabel}
          />

          {/* Assignees Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Assignees</h3>
            <div className="flex items-center space-x-2">
              {(assignedUsers || []).map(user => (
                <div key={user._id} className="relative group">
                  <span className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold">
                     {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </span>
                   <span className="absolute bottom-full mb-2 w-max px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {user.name}
                  </span>
                </div>
              ))}
              <div className="relative">
                <select
                  onChange={(e) => handleAssigneeToggle(e.target.value)}
                  className="appearance-none h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center cursor-pointer"
                  value=""
                >
                  <option value="" disabled>+/-</option>
                  {(projectMembers || []).map(member => (
                    <option key={member._id} value={member._id}>
                       {assignedUsers.some(u => u._id === member._id) ? '✓' : ''} {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>


          {/* Attachments Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Attachments</h3>
            <div className="space-y-2">
              {attachments.map(file => (
                <div key={file._id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <a href={`/${file.filepath}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{file.filename}</a>
                  <button onClick={() => handleDeleteAttachment(file._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <label className="w-full flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg shadow-sm tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue-500 hover:text-white">
                <span className="text-base leading-normal">Select a file</span>
                <input type='file' className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          {/* Checklist Section */}
          {task && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Checklist</h3>
              {checklist.length > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${checklistProgress}%` }}></div>
                </div>
              )}
              <div className="space-y-1">
                {checklist.map(item => (
                  <div key={item._id} className="flex items-center group">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleChecklistItem(item._id, item.done)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {editingChecklistItem === item._id ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => handleUpdateChecklistItem(item._id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateChecklistItem(item._id)}
                        className="ml-2 flex-grow p-1 rounded border bg-white dark:bg-gray-600"
                        autoFocus
                      />
                    ) : (
                      <span className={`ml-2 flex-grow ${item.done ? 'line-through text-gray-500' : ''}`}>{item.text}</span>
                    )}
                    <button onClick={() => { setEditingChecklistItem(item._id); setEditingText(item.text); }} className="ml-2 text-gray-500 opacity-0 group-hover:opacity-100">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteChecklistItem(item._id)} className="ml-2 text-red-500 opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Add an item"
                  className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                />
                <button onClick={handleAddChecklistItem} className="ml-2 px-4 py-2 rounded bg-green-500 text-white"><Plus size={16}/></button>
              </div>
            </div>
          )}

          {/* Comments Section */}
          {task && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Comments</h3>
              <MDXEditor
                markdown={newComment}
                onChange={setNewComment}
                plugins={[
                 
                  toolbarPlugin({
                    toolbarContents: () => (
                      <>
                        <UndoRedo />
                        <BoldItalicUnderlineToggles />
                        <DiffSourceToggleWrapper />
                      </>
                    )
                  }),
                  listsPlugin(),
                  quotePlugin(),
                  headingsPlugin(),
                  linkPlugin(),
                  thematicBreakPlugin(),
                   diffSourcePlugin(),
                 
                ]}
              />
              <button onClick={handleAddComment} className="px-4 py-2 rounded bg-blue-500 text-white">Comment</button>
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment._id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{comment.user.name}</span>
                      <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    {editingComment === comment._id ? (
                      <div>
                        <MDXEditor
                          markdown={editingCommentText}
                          onChange={setEditingCommentText}
                           plugins={[
                              toolbarPlugin({
                                toolbarContents: () => (
                                  <>
                                    <UndoRedo />
                                    <BoldItalicUnderlineToggles />
                                    <ListsToggles />
                                    <diffSourcePlugin.DiffSourceToggle />
                                  </>
                                )
                              }),
                              listsPlugin(),
                              quotePlugin(),
                              headingsPlugin(),
                              linkPlugin(),
                              thematicBreakPlugin(),
                              diffSourcePlugin()
                            ]}
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                           <button onClick={() => { setEditingComment(null); setEditingCommentText(''); }} className="px-3 py-1 rounded">Cancel</button>
                           <button onClick={() => handleUpdateComment(comment._id)} className="px-3 py-1 rounded bg-blue-500 text-white">Save</button>
                        </div>
                      </div>
                    ) : (
                      <MDXEditor markdown={comment.content} readOnly className="prose dark:prose-invert max-w-none"/>
                    )}
                    {user && user.id === comment.user._id && editingComment !== comment._id && (
                      <div className="flex justify-end space-x-2 mt-2">
                        <button onClick={() => { setEditingComment(comment._id); setEditingCommentText(comment.content); }} className="text-xs text-gray-500 hover:underline">Edit</button>
                        <button onClick={() => handleDeleteComment(comment._id)} className="text-xs text-red-500 hover:underline">Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
        <div className="mt-6 flex justify-between items-center">
          <div>
            {task && (
              <button onClick={() => onDelete(task._id)} className="px-4 py-2 rounded bg-red-500 text-white">
                Delete
              </button>
            )}
          </div>
          <div className="flex space-x-4">
            <button onClick={onClose} className="px-4 py-2 rounded">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded bg-blue-500 text-white">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
