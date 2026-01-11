
import { AppNotification, User } from '../types.ts';
import { MOCK_NOTIFICATIONS } from './mockData.ts';
import { INotificationService } from './interfaces.ts';

let currentNotifications = [...MOCK_NOTIFICATIONS];
const listeners: (() => void)[] = [];

export const MockNotificationService: INotificationService = {
    subscribeToNotifications: (listener) => {
        listeners.push(listener);
        return () => { const i = listeners.indexOf(listener); if (i > -1) listeners.splice(i, 1); };
    },
    getNotifications: async (user) => {
        return currentNotifications.filter(n => n.userId === user.id || n.userId === 'ALL');
    },
    getUnreadCount: async (user) => {
        const notifs = await MockNotificationService.getNotifications(user);
        return notifs.filter(n => !n.isRead).length;
    },
    markAsRead: async (id) => {
        const i = currentNotifications.findIndex(n => n.id === id);
        if (i !== -1) { currentNotifications[i].isRead = true; listeners.forEach(l => l()); }
    },
    markAllAsRead: async (user) => {
        currentNotifications = currentNotifications.map(n => (n.userId === user.id || n.userId === 'ALL' ? { ...n, isRead: true } : n));
        listeners.forEach(l => l());
    },
    addNotification: async (userId, title, message, type, link) => {
        currentNotifications.unshift({ id: `n-${Date.now()}`, userId, title, message, type, isRead: false, timestamp: 'Agora', link });
        listeners.forEach(l => l());
    }
};
