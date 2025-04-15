import { useEffect } from "react";
import {
  type Notification,
  useNotification,
} from "../contexts/NotificationContext";

export function Notification() {
  const { notifications, removeNotification } = useNotification();

  useEffect(() => {
    const timeouts = notifications.map((notification) => {
      return setTimeout(() => {
        removeNotification(notification.id);
      }, 5000); // Auto-remove after 5 seconds
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [notifications, removeNotification]);

  return (
    <div className="notification-container">
      {notifications.map((notification: Notification, index: number) => (
        <div
          key={"notification-" + index}
          className={`notification ${notification.type}`}
          onClick={() => removeNotification(notification.id)}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}

