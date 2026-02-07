import { useState } from 'react';
import { ChevronDown, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const ADM_LIST = ['Michael Torres', 'Jennifer Adams', 'Robert Chen'];

interface ADMSelectorProps {
  selectedADM: string | null;
  onSelectADM: (adm: string | null) => void;
}

export function ADMSelector({ selectedADM, onSelectADM }: ADMSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2 min-w-[200px] justify-between">
          <div className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span>{selectedADM || 'All Managers'}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] bg-popover z-50">
        <DropdownMenuItem 
          onClick={() => onSelectADM(null)}
          className={cn(
            'cursor-pointer',
            !selectedADM && 'bg-accent'
          )}
        >
          All Managers
        </DropdownMenuItem>
        {ADM_LIST.map((adm) => (
          <DropdownMenuItem
            key={adm}
            onClick={() => onSelectADM(adm)}
            className={cn(
              'cursor-pointer',
              selectedADM === adm && 'bg-accent'
            )}
          >
            {adm}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
