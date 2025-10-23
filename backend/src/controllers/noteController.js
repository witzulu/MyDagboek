const Note = require('../models/Note');
const Project = require('../models/Project');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

exports.uploadImage = upload.single('image');

exports.handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No image file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getNotes = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project || project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const { search } = req.query;
    const query = {
      project: req.params.projectId,
      user: req.user.id,
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const notes = await Note.find(query);
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.createNote = async (req, res, next) => {
  const { title, content, tags, isPinned } = req.body;
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project || project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    const newNote = new Note({
      title,
      content,
      tags,
      isPinned,
      project: req.params.projectId,
      user: req.user.id
    });
    const note = await newNote.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateNote = async (req, res, next) => {
  const { title, content, tags, isPinned, drawing } = req.body;
  const noteFields = {};
  if (title !== undefined) noteFields.title = title;
  if (content !== undefined) noteFields.content = content;
  if (tags !== undefined) noteFields.tags = tags;
  if (isPinned !== undefined) noteFields.isPinned = isPinned;
  if (drawing !== undefined) noteFields.drawing = drawing;

  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    note = await Note.findByIdAndUpdate(req.params.id, { $set: noteFields }, { new: true });
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    await Note.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Note removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
