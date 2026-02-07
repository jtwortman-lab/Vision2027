import type { Domain, Subtopic, AdvisorWithProfile, Client, ClientNeed, Profile, HorizonType } from '@/types/database';

// Domains and Subtopics
export const SEED_DOMAINS: Omit<Domain, 'created_at'>[] = [
  { id: 'dom-insurance', name: 'Insurance', description: 'Life, disability, long-term care, and property insurance planning', display_order: 1, is_active: true },
  { id: 'dom-tax', name: 'Tax', description: 'Tax planning, optimization, and compliance strategies', display_order: 2, is_active: true },
  { id: 'dom-debt', name: 'Debt & Cash Flow', description: 'Debt management, cash flow optimization, and liquidity planning', display_order: 3, is_active: true },
  { id: 'dom-investments', name: 'Investments', description: 'Portfolio management, asset allocation, and investment strategies', display_order: 4, is_active: true },
  { id: 'dom-business', name: 'Business', description: 'Business succession, entity structuring, and executive compensation', display_order: 5, is_active: true },
  { id: 'dom-estate', name: 'Estate', description: 'Estate planning, wealth transfer, and charitable giving', display_order: 6, is_active: true },
  { id: 'dom-behavior', name: 'Behavior & Communication', description: 'Client communication style, behavioral coaching, and relationship management', display_order: 7, is_active: true },
];

