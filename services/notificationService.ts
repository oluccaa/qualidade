
import { AppNotification, User } from '../types.ts';
import { MOCK_NOTIFICATIONS } from './mockData.ts';

// In-memory simulation of notification state
let currentNotifications = [...MOCK_NOTIFICATIONS];

export const getNotifications = async (user: User): Promise<AppNotification[]> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return currentNotifications.filter(n => 
        n.userId === user.id || n.userId === 'ALL'
    ).sort((a, b) => {
        // Simple sort logic: Unread first, then by "timestamp" (mock string logic replaced by insertion order for new ones)
        if (a.isRead === b.isRead) return 0;
        return a.isRead ? 1 : -1;
    });
};

export const getUnreadCount = async (user: User): Promise<number> => {
    const notifs = await getNotifications(user);
    return notifs.filter(n => !n.isRead).length;
};

export const markAsRead = async (notificationId: string): Promise<void> => {
    const index = currentNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
        currentNotifications[index] = { ...currentNotifications[index], isRead: true };
    }
};

export const markAllAsRead = async (user: User): Promise<void> => {
    currentNotifications = currentNotifications.map(n => {
        if (n.userId === user.id || n.userId === 'ALL') {
            return { ...n, isRead: true };
        }
        return n;
    });
};

// NEW: Add a notification dynamically
export const addNotification = async (
    targetUserId: string, 
    title: string, 
    message: string, 
    type: AppNotification['type'],
    link?: string
): Promise<void> => {
    const newNotif: AppNotification = {
        id: `notif-${Date.now()}-${Math.random()}`,
        userId: targetUserId,
        title,
        message,
        type,
        isRead: false,
        timestamp: 'Agora mesmo', // In a real app, use ISO string
        link
    };
    currentNotifications.unshift(newNotif);
};
