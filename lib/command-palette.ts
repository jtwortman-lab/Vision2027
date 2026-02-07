import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  Users,
  UserPlus,
  FileText,
  Sparkles,
  Settings,
  BarChart3,
  FileOutput,
  Briefcase,
  Building2,
  Target,
  Calendar,
  Bell,
  HelpCircle,
} from 'lucide-react';

// ============================================================================
// COMMAND TYPES
// ============================================================================

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  category: CommandCategory;
  action: () => void;
  keywords?: string[];
}

export type CommandCategory =
  | 'navigation'
  | 'actions'
  | 'search'
  | 'create'
  | 'export'
  | 'settings';

// ============================================================================
// COMMAND PALETTE HOOK
// ============================================================================

export function useCommandPalette() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearch('');
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const commands: Command[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      icon: Home,
      shortcut: 'Shift+G',
      category: 'navigation',
      action: () => navigate('/'),
      keywords: ['dashboard', 'home', 'overview'],
    },
    {
      id: 'nav-advisors',
      label: 'Go to Advisors',
      icon: Users,
      shortcut: 'Shift+A',
      category: 'navigation',
      action: () => navigate('/advisors'),
      keywords: ['advisors', 'team', 'book'],
    },
    {
      id: 'nav-clients',
      label: 'Go to Clients',
      icon: Briefcase,
      shortcut: 'Shift+C',
      category: 'navigation',
      action: () => navigate('/clients'),
      keywords: ['clients', 'customers'],
    },
    {
      id: 'nav-analytics',
      label: 'Go to Analytics',
      icon: BarChart3,
      category: 'navigation',
      action: () => navigate('/analytics'),
      keywords: ['analytics', 'reports', 'insights', 'metrics'],
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      icon: Settings,
      category: 'navigation',
      action: () => navigate('/settings'),
      keywords: ['settings', 'preferences', 'configuration'],
    },

    // Create Actions
    {
      id: 'create-prospect',
      label: 'New Prospect Intake',
      description: 'Start the prospect intake workflow',
      icon: UserPlus,
      shortcut: 'Shift+P',
      category: 'create',
      action: () => navigate('/intake'),
      keywords: ['new', 'prospect', 'intake', 'client', 'add'],
    },
    {
      id: 'create-advisor',
      label: 'Add New Advisor',
      description: 'Create a new advisor profile',
      icon: UserPlus,
      category: 'create',
      action: () => navigate('/advisors/new'),
      keywords: ['new', 'advisor', 'add', 'team'],
    },
    {
      id: 'create-client',
      label: 'Add New Client',
      description: 'Create a new client record',
      icon: Building2,
      category: 'create',
      action: () => navigate('/clients/new'),
      keywords: ['new', 'client', 'add'],
    },

    // Actions
    {
      id: 'action-match',
      label: 'Find Advisor Matches',
      description: 'Run matching algorithm for a client',
      icon: Sparkles,
      shortcut: 'Shift+M',
      category: 'actions',
      action: () => navigate('/matches'),
      keywords: ['match', 'find', 'assign', 'algorithm'],
    },
    {
      id: 'action-help',
      label: 'Show Keyboard Shortcuts',
      description: 'View all available shortcuts',
      icon: HelpCircle,
      shortcut: 'Shift+?',
      category: 'actions',
      action: () => {
        // This would open a shortcuts modal
        console.log('Show shortcuts modal');
      },
      keywords: ['help', 'shortcuts', 'keyboard', 'commands'],
    },

    // Export Actions
    {
      id: 'export-advisors',
      label: 'Export Advisors to CSV',
      description: 'Download all advisor data',
      icon: FileOutput,
      category: 'export',
      action: () => {
        // Trigger export
        console.log('Export advisors');
      },
      keywords: ['export', 'download', 'csv', 'advisors', 'data'],
    },
    {
      id: 'export-clients',
      label: 'Export Clients to CSV',
      description: 'Download all client data',
      icon: FileOutput,
      category: 'export',
      action: () => {
        console.log('Export clients');
      },
      keywords: ['export', 'download', 'csv', 'clients', 'data'],
    },
    {
      id: 'export-analytics',
      label: 'Export Team Analytics',
      description: 'Download team performance report',
      icon: FileOutput,
      category: 'export',
      action: () => {
        console.log('Export analytics');
      },
      keywords: ['export', 'download', 'analytics', 'report', 'team'],
    },
  ], [navigate]);

  const filteredCommands = useMemo(() => {
    if (!search) return commands;

    const searchLower = search.toLowerCase();
    
    return commands.filter((cmd) => {
      const labelMatch = cmd.label.toLowerCase().includes(searchLower);
      const descriptionMatch = cmd.description?.toLowerCase().includes(searchLower);
      const keywordMatch = cmd.keywords?.some((k) => k.includes(searchLower));
      
      return labelMatch || descriptionMatch || keywordMatch;
    });
  }, [commands, search]);

  const groupedCommands = useMemo(() => {
    const groups: Record<CommandCategory, Command[]> = {
      navigation: [],
      actions: [],
      search: [],
      create: [],
      export: [],
      settings: [],
    };

    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  const executeCommand = (command: Command) => {
    command.action();
    setIsOpen(false);
    setSearch('');
  };

  return {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    commands: filteredCommands,
    groupedCommands,
    executeCommand,
  };
}

// ============================================================================
// RECENT COMMANDS HOOK
// ============================================================================

export function useRecentCommands(maxRecent = 5) {
  const [recentCommands, setRecentCommands] = useState<string[]>(() => {
    const stored = localStorage.getItem('recentCommands');
    return stored ? JSON.parse(stored) : [];
  });

  const addRecentCommand = (commandId: string) => {
    const updated = [
      commandId,
      ...recentCommands.filter((id) => id !== commandId),
    ].slice(0, maxRecent);

    setRecentCommands(updated);
    localStorage.setItem('recentCommands', JSON.stringify(updated));
  };

  const clearRecentCommands = () => {
    setRecentCommands([]);
    localStorage.removeItem('recentCommands');
  };

  return {
    recentCommands,
    addRecentCommand,
    clearRecentCommands,
  };
}

// ============================================================================
// COMMAND PALETTE CATEGORIES
// ============================================================================

export const categoryLabels: Record<CommandCategory, string> = {
  navigation: 'Navigation',
  actions: 'Actions',
  search: 'Search',
  create: 'Create',
  export: 'Export',
  settings: 'Settings',
};

export const categoryIcons: Record<CommandCategory, React.ComponentType<{ className?: string }>> = {
  navigation: Home,
  actions: Sparkles,
  search: Search,
  create: UserPlus,
  export: FileOutput,
  settings: Settings,
};
