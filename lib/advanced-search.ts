import { useMemo, useState } from 'react';
import type { 
  AdvisorWithProfile, 
  ClientWithNeeds, 
  SegmentType, 
  ComplexityTier 
} from '@/types/database';

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export interface SearchOptions {
  query?: string;
  fuzzy?: boolean;
  fields?: string[];
}

export interface FilterOptions<T> {
  filters: Partial<Record<keyof T, any>>;
  operator?: 'AND' | 'OR';
}

export interface SortOptions<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

// ============================================================================
// ADVISOR FILTERS
// ============================================================================

export interface AdvisorFilters {
  office?: string[];
  team?: string[];
  segment?: SegmentType[];
  minCapacity?: number;
  maxCapacity?: number;
  minYearsExperience?: number;
  maxYearsExperience?: number;
  certifications?: string[];
  availabilityStatus?: string[];
  hasSkill?: string[]; // subtopic IDs
  minSkillLevel?: number;
}

export function useAdvisorSearch(advisors: AdvisorWithProfile[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AdvisorFilters>({});
  const [sortBy, setSortBy] = useState<keyof AdvisorWithProfile>('profile');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredAdvisors = useMemo(() => {
    let results = [...advisors];

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter((advisor) => {
        return (
          advisor.profile.full_name.toLowerCase().includes(query) ||
          advisor.profile.email.toLowerCase().includes(query) ||
          advisor.profile.office?.toLowerCase().includes(query) ||
          advisor.profile.team?.toLowerCase().includes(query) ||
          advisor.certifications.some((cert) => cert.toLowerCase().includes(query))
        );
      });
    }

    // Office filter
    if (filters.office && filters.office.length > 0) {
      results = results.filter((a) => 
        filters.office!.includes(a.profile.office || '')
      );
    }

    // Team filter
    if (filters.team && filters.team.length > 0) {
      results = results.filter((a) => 
        filters.team!.includes(a.profile.team || '')
      );
    }

    // Segment filter
    if (filters.segment && filters.segment.length > 0) {
      results = results.filter((a) => 
        filters.segment!.includes(a.target_segment)
      );
    }

    // Capacity range
    if (filters.minCapacity !== undefined) {
      results = results.filter((a) => 
        a.capacityPercentage >= filters.minCapacity!
      );
    }
    if (filters.maxCapacity !== undefined) {
      results = results.filter((a) => 
        a.capacityPercentage <= filters.maxCapacity!
      );
    }

    // Experience range
    if (filters.minYearsExperience !== undefined) {
      results = results.filter((a) => 
        a.years_experience >= filters.minYearsExperience!
      );
    }
    if (filters.maxYearsExperience !== undefined) {
      results = results.filter((a) => 
        a.years_experience <= filters.maxYearsExperience!
      );
    }

    // Certifications
    if (filters.certifications && filters.certifications.length > 0) {
      results = results.filter((a) =>
        filters.certifications!.some((cert) => a.certifications.includes(cert))
      );
    }

    // Availability status
    if (filters.availabilityStatus && filters.availabilityStatus.length > 0) {
      results = results.filter((a) =>
        filters.availabilityStatus!.includes(a.availability_status)
      );
    }

    // Has specific skill
    if (filters.hasSkill && filters.hasSkill.length > 0) {
      results = results.filter((a) =>
        filters.hasSkill!.some((skillId) =>
          a.skills?.some((skill) => skill.subtopic_id === skillId)
        )
      );
    }

    // Minimum skill level
    if (filters.minSkillLevel !== undefined && filters.hasSkill) {
      results = results.filter((a) =>
        filters.hasSkill!.some((skillId) => {
          const skill = a.skills?.find((s) => s.subtopic_id === skillId);
          return skill && skill.skill_level >= filters.minSkillLevel!;
        })
      );
    }

    // Sorting
    results.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortBy === 'profile') {
        aValue = a.profile.full_name;
        bValue = b.profile.full_name;
      } else if (sortBy === 'capacityPercentage') {
        aValue = a.capacityPercentage;
        bValue = b.capacityPercentage;
      } else if (sortBy === 'years_experience') {
        aValue = a.years_experience;
        bValue = b.years_experience;
      } else {
        aValue = (a as any)[sortBy];
        bValue = (b as any)[sortBy];
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return results;
  }, [advisors, searchQuery, filters, sortBy, sortDirection]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    updateFilter: <K extends keyof AdvisorFilters>(key: K, value: AdvisorFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    clearFilters: () => setFilters({}),
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    toggleSortDirection: () => setSortDirection((d) => d === 'asc' ? 'desc' : 'asc'),
    results: filteredAdvisors,
    resultCount: filteredAdvisors.length,
    totalCount: advisors.length,
    hasActiveFilters: searchQuery !== '' || Object.keys(filters).length > 0,
  };
}

// ============================================================================
// CLIENT FILTERS
// ============================================================================

export interface ClientFilters {
  segment?: SegmentType[];
  complexityTier?: ComplexityTier[];
  office?: string[];
  city?: string[];
  state?: string[];
  aumBand?: string[];
  netWorthBand?: string[];
  isProspect?: boolean;
  hasNeed?: string[]; // subtopic IDs
  minImportance?: number;
  minUrgency?: number;
}

export function useClientSearch(clients: ClientWithNeeds[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ClientFilters>({});
  const [sortBy, setSortBy] = useState<keyof ClientWithNeeds>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredClients = useMemo(() => {
    let results = [...clients];

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter((client) => {
        return (
          client.name.toLowerCase().includes(query) ||
          client.office?.toLowerCase().includes(query) ||
          client.city?.toLowerCase().includes(query) ||
          client.state?.toLowerCase().includes(query)
        );
      });
    }

    // Segment filter
    if (filters.segment && filters.segment.length > 0) {
      results = results.filter((c) => filters.segment!.includes(c.segment));
    }

    // Complexity tier filter
    if (filters.complexityTier && filters.complexityTier.length > 0) {
      results = results.filter((c) => 
        filters.complexityTier!.includes(c.complexity_tier)
      );
    }

    // Office filter
    if (filters.office && filters.office.length > 0) {
      results = results.filter((c) => 
        filters.office!.includes(c.office || '')
      );
    }

    // City filter
    if (filters.city && filters.city.length > 0) {
      results = results.filter((c) => 
        filters.city!.includes(c.city || '')
      );
    }

    // State filter
    if (filters.state && filters.state.length > 0) {
      results = results.filter((c) => 
        filters.state!.includes(c.state || '')
      );
    }

    // AUM band filter
    if (filters.aumBand && filters.aumBand.length > 0) {
      results = results.filter((c) => 
        filters.aumBand!.includes(c.aum_band || '')
      );
    }

    // Net worth band filter
    if (filters.netWorthBand && filters.netWorthBand.length > 0) {
      results = results.filter((c) => 
        filters.netWorthBand!.includes(c.net_worth_band || '')
      );
    }

    // Prospect filter
    if (filters.isProspect !== undefined) {
      results = results.filter((c) => c.is_prospect === filters.isProspect);
    }

    // Has specific need
    if (filters.hasNeed && filters.hasNeed.length > 0) {
      results = results.filter((c) =>
        filters.hasNeed!.some((needId) =>
          c.needs?.some((need) => need.subtopic_id === needId)
        )
      );
    }

    // Minimum importance
    if (filters.minImportance !== undefined) {
      results = results.filter((c) =>
        c.needs?.some((need) => need.importance >= filters.minImportance!)
      );
    }

    // Minimum urgency
    if (filters.minUrgency !== undefined) {
      results = results.filter((c) =>
        c.needs?.some((need) => need.urgency >= filters.minUrgency!)
      );
    }

    // Sorting
    results.sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];

      if (typeof aValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return results;
  }, [clients, searchQuery, filters, sortBy, sortDirection]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    updateFilter: <K extends keyof ClientFilters>(key: K, value: ClientFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    clearFilters: () => setFilters({}),
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    toggleSortDirection: () => setSortDirection((d) => d === 'asc' ? 'desc' : 'asc'),
    results: filteredClients,
    resultCount: filteredClients.length,
    totalCount: clients.length,
    hasActiveFilters: searchQuery !== '' || Object.keys(filters).length > 0,
  };
}

// ============================================================================
// SAVED FILTERS
// ============================================================================

export interface SavedFilter<T> {
  id: string;
  name: string;
  filters: T;
  createdAt: Date;
}

export function useSavedFilters<T>(storageKey: string) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter<T>[]>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  });

  const saveFilter = (name: string, filters: T) => {
    const newFilter: SavedFilter<T> = {
      id: `filter-${Date.now()}`,
      name,
      filters,
      createdAt: new Date(),
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const deleteFilter = (id: string) => {
    const updated = savedFilters.filter((f) => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const applyFilter = (id: string): T | undefined => {
    return savedFilters.find((f) => f.id === id)?.filters;
  };

  return {
    savedFilters,
    saveFilter,
    deleteFilter,
    applyFilter,
  };
}

// ============================================================================
// FUZZY SEARCH
// ============================================================================

export function fuzzyMatch(text: string, query: string): boolean {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  let textIndex = 0;
  let queryIndex = 0;
  
  while (textIndex < textLower.length && queryIndex < queryLower.length) {
    if (textLower[textIndex] === queryLower[queryIndex]) {
      queryIndex++;
    }
    textIndex++;
  }
  
  return queryIndex === queryLower.length;
}

export function fuzzySearch<T>(
  items: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query) return items;
  
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      if (typeof value === 'string') {
        return fuzzyMatch(value, query);
      }
      return false;
    })
  );
}

