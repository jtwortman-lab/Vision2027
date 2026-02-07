import { Menu, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useMobileMenu, useScrollDirection } from '@/lib/responsive';

// ============================================================================
// MOBILE HEADER
// ============================================================================

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function MobileHeader({
  title,
  showBack,
  onBack,
  actions,
  className,
}: MobileHeaderProps) {
  const scrollDirection = useScrollDirection();
  const isHidden = scrollDirection === 'down';

  return (
    <div
      className={cn(
        'sticky top-0 z-50 bg-background border-b transition-transform duration-300',
        isHidden && '-translate-y-full',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="font-semibold text-lg truncate">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

// ============================================================================
// MOBILE NAVIGATION
// ============================================================================

interface MobileNavigationProps {
  children: React.ReactNode;
  title?: string;
}

export function MobileNavigation({ children, title = 'Menu' }: MobileNavigationProps) {
  const { isOpen, setIsOpen, isMobile } = useMobileMenu();

  if (!isMobile) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto h-[calc(100vh-65px)]">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

// ============================================================================
// MOBILE BOTTOM NAVIGATION
// ============================================================================

interface MobileBottomNavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: number;
  active?: boolean;
}

interface MobileBottomNavigationProps {
  items: MobileBottomNavItem[];
  className?: string;
}

export function MobileBottomNavigation({ items, className }: MobileBottomNavigationProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden safe-area-inset-bottom',
        className
      )}
    >
      <div className="grid grid-cols-4 h-16">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={cn(
              'flex flex-col items-center justify-center gap-1 relative',
              item.active
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-1 right-1/4 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MOBILE CARD
// ============================================================================

interface MobileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MobileCard({ children, onClick, className }: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-card text-card-foreground rounded-lg border p-4 active:bg-accent transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// MOBILE LIST ITEM
// ============================================================================

interface MobileListItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MobileListItem({
  title,
  subtitle,
  icon,
  badge,
  onClick,
  className,
}: MobileListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-4 border-b last:border-b-0 active:bg-accent transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{title}</div>
        {subtitle && (
          <div className="text-sm text-muted-foreground truncate">{subtitle}</div>
        )}
      </div>
      {badge && <div className="flex-shrink-0">{badge}</div>}
    </div>
  );
}

// ============================================================================
// MOBILE TABS
// ============================================================================

interface MobileTabsProps {
  tabs: Array<{
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MobileTabs({ tabs, activeTab, onChange, className }: MobileTabsProps) {
  return (
    <div
      className={cn(
        'flex overflow-x-auto scrollbar-hide border-b bg-background sticky top-0 z-10',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 whitespace-nowrap border-b-2 transition-colors',
            activeTab === tab.value
              ? 'border-primary text-primary font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.icon && <tab.icon className="h-4 w-4" />}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// MOBILE ACTION SHEET
// ============================================================================

interface MobileActionSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: 'default' | 'destructive';
  }>;
}

export function MobileActionSheet({
  open,
  onClose,
  title,
  actions,
}: MobileActionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-xl">
        {title && (
          <SheetHeader className="mb-4">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
        )}
        <div className="space-y-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant === 'destructive' ? 'destructive' : 'ghost'}
              className="w-full justify-start h-12 text-base"
              onClick={() => {
                action.onClick();
                onClose();
              }}
            >
              {action.icon && <action.icon className="h-5 w-5 mr-3" />}
              {action.label}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={onClose}
        >
          Cancel
        </Button>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// MOBILE PULL TO REFRESH
// ============================================================================

interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function MobilePullToRefresh({ onRefresh, children }: MobilePullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);

  const threshold = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
      setIsPulling(distance > threshold);
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance > threshold) {
      await onRefresh();
    }
    setStartY(0);
    setPullDistance(0);
    setIsPulling(false);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {pullDistance > 0 && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all"
          style={{ height: `${pullDistance}px` }}
        >
          <div
            className={cn(
              'text-muted-foreground transition-transform',
              isPulling && 'scale-110'
            )}
          >
            {isPulling ? '↓ Release to refresh' : '↓ Pull to refresh'}
          </div>
        </div>
      )}
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  );
}

import { useState } from 'react';

// ============================================================================
// MOBILE SEARCH BAR
// ============================================================================

interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function MobileSearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  onFocus,
  onBlur,
}: MobileSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        className={cn(
          'w-full h-12 pl-10 pr-4 rounded-full border bg-background',
          'focus:outline-none focus:ring-2 focus:ring-primary',
          'placeholder:text-muted-foreground',
          isFocused && 'bg-accent'
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
