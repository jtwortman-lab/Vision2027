import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactElement, ReactNode } from 'react';
import type { AdvisorWithProfile, ClientWithNeeds, MatchScore } from '@/types/database';

// ============================================================================
// TEST PROVIDERS
// ============================================================================

interface ProvidersProps {
  children: ReactNode;
}

function AllProviders({ children }: ProvidersProps) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// ============================================================================
// CUSTOM RENDER
// ============================================================================

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

export const mockAdvisor = (overrides: Partial<AdvisorWithProfile> = {}): AdvisorWithProfile => ({
  id: `advisor-${Math.random()}`,
  user_id: `user-${Math.random()}`,
  max_families: 30,
  current_families: 15,
  target_segment: 'traditional',
  availability_status: 'available',
  predictive_index: {},
  interest_areas: ['Estate Planning', 'Tax Planning'],
  growth_goals: ['Increase AUM', 'Develop expertise'],
  years_experience: 10,
  certifications: ['CFP', 'CFA'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  profile: {
    id: `profile-${Math.random()}`,
    email: 'advisor@example.com',
    full_name: 'John Doe',
    avatar_url: null,
    office: 'New York',
    team: 'Alpha',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  skills: [],
  capacityPercentage: 50,
  ...overrides,
});

export const mockClient = (overrides: Partial<ClientWithNeeds> = {}): ClientWithNeeds => ({
  id: `client-${Math.random()}`,
  name: 'ACME Corporation',
  segment: 'private_client',
  complexity_tier: 'complex',
  aum_band: '$5M-$10M',
  net_worth_band: '$10M-$25M',
  office: 'New York',
  city: 'New York',
  state: 'NY',
  valeo_client_since: '2020-01-01',
  my_client_since: '2020-01-01',
  constraints: {},
  preferences: {},
  notes: '',
  is_prospect: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  needs: [],
  ...overrides,
});

export const mockMatchScore = (overrides: Partial<MatchScore> = {}): MatchScore => ({
  advisorId: 'advisor-1',
  advisor: mockAdvisor(),
  leadScore: 85,
  backupScore: 72,
  supportScore: 60,
  confidenceScore: 88,
  explanation: {
    top_drivers: ['Strong in Estate Planning', '10 years of experience'],
    gaps: [],
    why_not: [],
    confidence_factors: ['High confidence - comprehensive skill data'],
  },
  skillMatches: [],
  metrics: {
    skillCoverage: 92.5,
    averageSkillGap: 0.8,
    capacityUtilization: 50,
    experienceLevel: 'senior',
    segmentAlignment: true,
    totalWeightedScore: 85,
  },
  ...overrides,
});

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

export const mockApi = {
  advisors: {
    getAll: jest.fn(() => Promise.resolve([mockAdvisor()])),
    getById: jest.fn((id: string) => Promise.resolve(mockAdvisor({ id }))),
    create: jest.fn((data) => Promise.resolve(mockAdvisor(data))),
    update: jest.fn((id, data) => Promise.resolve(mockAdvisor({ id, ...data }))),
    delete: jest.fn(() => Promise.resolve()),
  },
  clients: {
    getAll: jest.fn(() => Promise.resolve([mockClient()])),
    getById: jest.fn((id: string) => Promise.resolve(mockClient({ id }))),
    create: jest.fn((data) => Promise.resolve(mockClient(data))),
    update: jest.fn((id, data) => Promise.resolve(mockClient({ id, ...data }))),
    delete: jest.fn(() => Promise.resolve()),
  },
};

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Wait for next tick
 */
export const waitForNextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Create a deferred promise for testing async behavior
 */
export function createDeferred<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve: resolve!, reject: reject! };
}

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
  const storage: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
  };
}

/**
 * Mock window.matchMedia
 */
export function mockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

/**
 * Mock IntersectionObserver
 */
export function mockIntersectionObserver() {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  } as any;
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Assert that element has accessible name
 */
