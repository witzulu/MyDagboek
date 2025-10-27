const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, respondToInvitation } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotifications);
router.route('/read').put(protect, markAsRead);
router.route('/respond/:id').put(protect, respondToInvitation);

module.exports = router;
