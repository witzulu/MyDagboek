import React, { useState, useEffect, useContext, useCallback } from 'react';
import { debounce } from 'lodash';
import LabelManager from './LabelManager';
import AssigneeSelectionModal from './AssigneeSelectionModal';
import DependencySelectionModal from './DependencySelectionModal';
import { Plus, Trash2, Edit2, UserPlus } from 'lucide-react';
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
import '../../mdxeditor.css'
import { AuthContext } from '../../context/AuthContext';

const CardModal = ({ isOpen, onClose, onSave, onDelete, task, listId, projectLabels, onNewLabel, onTaskUpdate, projectMembers, projectId }) => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState('Low');
  const [assignedLabels, setAssignedLabels] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [comments, setComments] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingChecklistItem, setEditingChecklistItem] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null);
        setPriority(task.priority || 'Low');
        setAssignedLabels(task.labels || []);
        setAssignees(task.assignees?.filter(a => a && a._id).map(a => a._id) || []);
        setAttachments(task.attachments || []);
        setChecklist(task.checklist || []);
        setComments(task.comments || []);
      } else {
        setTitle('');
        setDescription('');
        setDueDate(null);
        setAssignedLabels([]);
        setAssignees([]);
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

  const handleCompleteTask = async () => {
  if (!task || !task._id) {
    console.error('No task provided for completion');
    return;
  }

  const token = getToken();
  if (!token) {
    console.error('No auth token found. Please log in again.');
    return;
  }

  try {
    const res = await fetch(`/api/tasks/${task._id}/complete`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error(`Failed to complete task: ${res.status}`);
      return;
    }

    let updatedTask = null;
    try {
      updatedTask = await res.json();
    } catch {
      console.warn('No JSON returned from /complete endpoint');
    }

    if (updatedTask && onTaskUpdate) onTaskUpdate(updatedTask);
    onClose();
  } catch (error) {
    console.error('Error completing task:', error);
  }
};


  const handleSubmit = () => {
    onSave({
      title,
      description,
      dueDate,
      priority,
      labels: assignedLabels.map(l => l._id || l),
      assignees,
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

  const addDependency = (dependencyId, type) => {
    const body = { [type]: dependencyId };

    // Optimistically update the UI
    const updatedTask = { ...task, [type]: [...(task[type] || []), dependencyId] };
    onTaskUpdate(updatedTask);

    // Make the API call
    fetch(`/api/tasks/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(body),
    }).catch(error => {
      console.error('Failed to add dependency:', error);
      // Revert optimistic update on failure
      onTaskUpdate(task);
    });
  };


  return (
    <>
      <AssigneeSelectionModal
        isOpen={isAssigneeModalOpen}
        onClose={() => setIsAssigneeModalOpen(false)}
        members={projectMembers}
        selectedAssignees={assignees}
        onConfirm={setAssignees}
      />
      {task && (
        <DependencySelectionModal
          isOpen={isDependencyModalOpen}
          onClose={() => setIsDependencyModalOpen(false)}
          onAddDependency={addDependency}
          projectId={projectId}
          currentTask={task}
        />
      )}
      <div className="fixed inset-0 bg-base-200/50 flex justify-center items-center z-50">
        <div className="bg-base-300  p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto  border border-accent/50 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{task ? 'Edit Card' : 'Create Card'}</h2>
            {task && (
              <button onClick={handleCompleteTask} className="px-4 py-2 rounded bg-green-500 text-white">
                Mark as Complete
              </button>
            )}
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Card title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded border bg-base-100 "
            />
            <textarea
              placeholder="Card description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded border h-32 bg-base-300"
            />
            <div>
              <label className="block text-sm font-medium ">Due Date</label>
              <input
                type="date"
                value={dueDate || ''}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full p-2 rounded border bg-base-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium ">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 block w-full p-2 rounded border bg-base-300"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <LabelManager
              projectLabels={projectLabels}
              assignedLabels={assignedLabels.map(l => l._id || l)}
              onLabelToggle={handleLabelToggle}
              onNewLabel={onNewLabel}
            />
            <div>
              <h3 className="font-semibold mb-2">Assignees</h3>
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {assignees.map(assigneeId => {
                      const member = projectMembers.find(m => m.user && m.user._id === assigneeId);
                      return member && member.user ? (
                          <div key={member.user._id} className="tooltip" data-tip={member.user.name}>
                              <div className="avatar">
                                  <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs">
                                      {member.user.name.charAt(0)}
                                  </div>
                              </div>
                          </div>
                      ) : null;
                  })}
                </div>
                <button onClick={() => setIsAssigneeModalOpen(true)} className="btn btn-outline btn-circle btn-sm">
                    <UserPlus size={16} />
                </button>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Attachments</h3>
              <div className="space-y-2">
                {attachments.map(file => (
                  <div key={file._id} className="flex items-center justify-between p-2 rounded">
                    <a href={`/${file.filepath}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{file.filename}</a>
                    <button onClick={() => handleDeleteAttachment(file._id)} className="text-error hover:text-shadow-error-content">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <label className="w-full flex items-center px-4 py-2  rounded-lg shadow-sm tracking-wide uppercase border border-blue cursor-pointer hover:bg-accent hover:text-">
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
                  <div className="w-full rounded-full h-2.5">
                    <div className=" h-2.5 rounded-full" style={{ width: `${checklistProgress}%` }}></div>
                  </div>
                )}
                <div className="space-y-1">
                  {checklist.map(item => (
                    <div key={item._id} className="flex items-center group">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => handleToggleChecklistItem(item._id, item.done)}
                        className="h-4 w-4 rounded"
                      />
                      {editingChecklistItem === item._id ? (
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onBlur={() => handleUpdateChecklistItem(item._id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateChecklistItem(item._id)}
                          className="ml-2 flex-grow p-1 rounded border "
                          autoFocus
                        />
                      ) : (
                        <span className={`ml-2 flex-grow ${item.done ? 'line-through' : ''}`}>{item.text}</span>
                      )}
                      <button onClick={() => { setEditingChecklistItem(item._id); setEditingText(item.text); }} className="ml-2 opacity-0 group-hover:opacity-100">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteChecklistItem(item._id)} className="ml-2 text-error opacity-0 group-hover:opacity-100">
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
                    className="w-full p-2 rounded border"
                  />
                  <button onClick={handleAddChecklistItem} className="ml-2 px-4 py-3 rounded bg-accent"><Plus size={18}/></button>
                </div>
              </div>
            )}

            {/* Comments Section */}
            {task && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Comments</h3>
                <div className="bg-base-100/90 p-3 rounded-lg text-2xl ">
                <MDXEditor
                contentEditableClassName="mxEditor"
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
                </div>
                <button onClick={handleAddComment} className="px-4 py-2 rounded bg-accent ">Comment</button>
                <div className="space-y-4 ">
                  {comments.map(comment => (
                    <div key={comment._id} className=" p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{comment.user.name}</span>
                        <span className="text-xs ">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      {editingComment === comment._id ? (
                        <div >
                          <MDXEditor
                             contentEditableClassName="mxEditor"
                            markdown={editingCommentText}
                            onChange={setEditingCommentText}
                            className="mxEditor"
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
                             <button onClick={() => { setEditingComment(null); setEditingCommentText(''); }} className="px-3 py-1 rounded ">Cancel</button>
                             <button onClick={() => handleUpdateComment(comment._id)} className="px-3 py-1 rounded bg-accent">Save</button>
                          </div>
                        </div>
                      ) : (
                        <MDXEditor contentEditableClassName="mxEditor" markdown={comment.content} readOnly className="prose dark:prose-invert max-w-none"/>
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

            {/* Dependencies Section */}
            {task && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Dependencies</h3>
                  <button onClick={() => setIsDependencyModalOpen(true)} className="btn btn-sm btn-outline">Add Dependency</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Depends On</h4>
                  <ul>
                      {task.dependsOn?.map(dep => (
                        <li key={dep._id}>{dep.title}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">Blocking</h4>
                  <ul>
                      {task.blocking?.map(block => (
                        <li key={block._id}>{block.title}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

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
    </>
  );
};

export default CardModal;