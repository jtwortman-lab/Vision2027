import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear, parseISO, addDays, addMonths, addYears, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays, differenceInMonths, isBefore, isAfter, isSameDay } from 'date-fns';

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format date in a human-readable way
 */
export function formatDate(date: Date | string, formatStr = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

/**
 * Format time only
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Smart date formatting (contextual)
 */
export function formatSmartDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(d)) {
    return `Today at ${formatTime(d)}`;
  }
  
  if (isYesterday(d)) {
    return `Yesterday at ${formatTime(d)}`;
  }
  
  if (isThisWeek(d)) {
    return format(d, 'EEEE \'at\' h:mm a');
  }
  
  if (isThisYear(d)) {
    return format(d, 'MMM d \'at\' h:mm a');
  }
  
  return format(d, 'MMM d, yyyy');
}

/**
 * Format date range
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  
  if (isSameDay(startDate, endDate)) {
    return formatDate(startDate);
  }
  
  if (isThisYear(startDate) && isThisYear(endDate)) {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  }
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

// ============================================================================
// GROUPING
// ============================================================================

export type DateGroup = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'older';

/**
 * Get date group for an item
 */
export function getDateGroup(date: Date | string): DateGroup {
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(d)) return 'today';
  if (isYesterday(d)) return 'yesterday';
  if (isThisWeek(d)) return 'thisWeek';
  if (isThisMonth(d)) return 'thisMonth';
  return 'older';
}

/**
 * Group items by date
 */
export function groupByDate<T>(
  items: T[],
  dateGetter: (item: T) => Date | string
): Record<DateGroup, T[]> {
  const groups: Record<DateGroup, T[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  };
  
  items.forEach((item) => {
    const group = getDateGroup(dateGetter(item));
    groups[group].push(item);
  });
  
  return groups;
}

/**
 * Date group labels
 */
export const dateGroupLabels: Record<DateGroup, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  older: 'Older',
};

// ============================================================================
// CALCULATIONS
// ============================================================================

/**
 * Add time to a date
 */
export function addTime(
  date: Date | string,
  amount: number,
  unit: 'days' | 'months' | 'years'
): Date {
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  switch (unit) {
    case 'days':
      return addDays(d, amount);
    case 'months':
      return addMonths(d, amount);
    case 'years':
      return addYears(d, amount);
  }
}

/**
 * Get difference between dates
 */
export function getDateDifference(
  start: Date | string,
  end: Date | string,
  unit: 'days' | 'months' = 'days'
): number {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  
  switch (unit) {
    case 'days':
      return differenceInDays(endDate, startDate);
    case 'months':
      return differenceInMonths(endDate, startDate);
  }
}

/**
 * Check if date is in range
 */
export function isInDateRange(
  date: Date | string,
  start: Date | string,
  end: Date | string
): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  
  return !isBefore(d, startDate) && !isAfter(d, endDate);
}

// ============================================================================
// BUSINESS LOGIC
// ============================================================================

/**
 * Get days until a date
 */
export function getDaysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return differenceInDays(d, new Date());
}

/**
 * Check if date is overdue
 */
export function isOverdue(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(d, new Date());
}

/**
 * Check if date is upcoming (within X days)
 */
export function isUpcoming(date: Date | string, withinDays = 7): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const daysUntil = getDaysUntil(d);
  return daysUntil > 0 && daysUntil <= withinDays;
}

/**
 * Get urgency level based on date
 */
export function getDateUrgency(
  date: Date | string
): 'overdue' | 'urgent' | 'upcoming' | 'future' {
  if (isOverdue(date)) return 'overdue';
  if (isUpcoming(date, 3)) return 'urgent';
  if (isUpcoming(date, 14)) return 'upcoming';
  return 'future';
}

// ============================================================================
// COMMON DATE RANGES
// ============================================================================

export const dateRanges = {
  today: () => ({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  }),
  
  yesterday: () => ({
    start: startOfDay(addDays(new Date(), -1)),
    end: endOfDay(addDays(new Date(), -1)),
  }),
  
  thisWeek: () => ({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  }),
  
  lastWeek: () => ({
    start: startOfWeek(addDays(new Date(), -7)),
    end: endOfWeek(addDays(new Date(), -7)),
  }),
  
  thisMonth: () => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  }),
  
  lastMonth: () => ({
    start: startOfMonth(addMonths(new Date(), -1)),
    end: endOfMonth(addMonths(new Date(), -1)),
  }),
  
  last30Days: () => ({
    start: startOfDay(addDays(new Date(), -30)),
    end: endOfDay(new Date()),
  }),
  
  last90Days: () => ({
    start: startOfDay(addDays(new Date(), -90)),
    end: endOfDay(new Date()),
  }),
  
  thisYear: () => ({
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59),
  }),
};

// ============================================================================
// SCHEDULING HELPERS
// ============================================================================

/**
 * Get next occurrence of a day of week
 */
export function getNextDayOfWeek(dayOfWeek: number): Date {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7;
  return addDays(today, daysUntil);
}

/**
 * Get business days between dates (excludes weekends)
 */
export function getBusinessDays(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  
  let count = 0;
  let current = new Date(startDate);
  
  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current = addDays(current, 1);
  }
  
  return count;
}

/**
 * Check if date is a weekend
 */
export function isWeekend(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const day = d.getDay();
  return day === 0 || day === 6;
}

/**
 * Check if date is a weekday
 */
export function isWeekday(date: Date | string): boolean {
  return !isWeekend(date);
}

// ============================================================================
// CLIENT/ADVISOR SPECIFIC
// ============================================================================

/**
 * Calculate client tenure (how long they've been a client)
 */
export function calculateClientTenure(clientSince: Date | string): string {
  const since = typeof clientSince === 'string' ? parseISO(clientSince) : clientSince;
  const months = differenceInMonths(new Date(), since);
  
  if (months < 12) {
    return `${months} month${months === 1 ? '' : 's'}`;
  }
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} year${years === 1 ? '' : 's'}`;
  }
  
  return `${years} year${years === 1 ? '' : 's'}, ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
}

/**
 * Get time since last skill assessment
 */
export function getTimeSinceAssessment(lastAssessed: Date | string): {
  months: number;
  isOverdue: boolean;
  label: string;
} {
  const last = typeof lastAssessed === 'string' ? parseISO(lastAssessed) : lastAssessed;
  const months = differenceInMonths(new Date(), last);
  const isOverdue = months >= 6; // Assuming quarterly assessments
  
  let label: string;
  if (months === 0) {
    label = 'This month';
  } else if (months === 1) {
    label = '1 month ago';
  } else {
    label = `${months} months ago`;
  }
  
  return { months, isOverdue, label };
}

/**
 * Format horizon (planning horizon)
 */
export function formatHorizon(horizon: string): string {
  const horizonLabels: Record<string, string> = {
    now: 'Immediate',
    '1yr': '1 Year',
    '3yr': '3 Years',
    '5yr': '5+ Years',
  };
  
  return horizonLabels[horizon] || horizon;
}
