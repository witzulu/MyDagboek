import React, { useState, useEffect } from 'react';
import { MDXEditor, headingsPlugin, listsPlugin, quotePlugin, thematicBreakPlugin, markdownShortcutPlugin } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

const ManualEntryModal = ({ isOpen, onClose, onSave, entry }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [tags, setTags] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (entry) {
                setTitle(entry.title || '');
                setMessage(entry.message || '');
                setTags(entry.tags ? entry.tags.join(', ') : '');
            } else {
                setTitle('');
                setMessage('');
                setTags('');
            }
        }
    }, [isOpen, entry]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        onSave({
            ...entry,
            title,
            message,
            tags: tagArray,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">{entry ? 'Edit Manual Entry' : 'Add Manual Entry'}</h2>
                <div className="form-control">
                    <label className="label"><span className="label-text">Title (Optional)</span></label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input input-bordered"
                        placeholder="A brief summary of the change"
                    />
                </div>
                <div className="form-control mt-4">
                     <label className="label"><span className="label-text">Message</span></label>
                    <div className="prose max-w-none">
                         <MDXEditor
                            markdown={message}
                            onChange={setMessage}
                            plugins={[headingsPlugin(), listsPlugin(), quotePlugin(), thematicBreakPlugin(), markdownShortcutPlugin()]}
                            contentEditableClassName="!h-48"
                        />
                    </div>
                </div>
                <div className="form-control mt-4">
                    <label className="label"><span className="label-text">Tags (comma-separated)</span></label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="input input-bordered"
                        placeholder="e.g. bugfix, feature, design"
                    />
                </div>
                <div className="modal-action mt-6">
                    <button onClick={onClose} className="btn btn-ghost">Cancel</button>
                    <button onClick={handleSave} className="btn btn-primary">Save</button>
                </div>
            </div>
        </div>
    );
};

export default ManualEntryModal;
