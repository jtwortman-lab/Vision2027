import { supabase } from '@/integrations/supabase/client';
import type { 
  Advisor, 
  AdvisorSkill, 
  Client, 
  ClientNeed, 
  Assignment,
  MatchResult,
  Domain,
  Subtopic
} from '@/types/database';

// ============================================================================
// BASE API CLASS
// ============================================================================

class BaseAPI {
  protected handleError(error: any): never {
    console.error('API Error:', error);
    throw new Error(error.message || 'An unexpected error occurred');
  }

  protected async execute<T>(fn: () => Promise<{ data: T | null; error: any }>): Promise<T> {
    const { data, error } = await fn();
    if (error) this.handleError(error);
    if (!data) throw new Error('No data returned');
    return data;
  }
}

// ============================================================================
// ADVISOR API
// ============================================================================

class AdvisorAPI extends BaseAPI {
  async getAll() {
    return this.execute(() =>
      supabase
        .from('advisors')
        .select(`
          *,
          profile:profiles(*),
          skills:advisor_skills(
            *,
            subtopic:subtopics(*, domain:domains(*))
          )
        `)
        .order('created_at', { ascending: false })
    );
  }

  async getById(id: string) {
    return this.execute(() =>
      supabase
        .from('advisors')
        .select(`
          *,
          profile:profiles(*),
          skills:advisor_skills(
            *,
            subtopic:subtopics(*, domain:domains(*))
          )
        `)
        .eq('id', id)
        .single()
    );
  }

  async create(advisor: Partial<Advisor>) {
    return this.execute(() =>
      supabase
        .from('advisors')
        .insert(advisor)
        .select()
        .single()
    );
  }

  async update(id: string, updates: Partial<Advisor>) {
    return this.execute(() =>
      supabase
        .from('advisors')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  }

  async updateSkills(advisorId: string, skills: Partial<AdvisorSkill>[]) {
    // Delete existing skills
    await supabase.from('advisor_skills').delete().eq('advisor_id', advisorId);

    // Insert new skills
    return this.execute(() =>
      supabase
        .from('advisor_skills')
        .insert(skills.map(skill => ({ ...skill, advisor_id: advisorId })))
        .select()
    );
  }

  async updateCapacity(advisorId: string, currentFamilies: number) {
    return this.execute(() =>
      supabase
        .from('advisors')
        .update({ current_families: currentFamilies })
        .eq('id', advisorId)
        .select()
        .single()
    );
  }
}

// ============================================================================
// CLIENT API
// ============================================================================

class ClientAPI extends BaseAPI {
  async getAll(isProspect = false) {
    return this.execute(() =>
      supabase
        .from('clients')
        .select(`
          *,
          needs:client_needs(
            *,
            subtopic:subtopics(*, domain:domains(*))
          )
        `)
        .eq('is_prospect', isProspect)
        .order('created_at', { ascending: false })
    );
  }

  async getById(id: string) {
    return this.execute(() =>
      supabase
        .from('clients')
        .select(`
          *,
          needs:client_needs(
            *,
            subtopic:subtopics(*, domain:domains(*))
          )
        `)
        .eq('id', id)
        .single()
    );
  }

  async create(client: Partial<Client>) {
    return this.execute(() =>
      supabase
        .from('clients')
        .insert(client)
        .select()
        .single()
    );
  }

  async update(id: string, updates: Partial<Client>) {
    return this.execute(() =>
      supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  }

  async updateNeeds(clientId: string, needs: Partial<ClientNeed>[]) {
    // Delete existing needs
    await supabase.from('client_needs').delete().eq('client_id', clientId);

    // Insert new needs
    return this.execute(() =>
      supabase
        .from('client_needs')
        .insert(needs.map(need => ({ ...need, client_id: clientId })))
        .select()
    );
  }

  async convertToClient(prospectId: string) {
    return this.execute(() =>
      supabase
        .from('clients')
        .update({ is_prospect: false })
        .eq('id', prospectId)
        .select()
        .single()
    );
  }
}

// ============================================================================
// ASSIGNMENT API
// ============================================================================

class AssignmentAPI extends BaseAPI {
  async create(assignment: Partial<Assignment>) {
    return this.execute(() =>
      supabase
        .from('assignments')
        .insert(assignment)
        .select()
        .single()
    );
  }

