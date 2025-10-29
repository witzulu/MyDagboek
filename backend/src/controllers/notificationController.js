const Notification = require('../models/Notification');
const Project = require('../models/Project');
const { logChange } = require('../utils/changeLogService');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name username')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, status: 'unread' },
      { $set: { status: 'read' } }
    );
    res.json({ msg: 'Notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// @desc    Respond to a project invitation
// @route   PUT /api/notifications/respond/:id
// @access  Private
exports.respondToInvitation = async (req, res) => {
    const { response } = req.body; // 'accept' or 'decline'
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification || notification.recipient.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Notification not found' });
        }

        if (notification.type !== 'project_invitation') {
            return res.status(400).json({ msg: 'This is not a project invitation' });
        }

        if (response === 'accept') {
            const project = await Project.findById(notification.project);
            if (project) {
                // Add user to project if not already a member
                if (!project.members.some(m => m.user && m.user.toString() === req.user.id)) {
                    project.members.push({ user: req.user.id, role: 'member' });
                    await project.save();

                    // Log the change
                    await logChange(project._id, req.user.id, `joined the project.`, 'team');
                }
            }
        }

        // Update notification status to 'read' regardless of response
        notification.status = 'read';
        await notification.save();

        res.json({ msg: `Invitation ${response}ed.` });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
