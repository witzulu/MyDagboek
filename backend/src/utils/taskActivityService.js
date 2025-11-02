const TaskActivity = require('../models/TaskActivity');

/**
 * Logs an activity for a task.
 * @param {string} taskId - The ID of the task.
 * @param {string} userId - The ID of the user who performed the action.
 * @param {string} action - The type of action performed.
 * @param {object} [details={}] - Additional details about the action.
 */
const logTaskActivity = async (taskId, userId, action, details = {}) => {
  try {
    await TaskActivity.create({
      task: taskId,
      user: userId,
      action,
      details,
    });
  } catch (error) {
    console.error(`Failed to log task activity: ${action} for task ${taskId}`, error);
    // In a production environment, you might want more robust error handling
  }
};

module.exports = { logTaskActivity };
