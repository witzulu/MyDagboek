import React, { useState, useEffect } from 'react';
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  UndoRedo,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

const ManualReportModal = ({ isOpen, onClose, onSave, entry }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setMessage(entry.message || '');
    } else {
      setTitle('');
      setMessage('');
    }
  }, [entry, isOpen]);

  const handleSave = () => {
    onSave({ ...entry, title, message });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-3xl">
        <h3 className="font-bold text-lg mb-4">{entry ? 'Edit' : 'Create'} Manual Report Entry</h3>

        <div className="form-control w-full mb-4">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input
            type="text"
            placeholder="Enter a title for this entry"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-control w-full">
           <label className="label">
            <span className="label-text">Content</span>
          </label>
          <div className="prose max-w-none border rounded-md">
             <MDXEditor
                markdown={message}
                onChange={setMessage}
                plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    toolbarPlugin({
                        toolbarContents: () => (
                            <>
                                <UndoRedo />
                                <BlockTypeSelect />
                                <BoldItalicUnderlineToggles />
                            </>
                        ),
                    }),
                ]}
                />
          </div>
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">Save Entry</button>
        </div>
      </div>
       <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>
  );
};

export default ManualReportModal;