export const SEED_SUBTOPICS: Omit<Subtopic, 'created_at'>[] = [
  // Insurance
  { id: 'sub-life-ins', domain_id: 'dom-insurance', name: 'Life Insurance', description: 'Term, whole, universal life policies', default_weight: 1.0, display_order: 1, is_active: true },
  { id: 'sub-disability', domain_id: 'dom-insurance', name: 'Disability Insurance', description: 'Income protection planning', default_weight: 0.8, display_order: 2, is_active: true },
  { id: 'sub-ltc', domain_id: 'dom-insurance', name: 'Long-Term Care', description: 'LTC insurance and hybrid products', default_weight: 0.9, display_order: 3, is_active: true },
  { id: 'sub-property', domain_id: 'dom-insurance', name: 'Property & Casualty', description: 'Home, auto, umbrella coverage', default_weight: 0.6, display_order: 4, is_active: true },

  // Tax
  { id: 'sub-income-tax', domain_id: 'dom-tax', name: 'Income Tax Planning', description: 'Federal and state income tax optimization', default_weight: 1.0, display_order: 1, is_active: true },
  { id: 'sub-capital-gains', domain_id: 'dom-tax', name: 'Capital Gains Management', description: 'Tax-loss harvesting and gain deferral', default_weight: 0.9, display_order: 2, is_active: true },
  { id: 'sub-retirement-tax', domain_id: 'dom-tax', name: 'Retirement Tax Strategies', description: 'Roth conversions, RMD planning', default_weight: 0.85, display_order: 3, is_active: true },
  { id: 'sub-charitable-tax', domain_id: 'dom-tax', name: 'Charitable Tax Planning', description: 'DAFs, charitable trusts, QCDs', default_weight: 0.7, display_order: 4, is_active: true },

  // Debt & Cash Flow
  { id: 'sub-debt-mgmt', domain_id: 'dom-debt', name: 'Debt Management', description: 'Mortgage, HELOC, loan optimization', default_weight: 0.9, display_order: 1, is_active: true },
  { id: 'sub-cash-flow', domain_id: 'dom-debt', name: 'Cash Flow Analysis', description: 'Income/expense optimization', default_weight: 0.85, display_order: 2, is_active: true },
  { id: 'sub-emergency', domain_id: 'dom-debt', name: 'Emergency Fund Planning', description: 'Liquidity and reserves', default_weight: 0.7, display_order: 3, is_active: true },

  // Investments
  { id: 'sub-portfolio', domain_id: 'dom-investments', name: 'Portfolio Management', description: 'Asset allocation and rebalancing', default_weight: 1.0, display_order: 1, is_active: true },
  { id: 'sub-alternatives', domain_id: 'dom-investments', name: 'Alternative Investments', description: 'Private equity, hedge funds, real assets', default_weight: 0.8, display_order: 2, is_active: true },
  { id: 'sub-concentrated', domain_id: 'dom-investments', name: 'Concentrated Stock', description: 'Single-stock diversification strategies', default_weight: 0.9, display_order: 3, is_active: true },
  { id: 'sub-esg', domain_id: 'dom-investments', name: 'ESG/Impact Investing', description: 'Values-aligned investing', default_weight: 0.6, display_order: 4, is_active: true },

  // Business
  { id: 'sub-succession', domain_id: 'dom-business', name: 'Business Succession', description: 'Exit planning and transitions', default_weight: 1.0, display_order: 1, is_active: true },
  { id: 'sub-entity', domain_id: 'dom-business', name: 'Entity Structuring', description: 'LLC, S-Corp, partnership planning', default_weight: 0.85, display_order: 2, is_active: true },
  { id: 'sub-exec-comp', domain_id: 'dom-business', name: 'Executive Compensation', description: 'Stock options, deferred comp, RSUs', default_weight: 0.9, display_order: 3, is_active: true },

  // Estate
  { id: 'sub-estate-basic', domain_id: 'dom-estate', name: 'Basic Estate Planning', description: 'Wills, trusts, POAs', default_weight: 1.0, display_order: 1, is_active: true },
  { id: 'sub-wealth-transfer', domain_id: 'dom-estate', name: 'Wealth Transfer', description: 'Gifting strategies, dynasty trusts', default_weight: 0.9, display_order: 2, is_active: true },
  { id: 'sub-charitable-giving', domain_id: 'dom-estate', name: 'Charitable Giving', description: 'Foundations, CRTs, CLTs', default_weight: 0.8, display_order: 3, is_active: true },
  { id: 'sub-family-governance', domain_id: 'dom-estate', name: 'Family Governance', description: 'Family meetings, education, values', default_weight: 0.7, display_order: 4, is_active: true },

  // Behavior & Communication
  { id: 'sub-client-comm', domain_id: 'dom-behavior', name: 'Client Communication', description: 'Meeting facilitation, rapport building', default_weight: 0.9, display_order: 1, is_active: true },
  { id: 'sub-behavioral', domain_id: 'dom-behavior', name: 'Behavioral Coaching', description: 'Emotion management, decision support', default_weight: 0.85, display_order: 2, is_active: true },
  { id: 'sub-family-dynamics', domain_id: 'dom-behavior', name: 'Family Dynamics', description: 'Multi-generational relationships', default_weight: 0.8, display_order: 3, is_active: true },
];

// Sample Advisors (mock data for demo)
const sampleProfiles: Profile[] = [
  { id: 'adv-1', email: 'sarah.mitchell@valeo.com', full_name: 'Sarah Mitchell', office: 'Chicago', team: 'Wealth Management', avatar_url: '', created_at: '', updated_at: '' },
  { id: 'adv-2', email: 'james.chen@valeo.com', full_name: 'James Chen', office: 'Denver', team: 'Private Client', avatar_url: '', created_at: '', updated_at: '' },
  { id: 'adv-3', email: 'maria.rodriguez@valeo.com', full_name: 'Maria Rodriguez', office: 'Indianapolis', team: 'Family Office', avatar_url: '', created_at: '', updated_at: '' },
  { id: 'adv-4', email: 'david.thompson@valeo.com', full_name: 'David Thompson', office: 'Richmond', team: 'Wealth Management', avatar_url: '', created_at: '', updated_at: '' },
  { id: 'adv-5', email: 'emily.johnson@valeo.com', full_name: 'Emily Johnson', office: 'Remote', team: 'Private Client', avatar_url: '', created_at: '', updated_at: '' },
  { id: 'adv-6', email: 'michael.wong@valeo.com', full_name: 'Michael Wong', office: 'Chicago', team: 'Family Office', avatar_url: '', created_at: '', updated_at: '' },
  { id: 'adv-7', email: 'rachel.kim@valeo.com', full_name: 'Rachel Kim', office: 'Denver', team: 'Wealth Management', avatar_url: '', created_at: '', updated_at: '' },
  { id: 'adv-8', email: 'alex.martinez@valeo.com', full_name: 'Alex Martinez', office: 'Indianapolis', team: 'Private Client', avatar_url: '', created_at: '', updated_at: '' },
  { id: 'adv-9', email: 'jennifer.lee@valeo.com', full_name: 'Jennifer Lee', office: 'Richmond', team: 'Wealth Management', avatar_url: '', created_at: '', updated_at: '' },
  { id: 'adv-10', email: 'robert.taylor@valeo.com', full_name: 'Robert Taylor', office: 'Remote', team: 'Family Office', avatar_url: '', created_at: '', updated_at: '' },
];

