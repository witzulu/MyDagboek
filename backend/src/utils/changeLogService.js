const ChangeLog = require('../models/ChangeLog');

/**
 * Creates an automatic change log entry.
 * @param {string} projectId - The ID of the project.
 * @param {string} userId - The ID of the user who performed the action.
 * @param {string} message - The log message.
 * @param {string} category - The category of the change (e.g., 'board', 'note').
 */
const logChange = async (projectId, userId, message, category) => {
  try {
    if (!projectId || !userId || !message || !category) {
      console.error('logChange validation failed: Missing required parameters.');
      return;
    }

    const entry = new ChangeLog({
      project: projectId,
      user: userId,
      message,
      type: 'automatic',
      category: category,
    });
    await entry.save();
  } catch (error) {
    console.error('Error creating change log entry:', error);
  }
};

module.exports = { logChange };