  async update(id: string, updates: Partial<Assignment>) {
    return this.execute(() =>
      supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  }

  async getByClient(clientId: string) {
    return this.execute(() =>
      supabase
        .from('assignments')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    );
  }

  async getByAdvisor(advisorId: string) {
    return this.execute(() =>
      supabase
        .from('assignments')
        .select('*, client:clients(*)')
        .or(`lead_advisor_id.eq.${advisorId},backup_advisor_id.eq.${advisorId},support_advisor_id.eq.${advisorId}`)
        .order('created_at', { ascending: false })
    );
  }
}

// ============================================================================
// TAXONOMY API
// ============================================================================

class TaxonomyAPI extends BaseAPI {
  async getDomains() {
    return this.execute(() =>
      supabase
        .from('domains')
        .select('*, subtopics:subtopics(*)')
        .eq('is_active', true)
        .order('display_order')
    );
  }

  async getSubtopics(domainId?: string) {
    let query = supabase
      .from('subtopics')
      .select('*, domain:domains(*)')
      .eq('is_active', true)
      .order('display_order');

    if (domainId) {
      query = query.eq('domain_id', domainId);
    }

    return this.execute(() => query);
  }

  async createDomain(domain: Partial<Domain>) {
    return this.execute(() =>
      supabase
        .from('domains')
        .insert(domain)
        .select()
        .single()
    );
  }

  async createSubtopic(subtopic: Partial<Subtopic>) {
    return this.execute(() =>
      supabase
        .from('subtopics')
        .insert(subtopic)
        .select()
        .single()
    );
  }

  async updateDomain(id: string, updates: Partial<Domain>) {
    return this.execute(() =>
      supabase
        .from('domains')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  }

  async updateSubtopic(id: string, updates: Partial<Subtopic>) {
    return this.execute(() =>
      supabase
        .from('subtopics')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    );
  }
}

// ============================================================================
// MATCH API
// ============================================================================

class MatchAPI extends BaseAPI {
  async createMatchRun(clientId: string, results: Partial<MatchResult>[]) {
    // Create match run first
    const matchRun = await this.execute(() =>
      supabase
        .from('match_runs')
        .insert({ client_id: clientId })
        .select()
        .single()
    );

    // Create match results
    const matchResults = await this.execute(() =>
      supabase
        .from('match_results')
        .insert(results.map(r => ({ ...r, match_run_id: matchRun.id })))
        .select()
    );

    return { matchRun, matchResults };
  }

  async getMatchResults(matchRunId: string) {
    return this.execute(() =>
      supabase
        .from('match_results')
        .select('*, advisor:advisors(*, profile:profiles(*))')
        .eq('match_run_id', matchRunId)
        .order('score', { ascending: false })
    );
  }

  async getLatestMatchForClient(clientId: string) {
    const matchRun = await this.execute(() =>
      supabase
        .from('match_runs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    );

    return this.getMatchResults(matchRun.id);
  }
}

// ============================================================================
// ANALYTICS API
// ============================================================================

class AnalyticsAPI extends BaseAPI {
  async getTeamMetrics() {
    // Get overall team statistics
    const advisors = await supabase
      .from('advisors')
      .select('max_families, current_families');

    const clients = await supabase
      .from('clients')
      .select('id, is_prospect');

    const assignments = await supabase
      .from('assignments')
      .select('id, created_at');

    return {
      advisors: advisors.data || [],
      clients: clients.data || [],
      assignments: assignments.data || [],
    };
  }

  async getAdvisorMetrics(advisorId: string) {
    const advisor = await supabase
      .from('advisors')
      .select(`
        *,
        skills:advisor_skills(*)
      `)
      .eq('id', advisorId)
      .single();

    const assignments = await supabase
      .from('assignments')
      .select('*, client:clients(*)')
      .or(`lead_advisor_id.eq.${advisorId},backup_advisor_id.eq.${advisorId},support_advisor_id.eq.${advisorId}`);

    return {
      advisor: advisor.data,
      assignments: assignments.data || [],
    };
  }
}

// ============================================================================
// AUDIT API
// ============================================================================

class AuditAPI extends BaseAPI {
  async logAction(action: {
    user_id: string;
    action_type: string;
    entity_type: string;
    entity_id: string;
    details?: any;
  }) {
    return this.execute(() =>
      supabase
        .from('audit_log')
        .insert(action)
        .select()
        .single()
    );
  }

  async getRecentActions(limit = 50) {
    return this.execute(() =>
      supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
    );
  }

  async getActionsByUser(userId: string, limit = 50) {
    return this.execute(() =>
      supabase
        .from('audit_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
    );
  }
}

// ============================================================================
// EXPORT API INSTANCES
// ============================================================================

export const api = {
  advisors: new AdvisorAPI(),
  clients: new ClientAPI(),
  assignments: new AssignmentAPI(),
  taxonomy: new TaxonomyAPI(),
  matches: new MatchAPI(),
  analytics: new AnalyticsAPI(),
  audit: new AuditAPI(),
};

// Export types for convenience
export type API = typeof api;
