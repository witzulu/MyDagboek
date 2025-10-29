const ChangeLog = require('../models/ChangeLog');

/**
 * Creates an automatic change log entry.
 * @param {string} projectId - The ID of the project.
 * @param {string} userId - The ID of the user who performed the action.
 * @param {string} message - The log message.
 */
const logChange = async (projectId, userId, message) => {
  try {
    if (!projectId || !userId || !message) {
      console.error('logChange validation failed: Missing required parameters.');
      return;
    }

    const entry = new ChangeLog({
      project: projectId,
      user: userId,
      message,
      type: 'automatic',
    });
    await entry.save();
  } catch (error) {
    console.error('Error creating change log entry:', error);
    // Depending on requirements, you might want to throw the error
    // or handle it silently so it doesn't interrupt the user's action.
  }
};

module.exports = { logChange };
