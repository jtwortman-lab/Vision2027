import { useState, useEffect } from 'react';

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// ============================================================================
// MEDIA QUERY HOOK
// ============================================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// ============================================================================
// BREAKPOINT HOOKS
// ============================================================================

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`);
}

export function useIsMobile(): boolean {
  return !useMediaQuery(`(min-width: ${breakpoints.md}px)`);
}

export function useIsTablet(): boolean {
  const isAboveMobile = useMediaQuery(`(min-width: ${breakpoints.md}px)`);
  const isBelowDesktop = !useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
  return isAboveMobile && isBelowDesktop;
}

export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
}

// ============================================================================
// SCREEN SIZE HOOK
// ============================================================================

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'wide';

export function useScreenSize(): ScreenSize {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isWide = useBreakpoint('2xl');

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  if (isWide) return 'wide';
  return 'desktop';
}

// ============================================================================
// WINDOW SIZE HOOK
// ============================================================================

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// ============================================================================
// ORIENTATION HOOK
// ============================================================================

export type Orientation = 'portrait' | 'landscape';

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>(
    window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const handleResize = () => {
      setOrientation(
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return orientation;
}

// ============================================================================
// TOUCH DEVICE DETECTION
// ============================================================================

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  }, []);

  return isTouch;
}

// ============================================================================
// RESPONSIVE VALUE HOOK
// ============================================================================

interface ResponsiveValues<T> {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

export function useResponsiveValue<T>(values: ResponsiveValues<T>): T {
  const is2xl = useBreakpoint('2xl');
  const isXl = useBreakpoint('xl');
  const isLg = useBreakpoint('lg');
  const isMd = useBreakpoint('md');
  const isSm = useBreakpoint('sm');

  if (is2xl && values['2xl'] !== undefined) return values['2xl'];
  if (isXl && values.xl !== undefined) return values.xl;
  if (isLg && values.lg !== undefined) return values.lg;
  if (isMd && values.md !== undefined) return values.md;
  if (isSm && values.sm !== undefined) return values.sm;
  return values.base;
}

// ============================================================================
// MOBILE NAVIGATION HOOK
// ============================================================================

export function useMobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close nav when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  // Prevent body scroll when nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return {
    isOpen,
    setIsOpen,
    toggle: () => setIsOpen(!isOpen),
    close: () => setIsOpen(false),
  };
}

// ============================================================================
// SCROLL DIRECTION HOOK
// ============================================================================

export type ScrollDirection = 'up' | 'down' | null;

export function useScrollDirection(threshold = 10): ScrollDirection {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      if (Math.abs(scrollY - lastScrollY) < threshold) {
        return;
      }

      setScrollDirection(scrollY > lastScrollY ? 'down' : 'up');
      setLastScrollY(scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, threshold]);

  return scrollDirection;
}

// ============================================================================
// SAFE AREA INSETS (for iOS notch, etc.)
// ============================================================================

export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement);
      
      setInsets({
        top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);
    
    return () => window.removeEventListener('resize', updateInsets);
  }, []);

  return insets;
}

// ============================================================================
// RESPONSIVE GRID COLUMNS
// ============================================================================

export function useResponsiveColumns(options: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
  wide?: number;
} = {}) {
  const {
    mobile = 1,
    tablet = 2,
    desktop = 3,
    wide = 4,
  } = options;

  const screenSize = useScreenSize();

  const columns = {
    mobile,
    tablet,
    desktop,
    wide,
  }[screenSize];

  return columns;
}

// ============================================================================
// MOBILE-SPECIFIC UTILITIES
// ============================================================================

/**
 * Check if running as PWA
 */
export function useIsPWA(): boolean {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    setIsPWA(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }, []);

  return isPWA;
}

/**
 * Vibration API (mobile)
 */
export function useVibrate() {
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return { vibrate };
}

/**
 * Network information (mobile)
 */
export function useNetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
  });

  useEffect(() => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 50,
          saveData: connection.saveData || false,
        });
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);
      
      return () => connection.removeEventListener('change', updateNetworkInfo);
    }
  }, []);

  return networkInfo;
}

// ============================================================================
// MOBILE MENU COMPONENT UTILITIES
// ============================================================================

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function useMobileMenu() {
  const { isOpen, setIsOpen, toggle, close } = useMobileNavigation();
  const isMobile = useIsMobile();

  return {
    isOpen: isMobile && isOpen,
    setIsOpen,
    toggle,
    close,
    isMobile,
  };
}

// ============================================================================
// RESPONSIVE TABLE HOOK
// ============================================================================

export function useResponsiveTable() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  return {
    isMobile,
    isTablet,
    shouldStack: isMobile, // Stack table rows on mobile
    visibleColumns: isMobile ? 2 : isTablet ? 4 : 6, // Limit visible columns
    showFullTable: !isMobile && !isTablet,
  };
}

// ============================================================================
// MOBILE GESTURE UTILITIES
// ============================================================================

export function useSwipeGesture(options: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
} = {}) {
  const { threshold = 50 } = options;
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          options.onSwipeRight?.();
        } else {
          options.onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          options.onSwipeDown?.();
        } else {
          options.onSwipeUp?.();
        }
      }
    }

    setTouchStart(null);
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}

// ============================================================================
// RESPONSIVE FONT SIZE
// ============================================================================

export function useResponsiveFontSize(options: {
  mobile: number;
  tablet: number;
  desktop: number;
} = {
  mobile: 14,
  tablet: 16,
  desktop: 16,
}) {
  return useResponsiveValue({
    base: options.mobile,
    md: options.tablet,
    lg: options.desktop,
  });
}
