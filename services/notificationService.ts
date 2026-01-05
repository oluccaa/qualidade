
import { AppNotification, User } from '../types.ts';
import { MOCK_NOTIFICATIONS } from './mockData.ts';

// In-memory simulation of notification state
let currentNotifications = [...MOCK_NOTIFICATIONS];

// --- SUBSCRIPTION MECHANISM ---
type NotifListener = () => void;
const listeners: NotifListener[] = [];

export const subscribeToNotifications = (listener: NotifListener) => {
    listeners.push(listener);
    return () => {
        const idx = listeners.indexOf(listener);
        if (idx > -1) listeners.splice(idx, 1);
    };
};

const notifyListeners = () => listeners.forEach(l => l());

// --- OPERATIONS ---

export const getNotifications = async (user: User): Promise<AppNotification[]> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return currentNotifications.filter(n => 
        n.userId === user.id || n.userId === 'ALL'
    ).sort((a, b) => {
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
        notifyListeners();
    }
};

export const markAllAsRead = async (user: User): Promise<void> => {
    currentNotifications = currentNotifications.map(n => {
        if (n.userId === user.id || n.userId === 'ALL') {
            return { ...n, isRead: true };
        }
        return n;
    });
    notifyListeners();
};

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
        timestamp: 'Agora mesmo', 
        link
    };
    currentNotifications.unshift(newNotif);
    notifyListeners(); // Real-time trigger
};
