import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { showInfo } from './toasts';

// ============================================================================
// KEYBOARD SHORTCUT TYPES
// ============================================================================

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
}

export interface ShortcutGroup {
  name: string;
  shortcuts: Shortcut[];
}

// ============================================================================
// KEYBOARD SHORTCUT HOOK
// ============================================================================

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    preventDefault?: boolean;
  } = {}
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrl, shift, alt, meta, preventDefault = true } = options;

      const isMatch =
        event.key.toLowerCase() === key.toLowerCase() &&
        !!event.ctrlKey === !!ctrl &&
        !!event.shiftKey === !!shift &&
        !!event.altKey === !!alt &&
        !!event.metaKey === !!meta;

      if (isMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, options]);
}

// ============================================================================
// GLOBAL SHORTCUTS HOOK
// ============================================================================

export function useGlobalShortcuts() {
  const navigate = useNavigate();

  // Navigation shortcuts
  useKeyboardShortcut('g', () => navigate('/'), { shift: true });
  useKeyboardShortcut('a', () => navigate('/advisors'), { shift: true });
  useKeyboardShortcut('c', () => navigate('/clients'), { shift: true });
  useKeyboardShortcut('p', () => navigate('/intake'), { shift: true });
  useKeyboardShortcut('m', () => navigate('/matches'), { shift: true });

  // Action shortcuts
  useKeyboardShortcut('k', () => {
    // Open command palette (you can implement this)
    showInfo('Command Palette', 'Coming soon!');
  }, { ctrl: true });

  useKeyboardShortcut('/', () => {
    // Focus search (you can implement this)
    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    searchInput?.focus();
  }, { preventDefault: true });

  // Help
  useKeyboardShortcut('?', () => {
    showShortcutHelp();
  }, { shift: true });
}

// ============================================================================
// SHORTCUT DEFINITIONS
// ============================================================================

export const globalShortcuts: ShortcutGroup[] = [
  {
    name: 'Navigation',
    shortcuts: [
      { key: 'Shift + G', description: 'Go to Dashboard', action: () => {} },
      { key: 'Shift + A', description: 'Go to Advisors', action: () => {} },
      { key: 'Shift + C', description: 'Go to Clients', action: () => {} },
      { key: 'Shift + P', description: 'New Prospect Intake', action: () => {} },
      { key: 'Shift + M', description: 'View Matches', action: () => {} },
    ],
  },
  {
    name: 'Actions',
    shortcuts: [
      { key: 'Ctrl + K', description: 'Open Command Palette', action: () => {} },
      { key: 'Ctrl + S', description: 'Save', action: () => {} },
      { key: 'Esc', description: 'Close Dialog/Modal', action: () => {} },
      { key: '/', description: 'Focus Search', action: () => {} },
    ],
  },
  {
    name: 'Data Table',
    shortcuts: [
      { key: 'J', description: 'Next Row', action: () => {} },
      { key: 'K', description: 'Previous Row', action: () => {} },
      { key: 'Enter', description: 'Open Selected', action: () => {} },
      { key: 'Ctrl + A', description: 'Select All', action: () => {} },
    ],
  },
  {
    name: 'General',
    shortcuts: [
      { key: 'Shift + ?', description: 'Show Keyboard Shortcuts', action: () => {} },
      { key: 'Ctrl + ,', description: 'Open Settings', action: () => {} },
    ],
  },
];

// ============================================================================
// SHORTCUT HELP DIALOG
// ============================================================================

function showShortcutHelp() {
  // This would open a modal with all shortcuts
  // You can implement this with your UI library
  console.log('Keyboard Shortcuts:', globalShortcuts);
  showInfo('Keyboard Shortcuts', 'Press Shift + ? to see all shortcuts');
}

// ============================================================================
// DATA TABLE SHORTCUTS
// ============================================================================

