import PropTypes from 'prop-types';
import { Bell } from 'lucide-react';

const NotificationsPanel = ({ notifications, onRespond, onMarkAsRead }) => {
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-base-100 border border-border rounded-lg shadow-lg z-50">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-muted p-4">No new notifications</p>
        ) : (
          notifications.map(notification => (
            <div key={notification._id} className={`p-4 border-b border-border ${notification.status === 'unread' ? 'bg-secondary' : ''}`}>
              <p className="text-sm">
                <strong>{notification.sender.username}</strong> invited you to join <strong>{notification.project.name}</strong>
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => onRespond(notification._id, 'accept')}
                  className="btn btn-sm btn-success"
                >
                  Accept
                </button>
                <button
                  onClick={() => onRespond(notification._id, 'decline')}
                  className="btn btn-sm btn-danger"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {unreadCount > 0 && (
          <div className="p-2 text-center">
            <button onClick={onMarkAsRead} className="text-sm text-primary hover:underline">
                Mark all as read
            </button>
          </div>
      )}
    </div>
  );
};

NotificationsPanel.propTypes = {
    notifications: PropTypes.array.isRequired,
    onRespond: PropTypes.func.isRequired,
    onMarkAsRead: PropTypes.func.isRequired,
};

export default NotificationsPanel;
