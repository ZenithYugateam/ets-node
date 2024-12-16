// src/context/NotificationContext.tsx

import React, { createContext, ReactNode, useState, useEffect } from "react";

interface Notification {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
  read: boolean;
  timestamp: number; // Unix timestamp in milliseconds
}

interface NotificationContextType {
  addNotification: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  notifications: Notification[];
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  addNotification: () => {},
  notifications: [],
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {},
});

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deletedNotificationIds, setDeletedNotificationIds] = useState<number[]>([]);

  // Load notifications and deleted IDs from localStorage on mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }

    const storedDeletedIds = localStorage.getItem("deletedNotificationIds");
    if (storedDeletedIds) {
      setDeletedNotificationIds(JSON.parse(storedDeletedIds));
    }
  }, []);

  // Save notifications and deleted IDs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("deletedNotificationIds", JSON.stringify(deletedNotificationIds));
  }, [deletedNotificationIds]);

  // Function to add a new notification
  const addNotification = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info"
  ) => {
    // Prevent adding notifications that have been deleted
    const existing = notifications.find(notif => notif.message === message && notif.type === type);
    if (existing || deletedNotificationIds.includes(message.hashCode())) {
      return;
    }

    const id = Date.now(); // Unique ID based on timestamp
    const timestamp = Date.now();
    const newNotification: Notification = { id, message, type, read: false, timestamp };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Function to mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Function to mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  // Function to delete a notification
  const deleteNotification = (id: number) => {
    const notificationToDelete = notifications.find(notif => notif.id === id);
    if (notificationToDelete) {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      // Add the notification ID to the deleted list
      setDeletedNotificationIds((prev) => [...prev, notificationToDelete.id]);
    }
  };

  // Function to remove notifications older than 12 hours
  const removeOldNotifications = () => {
    const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
    setNotifications((prev) => prev.filter(notif => notif.timestamp >= twelveHoursAgo));
  };

  // Set up an interval to remove old notifications every hour
  useEffect(() => {
    const interval = setInterval(() => {
      removeOldNotifications();
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, []);

  // Also remove old notifications on initial load
  useEffect(() => {
    removeOldNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{ addNotification, notifications, markAsRead, markAllAsRead, deleteNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Utility function to generate a hash code from a string (for preventing duplicate notifications)
String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
