import { useEffect, useRef, useState } from 'react';
import { Command } from 'cmdk';
import { Search, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { 
  useCommandPalette, 
  categoryLabels, 
  type Command as CommandType 
} from '@/lib/command-palette';

export function CommandPalette() {
  const {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    groupedCommands,
    executeCommand,
  } = useCommandPalette();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const allCommands = Object.values(groupedCommands).flat();

  const handleSelect = (command: CommandType) => {
    executeCommand(command);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl max-w-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">ESC</span>
            </kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {Object.entries(groupedCommands).map(([category, commands]) => {
              if (commands.length === 0) return null;

              return (
                <Command.Group
                  key={category}
                  heading={categoryLabels[category as keyof typeof categoryLabels]}
                >
                  {commands.map((command) => (
                    <Command.Item
                      key={command.id}
                      value={command.id}
                      onSelect={() => handleSelect(command)}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      {command.icon && (
                        <command.icon className="mr-2 h-4 w-4" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{command.label}</div>
                        {command.description && (
                          <div className="text-xs text-muted-foreground">
                            {command.description}
                          </div>
                        )}
                      </div>
                      {command.shortcut && (
                        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                          {command.shortcut.split('+').map((key, i) => (
                            <span key={i}>{key}</span>
                          ))}
                        </kbd>
                      )}
                      <ArrowRight className="ml-2 h-4 w-4 opacity-50" />
                    </Command.Item>
                  ))}
                </Command.Group>
              );
            })}
          </Command.List>

          <div className="border-t px-4 py-3 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                {allCommands.length} {allCommands.length === 1 ? 'command' : 'commands'}
              </span>
              <div className="flex items-center gap-3">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">↑↓</span>
                </kbd>
                <span>to navigate</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">↵</span>
                </kbd>
                <span>to select</span>
              </div>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// COMMAND PALETTE TRIGGER BUTTON
// ============================================================================

export function CommandPaletteTrigger() {
  const { setIsOpen } = useCommandPalette();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline-flex">Search...</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘K</span>
      </kbd>
    </button>
  );
}