export function useTableShortcuts(options: {
  onNext?: () => void;
  onPrevious?: () => void;
  onOpen?: () => void;
  onSelectAll?: () => void;
  enabled?: boolean;
}) {
  const { onNext, onPrevious, onOpen, onSelectAll, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'j':
          event.preventDefault();
          onNext?.();
          break;
        case 'k':
          event.preventDefault();
          onPrevious?.();
          break;
        case 'enter':
          event.preventDefault();
          onOpen?.();
          break;
        case 'a':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onSelectAll?.();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrevious, onOpen, onSelectAll, enabled]);
}

// ============================================================================
// FORM SHORTCUTS
// ============================================================================

export function useFormShortcuts(options: {
  onSave?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  enabled?: boolean;
}) {
  const { onSave, onCancel, onSubmit, enabled = true } = options;

  useKeyboardShortcut(
    's',
    () => {
      if (enabled && onSave) {
        onSave();
      }
    },
    { ctrl: true }
  );

  useKeyboardShortcut(
    'Escape',
    () => {
      if (enabled && onCancel) {
        onCancel();
      }
    },
    { preventDefault: false }
  );

  useKeyboardShortcut(
    'Enter',
    () => {
      if (enabled && onSubmit) {
        onSubmit();
      }
    },
    { ctrl: true }
  );
}

// ============================================================================
// MODAL/DIALOG SHORTCUTS
// ============================================================================

export function useDialogShortcuts(options: {
  onClose?: () => void;
  onConfirm?: () => void;
  isOpen: boolean;
}) {
  const { onClose, onConfirm, isOpen } = options;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        event.preventDefault();
        onClose();
      }

      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && onConfirm) {
        event.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);
}

// ============================================================================
// SEARCH SHORTCUTS
// ============================================================================

export function useSearchShortcuts(inputRef: React.RefObject<HTMLInputElement>) {
  useKeyboardShortcut(
    '/',
    () => {
      inputRef.current?.focus();
    },
    { preventDefault: true }
  );

  useKeyboardShortcut(
    'k',
    () => {
      inputRef.current?.focus();
    },
    { ctrl: true }
  );

  // Clear search with Escape
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && document.activeElement === input) {
        input.value = '';
        input.blur();
      }
    };

    input.addEventListener('keydown', handleEscape);
    return () => input.removeEventListener('keydown', handleEscape);
  }, [inputRef]);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: Partial<Shortcut>): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.meta) parts.push('⌘');
  if (shortcut.key) parts.push(shortcut.key.toUpperCase());

  return parts.join(' + ');
}

/**
 * Check if user is on Mac
 */
export function isMac(): boolean {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

/**
 * Get modifier key based on platform
 */
export function getModifierKey(): 'ctrl' | 'meta' {
  return isMac() ? 'meta' : 'ctrl';
}

/**
 * Format modifier key for display
 */
export function getModifierKeySymbol(): string {
  return isMac() ? '⌘' : 'Ctrl';
}

// ============================================================================
// SHORTCUT HELP COMPONENT DATA
// ============================================================================

export const getShortcutsByPage = (page: string): ShortcutGroup[] => {
  const pageShortcuts: Record<string, ShortcutGroup[]> = {
    dashboard: [
      {
        name: 'Quick Actions',
        shortcuts: [
          { key: 'N', description: 'New Prospect', action: () => {}, shift: true },
          { key: 'R', description: 'Refresh Data', action: () => {}, ctrl: true },
        ],
      },
    ],
    advisors: [
      {
        name: 'Advisor Management',
        shortcuts: [
          { key: 'N', description: 'New Advisor', action: () => {}, shift: true },
          { key: 'E', description: 'Edit Selected', action: () => {} },
          { key: 'F', description: 'Filter', action: () => {}, ctrl: true },
        ],
      },
    ],
    clients: [
      {
        name: 'Client Management',
        shortcuts: [
          { key: 'N', description: 'New Client', action: () => {}, shift: true },
          { key: 'E', description: 'Edit Selected', action: () => {} },
          { key: 'M', description: 'Find Matches', action: () => {}, ctrl: true },
        ],
      },
    ],
  };

  return pageShortcuts[page] || [];
};