export function expectAccessibleName(element: HTMLElement, name: string) {
  expect(element).toHaveAccessibleName(name);
}

/**
 * Assert that element is visible
 */
export function expectVisible(element: HTMLElement) {
  expect(element).toBeVisible();
}

/**
 * Assert that element is not in document
 */
export function expectNotInDocument(element: HTMLElement | null) {
  expect(element).not.toBeInTheDocument();
}

// ============================================================================
// COMPONENT TEST HELPERS
// ============================================================================

/**
 * Fill out a form
 */
export async function fillForm(fields: Record<string, string>) {
  const { getByLabelText, getByRole } = screen;

  for (const [label, value] of Object.entries(fields)) {
    const input = getByLabelText(label);
    await userEvent.clear(input);
    await userEvent.type(input, value);
  }
}

/**
 * Submit a form
 */
export async function submitForm(buttonText = 'Submit') {
  const { getByRole } = screen;
  const button = getByRole('button', { name: buttonText });
  await userEvent.click(button);
}

// ============================================================================
// SNAPSHOT TESTING HELPERS
// ============================================================================

/**
 * Create snapshot serializer for removing dynamic IDs
 */
export const createIdSerializer = () => ({
  test: (val: any) => val && typeof val === 'object' && 'id' in val,
  serialize: (val: any, config: any, indentation: any, depth: any, refs: any, printer: any) => {
    const { id, ...rest } = val;
    return printer({ ...rest, id: '[DYNAMIC_ID]' }, config, indentation, depth, refs);
  },
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ============================================================================
// MATCHING ALGORITHM TESTS
// ============================================================================

export const matchingTestCases = {
  perfectMatch: {
    description: 'Advisor skills exactly match client needs',
    advisor: mockAdvisor({
      skills: [
        { skill_level: 8, subtopic_id: 'estate-planning' },
        { skill_level: 7, subtopic_id: 'tax-planning' },
      ],
    }),
    clientNeeds: [
      { subtopic_id: 'estate-planning', importance: 8 },
      { subtopic_id: 'tax-planning', importance: 7 },
    ],
    expectedScore: { min: 85, max: 95 },
  },
  
  overqualified: {
    description: 'Advisor is overqualified for client needs',
    advisor: mockAdvisor({
      skills: [
        { skill_level: 10, subtopic_id: 'estate-planning' },
      ],
    }),
    clientNeeds: [
      { subtopic_id: 'estate-planning', importance: 5 },
    ],
    expectedScore: { min: 70, max: 85 },
  },
  
  underqualified: {
    description: 'Advisor lacks necessary skills',
    advisor: mockAdvisor({
      skills: [
        { skill_level: 3, subtopic_id: 'estate-planning' },
      ],
    }),
    clientNeeds: [
      { subtopic_id: 'estate-planning', importance: 9 },
    ],
    expectedScore: { min: 0, max: 50 },
  },
  
  atCapacity: {
    description: 'Advisor is at full capacity',
    advisor: mockAdvisor({
      current_families: 30,
      max_families: 30,
      skills: [{ skill_level: 9, subtopic_id: 'estate-planning' }],
    }),
    clientNeeds: [
      { subtopic_id: 'estate-planning', importance: 8 },
    ],
    expectedScore: { min: 0, max: 40 },
  },
};

// ============================================================================
// PERFORMANCE TESTING
// ============================================================================

/**
 * Measure render time
 */
export async function measureRenderTime(component: ReactElement): Promise<number> {
  const startTime = performance.now();
  render(component);
  await waitFor(() => screen.getByTestId('loaded'), { timeout: 5000 });
  const endTime = performance.now();
  return endTime - startTime;
}

/**
 * Test component performance
 */
export async function testPerformance(
  component: ReactElement,
  threshold: number = 100
): Promise<boolean> {
  const renderTime = await measureRenderTime(component);
  console.log(`Render time: ${renderTime}ms (threshold: ${threshold}ms)`);
  return renderTime < threshold;
}