export const SEED_ADVISORS: AdvisorWithProfile[] = sampleProfiles.map((profile, index) => ({
  id: `advisor-${index + 1}`,
  user_id: profile.id,
  max_families: 40 + (index % 3) * 10,
  current_families: 20 + Math.floor(Math.random() * 25),
  target_segment: ['private_client', 'ultra_hnw', 'traditional'][index % 3] as any,
  availability_status: index < 8 ? 'available' : 'limited',
  predictive_index: {
    dominance: 40 + Math.floor(Math.random() * 40),
    influence: 30 + Math.floor(Math.random() * 50),
    steadiness: 35 + Math.floor(Math.random() * 45),
    conscientiousness: 45 + Math.floor(Math.random() * 40),
  },
  interest_areas: [
    ['Tax', 'Estate'][index % 2],
    ['Investments', 'Insurance', 'Business'][index % 3],
  ],
  growth_goals: [
    ['Alternative Investments', 'ESG Investing'][index % 2],
  ],
  years_experience: 5 + (index * 2) % 20,
  certifications: [
    ['CFP', 'CFA', 'ChFC', 'CLU', 'CPWA'][index % 5],
    index % 2 === 0 ? 'CPA' : '',
  ].filter(Boolean),
  created_at: '',
  updated_at: '',
  profile,
  skills: generateRandomSkills(`advisor-${index + 1}`),
  capacityPercentage: Math.round(((20 + Math.floor(Math.random() * 25)) / (40 + (index % 3) * 10)) * 100),
}));

function generateRandomSkills(advisorId: string) {
  return SEED_SUBTOPICS.map((subtopic) => ({
    id: `skill-${advisorId}-${subtopic.id}`,
    advisor_id: advisorId,
    subtopic_id: subtopic.id,
    skill_level: Math.floor(Math.random() * 6) + 4, // 4-9
    evidence: '',
    case_count: Math.floor(Math.random() * 50),
    last_assessed_at: new Date().toISOString(),
    created_at: '',
    updated_at: '',
  }));
}

