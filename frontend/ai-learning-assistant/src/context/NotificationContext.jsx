import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    // Add a new notification
    const addNotification = (title, message, type = 'info') => {
        const newNotification = {
            id: Date.now(),
            title,
            message,
            type,
            timestamp: new Date(),
            read: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);
    };

    // Mark a single notification as read
    const markAsRead = (id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    // Mark all notifications as read
    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
        );
    };

    // Clear (delete) a notification
    const clearNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const value = {
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
