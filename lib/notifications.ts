import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 
  | 'assignment'
  | 'match'
  | 'capacity'
  | 'skill_assessment'
  | 'client_update'
  | 'system'
  | 'reminder';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// NOTIFICATION STORE
// ============================================================================

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  
  // Filters
  getUnread: () => Notification[];
  getByType: (type: NotificationType) => Notification[];
  getByPriority: (priority: NotificationPriority) => Notification[];
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      deleteNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const wasUnread = notification && !notification.read;

          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      getUnread: () => {
        return get().notifications.filter((n) => !n.read);
      },

      getByType: (type) => {
        return get().notifications.filter((n) => n.type === type);
      },

      getByPriority: (priority) => {
        return get().notifications.filter((n) => n.priority === priority);
      },
    }),
    {
      name: 'notifications-storage',
    }
  )
);

// ============================================================================
// NOTIFICATION HELPERS
// ============================================================================

export const notificationHelpers = {
  assignment: {
    created: (advisorName: string, clientName: string) => ({
      type: 'assignment' as NotificationType,
      priority: 'high' as NotificationPriority,
      title: 'New Assignment',
      message: `${advisorName} has been assigned to ${clientName}`,
      actionUrl: '/my-clients',
      actionLabel: 'View Clients',
    }),
    
    updated: (clientName: string) => ({
      type: 'assignment' as NotificationType,
      priority: 'medium' as NotificationPriority,
      title: 'Assignment Updated',
      message: `Assignment for ${clientName} has been updated`,
    }),
  },

  match: {
    completed: (clientName: string, matchCount: number) => ({
      type: 'match' as NotificationType,
      priority: 'high' as NotificationPriority,
      title: 'Matches Found',
      message: `Found ${matchCount} potential matches for ${clientName}`,
      actionUrl: '/matches',
      actionLabel: 'View Matches',
    }),
    
    highConfidence: (advisorName: string, clientName: string, score: number) => ({
      type: 'match' as NotificationType,
      priority: 'high' as NotificationPriority,
      title: 'High Confidence Match',
      message: `${advisorName} is an excellent match for ${clientName} (${score}% confidence)`,
      actionUrl: '/matches',
      actionLabel: 'Review Match',
    }),
  },

  capacity: {
    warning: (advisorName: string, percentage: number) => ({
      type: 'capacity' as NotificationType,
      priority: 'medium' as NotificationPriority,
      title: 'Capacity Warning',
      message: `${advisorName} is at ${percentage}% capacity`,
      actionUrl: `/advisor-dashboard`,
      actionLabel: 'View Dashboard',
    }),
    
    critical: (advisorName: string) => ({
      type: 'capacity' as NotificationType,
      priority: 'urgent' as NotificationPriority,
      title: 'At Full Capacity',
      message: `${advisorName} has reached full capacity`,
      actionUrl: `/advisor-dashboard`,
      actionLabel: 'Manage Capacity',
    }),
    
    teamAlert: (utilizationRate: number) => ({
      type: 'capacity' as NotificationType,
      priority: 'urgent' as NotificationPriority,
      title: 'Team Capacity Alert',
      message: `Team is at ${utilizationRate}% capacity. Consider hiring.`,
      actionUrl: '/analytics',
      actionLabel: 'View Analytics',
    }),
  },

  skillAssessment: {
    reminder: (advisorName: string) => ({
      type: 'skill_assessment' as NotificationType,
      priority: 'low' as NotificationPriority,
      title: 'Skill Assessment Due',
      message: `Time for ${advisorName}'s quarterly skill assessment`,
      actionUrl: `/advisors/${advisorName}`,
      actionLabel: 'Complete Assessment',
    }),
    
    completed: (advisorName: string) => ({
      type: 'skill_assessment' as NotificationType,
      priority: 'low' as NotificationPriority,
      title: 'Assessment Completed',
      message: `${advisorName}'s skill assessment has been completed`,
    }),
  },

  client: {
    newProspect: (clientName: string) => ({
      type: 'client_update' as NotificationType,
      priority: 'high' as NotificationPriority,
      title: 'New Prospect',
      message: `${clientName} has been added as a prospect`,
      actionUrl: '/intake',
      actionLabel: 'Find Match',
    }),
    
    converted: (clientName: string) => ({
      type: 'client_update' as NotificationType,
      priority: 'high' as NotificationPriority,
      title: 'Prospect Converted',
      message: `${clientName} is now an active client`,
      actionUrl: '/clients',
      actionLabel: 'View Clients',
    }),
    
    needsUpdated: (clientName: string) => ({
      type: 'client_update' as NotificationType,
      priority: 'medium' as NotificationPriority,
      title: 'Client Needs Updated',
      message: `Planning needs for ${clientName} have been updated`,
    }),
  },

  system: {
    updateAvailable: () => ({
      type: 'system' as NotificationType,
      priority: 'low' as NotificationPriority,
      title: 'Update Available',
      message: 'A new version is available. Refresh to update.',
      actionLabel: 'Refresh Now',
    }),
    
    maintenanceScheduled: (date: Date) => ({
      type: 'system' as NotificationType,
      priority: 'medium' as NotificationPriority,
      title: 'Scheduled Maintenance',
      message: `System maintenance scheduled for ${date.toLocaleDateString()}`,
    }),
  },

  reminder: {
    followUp: (clientName: string, action: string) => ({
      type: 'reminder' as NotificationType,
      priority: 'medium' as NotificationPriority,
      title: 'Follow-up Reminder',
      message: `Remember to ${action} for ${clientName}`,
    }),
  },
};

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

interface NotificationPreferences {
  enabled: boolean;
  types: Record<NotificationType, boolean>;
  priorities: Record<NotificationPriority, boolean>;
  sound: boolean;
  desktop: boolean;
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  types: {
    assignment: true,
    match: true,
    capacity: true,
    skill_assessment: true,
    client_update: true,
    system: true,
    reminder: true,
  },
  priorities: {
    low: true,
    medium: true,
    high: true,
    urgent: true,
  },
  sound: true,
  desktop: false,
};

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    () => {
      const stored = localStorage.getItem('notification-preferences');
      return stored ? JSON.parse(stored) : defaultPreferences;
    }
  );

  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    localStorage.setItem('notification-preferences', JSON.stringify(newPreferences));
  };

  return {
    preferences,
    updatePreferences,
  };
}

// ============================================================================
// DESKTOP NOTIFICATIONS
// ============================================================================

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function showDesktopNotification(
  title: string,
  options?: NotificationOptions
) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      ...options,
    });
  }
}

// ============================================================================
// NOTIFICATION GROUPING
// ============================================================================

export function groupNotificationsByDate(notifications: Notification[]) {
  const groups: Record<string, Notification[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  notifications.forEach((notification) => {
    const notifDate = new Date(notification.timestamp);
    const notifDay = new Date(
      notifDate.getFullYear(),
      notifDate.getMonth(),
      notifDate.getDate()
    );

    if (notifDay.getTime() === today.getTime()) {
      groups.today.push(notification);
    } else if (notifDay.getTime() === yesterday.getTime()) {
      groups.yesterday.push(notification);
    } else if (notifDay >= weekAgo) {
      groups.thisWeek.push(notification);
    } else {
      groups.older.push(notification);
    }
  });

  return groups;
}
