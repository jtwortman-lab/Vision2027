export type AppRole = 'admin' | 'manager' | 'advisor' | 'recruiter';
export type SegmentType = 'essentials' | 'traditional' | 'private_client' | 'ultra_hnw';
export type ComplexityTier = 'standard' | 'complex' | 'highly_complex';
export type HorizonType = 'now' | '1yr' | '3yr' | '5yr';
export type AssignmentRole = 'lead' | 'backup' | 'support';

// Helper to format segment for display
export const formatSegment = (segment: SegmentType): string => {
  const labels: Record<SegmentType, string> = {
    essentials: 'Essentials',
    traditional: 'Traditional',
    private_client: 'Private Client',
    ultra_hnw: 'Ultra HNW',
  };
  return labels[segment] || segment;
};

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  office?: string;
  team?: string;
  created_at: string;
  updated_at: string;
}

export interface Advisor {
  id: string;
  user_id: string;
  max_families: number;
  current_families: number;
  target_segment: SegmentType;
  availability_status: string;
  predictive_index: Record<string, number>;
  interest_areas: string[];
  growth_goals: string[];
  years_experience: number;
  certifications: string[];
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Domain {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Subtopic {
  id: string;
  domain_id: string;
  name: string;
  description?: string;
  default_weight: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  domain?: Domain;
}

export interface AdvisorSkill {
  id: string;
  advisor_id: string;
  subtopic_id: string;
  skill_level: number;
  evidence?: string;
  case_count: number;
  last_assessed_at: string;
  created_at: string;
  updated_at: string;
  subtopic?: Subtopic;
}

export interface Client {
  id: string;
  name: string;
  segment: SegmentType;
  complexity_tier: ComplexityTier;
  aum_band?: string;
  net_worth_band?: string;
  office?: string;
  city?: string;
  state?: string;
  valeo_client_since?: string;
  my_client_since?: string;
  client_since?: string; // Legacy, use valeo_client_since and my_client_since
  backup_advisor?: string;
  support_advisor?: string;
  originator?: string;
  constraints: Record<string, unknown>;
  preferences: Record<string, unknown>;
  notes?: string;
  is_prospect: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientNeed {
  id: string;
  client_id: string;
  subtopic_id: string;
  importance: number;
  urgency: number;
  horizon: HorizonType;
  notes?: string;
  created_at: string;
  updated_at: string;
  subtopic?: Subtopic;
}

export interface MatchResult {
  id: string;
  match_run_id: string;
  advisor_id: string;
  role: AssignmentRole;
  score: number;
  explanation: {
    top_drivers: string[];
    gaps: string[];
    why_not?: string[];
  };
  created_at: string;
  advisor?: Advisor;
}

export interface Assignment {
  id: string;
  client_id: string;
  lead_advisor_id?: string;
  backup_advisor_id?: string;
  support_advisor_id?: string;
  approved_by?: string;
  override_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Extended types for UI
export interface AdvisorWithProfile extends Advisor {
  profile: Profile;
  skills?: AdvisorSkill[];
  capacityPercentage: number;
}

export interface DomainWithSubtopics extends Domain {
  subtopics: Subtopic[];
}

export interface ClientWithNeeds extends Client {
  needs: ClientNeed[];
}
