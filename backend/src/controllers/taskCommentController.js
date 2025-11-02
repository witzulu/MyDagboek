const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { logTaskActivity } = require('../utils/taskActivityService');

// @desc    Add a comment to a task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { content, notifyUserIds } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const task = await Task.findById(req.params.taskId).populate('board');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const newComment = {
      content,
      user: req.user.id,
    };

    task.comments.unshift(newComment); // Add to the beginning for newest first
    await task.save();

    await logTaskActivity(task._id, req.user.id, 'ADD_COMMENT');

    // Create notifications for mentioned users
    if (notifyUserIds && notifyUserIds.length > 0) {
      const notifications = notifyUserIds.map(userId => ({
        recipient: userId,
        sender: req.user.id,
        type: 'task_mention',
        project: task.board.project,
        task: task._id,
      }));
      await Notification.insertMany(notifications);
    }

    // Populate user details before sending back
    const populatedTask = await Task.findById(task._id).populate('comments.user', 'name email');

    res.status(201).json(populatedTask.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a comment on a task
// @route   PUT /api/tasks/:taskId/comments/:commentId
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user owns the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    if (content) {
      comment.content = content;
    }

    await task.save();

    const populatedTask = await Task.findById(task._id).populate('comments.user', 'name email');

    res.json(populatedTask.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a comment from a task
// @route   DELETE /api/tasks/:taskId/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user owns the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    comment.remove();
    await task.save();

    const populatedTask = await Task.findById(task._id).populate('comments.user', 'name email');

    res.json(populatedTask.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