// Sample Prospects
export const SEED_PROSPECTS: Client[] = [
  { id: 'prospect-1', name: 'Williams Family Trust', segment: 'ultra_hnw', complexity_tier: 'highly_complex', aum_band: '$10M-$25M', net_worth_band: '$25M-$50M', office: 'Chicago', constraints: {}, preferences: {}, notes: 'Multi-generational wealth, business sale pending', is_prospect: true, created_at: '', updated_at: '' },
  { id: 'prospect-2', name: 'Tech Founder - John S.', segment: 'private_client', complexity_tier: 'complex', aum_band: '$5M-$10M', net_worth_band: '$10M-$25M', office: 'Denver', constraints: {}, preferences: {}, notes: 'Concentrated stock position, pre-IPO company', is_prospect: true, created_at: '', updated_at: '' },
  { id: 'prospect-3', name: 'Healthcare Exec Couple', segment: 'private_client', complexity_tier: 'standard', aum_band: '$2M-$5M', net_worth_band: '$5M-$10M', office: 'Indianapolis', constraints: {}, preferences: {}, notes: 'Both working, approaching retirement', is_prospect: true, created_at: '', updated_at: '' },
  { id: 'prospect-4', name: 'Martinez Estate', segment: 'ultra_hnw', complexity_tier: 'highly_complex', aum_band: '$25M+', net_worth_band: '$50M+', office: 'Richmond', constraints: {}, preferences: {}, notes: 'International assets, multiple generations', is_prospect: true, created_at: '', updated_at: '' },
  { id: 'prospect-5', name: 'Retiree - Susan K.', segment: 'essentials', complexity_tier: 'standard', aum_band: '$1M-$2M', net_worth_band: '$2M-$5M', office: 'Remote', constraints: {}, preferences: {}, notes: 'Recent widow, needs comprehensive review', is_prospect: true, created_at: '', updated_at: '' },
  { id: 'prospect-6', name: 'Private Equity Partner', segment: 'ultra_hnw', complexity_tier: 'highly_complex', aum_band: '$10M-$25M', net_worth_band: '$25M-$50M', office: 'Chicago', constraints: {}, preferences: {}, notes: 'Complex compensation, carried interest', is_prospect: true, created_at: '', updated_at: '' },
  { id: 'prospect-7', name: 'Family Business - Lee Co.', segment: 'private_client', complexity_tier: 'complex', aum_band: '$5M-$10M', net_worth_band: '$10M-$25M', office: 'Denver', constraints: {}, preferences: {}, notes: 'Second-generation succession planning', is_prospect: true, created_at: '', updated_at: '' },
  { id: 'prospect-8', name: 'Dual Income Professionals', segment: 'traditional', complexity_tier: 'standard', aum_band: '$500K-$1M', net_worth_band: '$1M-$2M', office: 'Indianapolis', constraints: {}, preferences: {}, notes: 'Young family, stock options', is_prospect: true, created_at: '', updated_at: '' },
  { id: 'prospect-9', name: 'Nonprofit Executive', segment: 'traditional', complexity_tier: 'standard', aum_band: '$2M-$5M', net_worth_band: '$5M-$10M', office: 'Richmond', constraints: {}, preferences: {}, notes: 'Charitable giving focus, deferred comp', is_prospect: true, created_at: '', updated_at: '' },
  { id: 'prospect-10', name: 'Real Estate Developer', segment: 'ultra_hnw', complexity_tier: 'complex', aum_band: '$10M-$25M', net_worth_band: '$25M-$50M', office: 'Remote', constraints: {}, preferences: {}, notes: 'Multiple LLCs, 1031 exchange planning', is_prospect: true, created_at: '', updated_at: '' },
];

// Generate sample needs for prospects
export function generateSampleNeeds(prospectId: string): ClientNeed[] {
  const prospectIndex = SEED_PROSPECTS.findIndex((p) => p.id === prospectId);
  const prospect = SEED_PROSPECTS[prospectIndex];

  const needs: ClientNeed[] = [];
  const horizons: HorizonType[] = ['now', '1yr', '3yr', '5yr'];

  // Different need profiles based on complexity
  const subtopicsToInclude = prospect?.complexity_tier === 'highly_complex'
    ? SEED_SUBTOPICS.slice(0, 15)
    : prospect?.complexity_tier === 'complex'
    ? SEED_SUBTOPICS.slice(0, 10)
    : SEED_SUBTOPICS.slice(0, 6);

  subtopicsToInclude.forEach((subtopic, idx) => {
    needs.push({
      id: `need-${prospectId}-${subtopic.id}`,
      client_id: prospectId,
      subtopic_id: subtopic.id,
      importance: Math.min(10, Math.floor(Math.random() * 4) + 6),
      urgency: Math.min(10, Math.floor(Math.random() * 5) + 4),
      horizon: horizons[idx % 4],
      notes: '',
      created_at: '',
      updated_at: '',
      subtopic: subtopic as any,
    });
  });

  return needs;
}
