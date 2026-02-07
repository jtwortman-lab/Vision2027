import { createContext, useContext, useEffect, useState } from 'react';

// ============================================================================
// THEME TYPES
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark'; // Resolved theme (system becomes light or dark)
}

// ============================================================================
// THEME CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// ============================================================================
// THEME PROVIDER
// ============================================================================

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'app-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey);
    return (stored as Theme) || defaultTheme;
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Resolve system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateActualTheme = () => {
      if (theme === 'system') {
        setActualTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setActualTheme(theme);
      }
    };

    updateActualTheme();

    // Listen for system theme changes
    mediaQuery.addEventListener('change', updateActualTheme);
    return () => mediaQuery.removeEventListener('change', updateActualTheme);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);
  }, [actualTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// THEME TOGGLE COMPONENT
// ============================================================================

import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  const Icon = actualTheme === 'dark' ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Icon className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === 'light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === 'dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === 'system' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// THEME-AWARE COMPONENTS
// ============================================================================

/**
 * Get theme-appropriate color
 */
export function useThemeColor(lightColor: string, darkColor: string): string {
  const { actualTheme } = useTheme();
  return actualTheme === 'dark' ? darkColor : lightColor;
}

/**
 * Get theme-appropriate image
 */
export function useThemeImage(lightImage: string, darkImage: string): string {
  const { actualTheme } = useTheme();
  return actualTheme === 'dark' ? darkImage : lightImage;
}

/**
 * Theme-aware gradient backgrounds
 */
export const themeGradients = {
  primary: {
    light: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    dark: 'dark:bg-gradient-to-br dark:from-blue-950 dark:to-indigo-950',
  },
  success: {
    light: 'bg-gradient-to-br from-green-50 to-emerald-50',
    dark: 'dark:bg-gradient-to-br dark:from-green-950 dark:to-emerald-950',
  },
  warning: {
    light: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    dark: 'dark:bg-gradient-to-br dark:from-yellow-950 dark:to-orange-950',
  },
  danger: {
    light: 'bg-gradient-to-br from-red-50 to-rose-50',
    dark: 'dark:bg-gradient-to-br dark:from-red-950 dark:to-rose-950',
  },
  neutral: {
    light: 'bg-gradient-to-br from-slate-50 to-gray-50',
    dark: 'dark:bg-gradient-to-br dark:from-slate-950 dark:to-gray-950',
  },
};

// ============================================================================
// CHART THEME COLORS
// ============================================================================

export function useChartColors() {
  const { actualTheme } = useTheme();

  return actualTheme === 'dark'
    ? {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        text: '#e5e7eb',
        grid: '#374151',
        background: '#1f2937',
      }
    : {
        primary: '#2563eb',
        secondary: '#7c3aed',
        success: '#059669',
        warning: '#d97706',
        danger: '#dc2626',
        text: '#1f2937',
        grid: '#e5e7eb',
        background: '#ffffff',
      };
}

// ============================================================================
// STATUS COLORS (Theme-aware)
// ============================================================================

export function useStatusColors() {
  const { actualTheme } = useTheme();

  return {
    excellent: actualTheme === 'dark' ? 'text-green-400' : 'text-green-600',
    good: actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600',
    moderate: actualTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
    poor: actualTheme === 'dark' ? 'text-red-400' : 'text-red-600',
    
    bgExcellent: actualTheme === 'dark' ? 'bg-green-950 text-green-400' : 'bg-green-50 text-green-700',
    bgGood: actualTheme === 'dark' ? 'bg-blue-950 text-blue-400' : 'bg-blue-50 text-blue-700',
    bgModerate: actualTheme === 'dark' ? 'bg-yellow-950 text-yellow-400' : 'bg-yellow-50 text-yellow-700',
    bgPoor: actualTheme === 'dark' ? 'bg-red-950 text-red-400' : 'bg-red-50 text-red-700',
  };
}

// ============================================================================
// THEME TRANSITIONS
// ============================================================================

/**
 * Add smooth transitions for theme changes
 */
export function enableThemeTransitions() {
  const css = `
    * {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  
  return () => {
    document.head.removeChild(style);
  };
}

// ============================================================================
// PREFERENCES INTEGRATION
// ============================================================================

export interface ThemePreferences {
  theme: Theme;
  autoSwitch: boolean;
  darkModeStart: string; // e.g., "20:00"
  darkModeEnd: string; // e.g., "06:00"
  highContrast: boolean;
  reducedMotion: boolean;
}

const defaultThemePreferences: ThemePreferences = {
  theme: 'system',
  autoSwitch: false,
  darkModeStart: '20:00',
  darkModeEnd: '06:00',
  highContrast: false,
  reducedMotion: false,
};

export function useThemePreferences() {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState<ThemePreferences>(() => {
    const stored = localStorage.getItem('theme-preferences');
    return stored ? JSON.parse(stored) : { ...defaultThemePreferences, theme };
  });

  useEffect(() => {
    localStorage.setItem('theme-preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Auto-switch based on time
  useEffect(() => {
    if (!preferences.autoSwitch) return;

    const checkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const currentTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      const [startHour, startMinute] = preferences.darkModeStart.split(':').map(Number);
      const [endHour, endMinute] = preferences.darkModeEnd.split(':').map(Number);

      const start = startHour * 60 + startMinute;
      const end = endHour * 60 + endMinute;
      const current = hour * 60 + minute;

      const shouldBeDark = start > end
        ? current >= start || current < end
        : current >= start && current < end;

      setTheme(shouldBeDark ? 'dark' : 'light');
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [preferences.autoSwitch, preferences.darkModeStart, preferences.darkModeEnd, setTheme]);

  // Apply high contrast
  useEffect(() => {
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [preferences.highContrast]);

  // Apply reduced motion
  useEffect(() => {
    if (preferences.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [preferences.reducedMotion]);

  return {
    preferences,
    updatePreferences: (updates: Partial<ThemePreferences>) => {
      setPreferences((prev) => ({ ...prev, ...updates }));
      if (updates.theme) {
        setTheme(updates.theme);
      }
    },
    resetPreferences: () => {
      setPreferences(defaultThemePreferences);
      setTheme(defaultThemePreferences.theme);
    },
  };
}