// ============================================================================
// FILTER PRESETS
// ============================================================================

export const advisorFilterPresets = {
  available: {
    name: 'Available Advisors',
    filters: {
      maxCapacity: 80,
      availabilityStatus: ['available'],
    } as AdvisorFilters,
  },
  atCapacity: {
    name: 'At Capacity',
    filters: {
      minCapacity: 100,
    } as AdvisorFilters,
  },
  senior: {
    name: 'Senior Advisors',
    filters: {
      minYearsExperience: 10,
    } as AdvisorFilters,
  },
  certified: {
    name: 'Certified Professionals',
    filters: {
      certifications: ['CFP', 'CFA', 'CPA'],
    } as AdvisorFilters,
  },
};

export const clientFilterPresets = {
  highPriority: {
    name: 'High Priority Clients',
    filters: {
      minImportance: 8,
      minUrgency: 8,
    } as ClientFilters,
  },
  prospects: {
    name: 'Active Prospects',
    filters: {
      isProspect: true,
    } as ClientFilters,
  },
  ultraHNW: {
    name: 'Ultra HNW',
    filters: {
      segment: ['ultra_hnw' as SegmentType],
    } as ClientFilters,
  },
  complex: {
    name: 'Complex Cases',
    filters: {
      complexityTier: ['highly_complex' as ComplexityTier],
    } as ClientFilters,
  },
};
