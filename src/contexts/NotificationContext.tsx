import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useAuth } from './AuthContext';
import api from '../services/api';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  _id: string;
  recipient: string;
  type: NotificationType;
  message: string;
  title?: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, '_id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const addNotification = useCallback(async (notification: Omit<Notification, '_id' | 'read' | 'createdAt'>) => {
    try {
      // Ensure the notification has a recipient
      const notificationWithRecipient = {
        ...notification,
        recipient: user?._id // Use the current user's ID as the recipient
      };

      const response = await api.post('/notifications', notificationWithRecipient);
      if (response.data.success) {
        setNotifications(prev => [response.data.data, ...prev]);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === id ? { ...notification, read: true } : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await api.patch('/notifications/read-all');
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      if (response.data.success) {
        setNotifications(prev =>
          prev.filter(notification => notification._id !== id)
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 