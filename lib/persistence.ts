import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// OFFLINE QUEUE TYPES
// ============================================================================

export interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

// ============================================================================
// OFFLINE QUEUE STORE
// ============================================================================

interface OfflineQueueStore {
  queue: QueuedOperation[];
  isOnline: boolean;
  isSyncing: boolean;
  
  // Actions
  addToQueue: (operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
  processSyncQueue: () => Promise<void>;
}

export const useOfflineQueue = create<OfflineQueueStore>()(
  persist(
    (set, get) => ({
      queue: [],
      isOnline: navigator.onLine,
      isSyncing: false,

      addToQueue: (operation) => {
        const queuedOp: QueuedOperation = {
          ...operation,
          id: `op-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          retryCount: 0,
        };

        set((state) => ({
          queue: [...state.queue, queuedOp],
        }));
      },

      removeFromQueue: (id) => {
        set((state) => ({
          queue: state.queue.filter((op) => op.id !== id),
        }));
      },

      clearQueue: () => {
        set({ queue: [] });
      },

      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        
        // Auto-sync when coming back online
        if (isOnline && get().queue.length > 0) {
          get().processSyncQueue();
        }
      },

      processSyncQueue: async () => {
        const { queue, isSyncing } = get();
        
        if (isSyncing || queue.length === 0) {
          return;
        }

        set({ isSyncing: true });

        for (const operation of queue) {
          try {
            // Execute the operation
            await executeQueuedOperation(operation);
            
            // Remove from queue on success
            get().removeFromQueue(operation.id);
          } catch (error) {
            console.error('Failed to sync operation:', error);
            
            // Increment retry count
            if (operation.retryCount < operation.maxRetries) {
              set((state) => ({
                queue: state.queue.map((op) =>
                  op.id === operation.id
                    ? { ...op, retryCount: op.retryCount + 1 }
                    : op
                ),
              }));
            } else {
              // Max retries reached, remove from queue
              console.error('Max retries reached for operation:', operation);
              get().removeFromQueue(operation.id);
            }
          }
        }

        set({ isSyncing: false });
      },
    }),
    {
      name: 'offline-queue-storage',
    }
  )
);

async function executeQueuedOperation(operation: QueuedOperation): Promise<void> {
  // This would integrate with your API layer
  // For now, just a placeholder
  console.log('Executing queued operation:', operation);
  
  // Example:
  // switch (operation.type) {
  //   case 'create':
  //     await api[operation.entity].create(operation.data);
  //     break;
  //   case 'update':
  //     await api[operation.entity].update(operation.data.id, operation.data);
  //     break;
  //   case 'delete':
  //     await api[operation.entity].delete(operation.data.id);
  //     break;
  // }
}

// ============================================================================
// NETWORK STATUS HOOK
// ============================================================================

export function useNetworkStatus() {
  const { isOnline, setOnlineStatus } = useOfflineQueue();

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  return { isOnline };
}

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

export const storage = {
  /**
   * Get item from localStorage with JSON parsing
   */
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue ?? null;
    }
  },

  /**
   * Set item in localStorage with JSON stringification
   */
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  /**
   * Remove item from localStorage
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  /**
   * Check if key exists in localStorage
   */
  has: (key: string): boolean => {
    return localStorage.getItem(key) !== null;
  },
};

// ============================================================================
// SESSION STORAGE UTILITIES
// ============================================================================

export const sessionStorage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return defaultValue ?? null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to sessionStorage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
    }
  },

  clear: (): void => {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  },
};

// ============================================================================
// USER PREFERENCES
// ============================================================================

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  sidebarCollapsed: boolean;
  defaultView: 'grid' | 'list' | 'table';
  itemsPerPage: number;
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
  dashboard: {
    widgets: string[];
    layout: 'default' | 'compact' | 'custom';
  };
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  compactMode: false,
  sidebarCollapsed: false,
  defaultView: 'table',
  itemsPerPage: 25,
  notifications: {
    enabled: true,
    sound: true,
    desktop: false,
  },
  dashboard: {
    widgets: ['stats', 'capacity', 'prospects', 'recent'],
    layout: 'default',
  },
};

export function useUserPreferences() {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => {
    return storage.get('user-preferences', defaultPreferences)!;
  });

  const setPreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferencesState(newPreferences);
    storage.set('user-preferences', newPreferences);
  };

  const resetPreferences = () => {
    setPreferencesState(defaultPreferences);
    storage.set('user-preferences', defaultPreferences);
  };

  return {
    preferences,
    setPreferences,
    resetPreferences,
  };
}

// ============================================================================
// VIEW STATE PERSISTENCE
// ============================================================================

export interface ViewState {
  filters: Record<string, any>;
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  search: string;
  page: number;
  view: 'grid' | 'list' | 'table';
}

export function useViewState(viewKey: string) {
  const storageKey = `view-state-${viewKey}`;
  
  const [viewState, setViewStateInternal] = useState<Partial<ViewState>>(() => {
    return storage.get(storageKey, {});
  });

  const setViewState = (updates: Partial<ViewState>) => {
    const newState = { ...viewState, ...updates };
    setViewStateInternal(newState);
    storage.set(storageKey, newState);
  };

  const clearViewState = () => {
    setViewStateInternal({});
    storage.remove(storageKey);
  };

  return {
    viewState,
    setViewState,
    clearViewState,
  };
}

// ============================================================================
// DRAFT AUTOSAVE
// ============================================================================

export function useAutosave<T>(
  key: string,
  data: T,
  options: {
    delay?: number;
    enabled?: boolean;
  } = {}
) {
  const { delay = 1000, enabled = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      storage.set(`draft-${key}`, data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, key]);

  const loadDraft = (): T | null => {
    return storage.get(`draft-${key}`);
  };

  const clearDraft = () => {
    storage.remove(`draft-${key}`);
  };

  return {
    loadDraft,
    clearDraft,
  };
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export const cache = {
  get: <T>(key: string): T | null => {
    const entry = storage.get<CacheEntry<T>>(`cache-${key}`);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      storage.remove(`cache-${key}`);
      return null;
    }
    
    return entry.data;
  },

  set: <T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    
    storage.set(`cache-${key}`, entry);
  },

  invalidate: (key: string): void => {
    storage.remove(`cache-${key}`);
  },

  clear: (): void => {
    // Clear all cache entries
    Object.keys(localStorage)
      .filter((key) => key.startsWith('cache-'))
      .forEach((key) => localStorage.removeItem(key));
  },
};

import { useEffect, useRef, useState } from 'react';
