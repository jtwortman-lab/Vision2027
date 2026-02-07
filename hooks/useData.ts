import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  Advisor, 
  AdvisorWithProfile, 
  Client, 
  ClientWithNeeds,
  AdvisorSkill,
  ClientNeed,
  Domain,
  DomainWithSubtopics,
  Subtopic
} from '@/types/database';

// ============================================================================
// ADVISORS
// ============================================================================

export function useAdvisors(options?: UseQueryOptions<AdvisorWithProfile[]>) {
  return useQuery({
    queryKey: ['advisors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisors')
        .select(`
          *,
          profile:profiles(*),
          skills:advisor_skills(
            *,
            subtopic:subtopics(
              *,
              domain:domains(*)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(advisor => ({
        ...advisor,
        profile: advisor.profile!,
        skills: advisor.skills || [],
        capacityPercentage: (advisor.current_families / advisor.max_families) * 100,
      })) as AdvisorWithProfile[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useAdvisor(advisorId: string | undefined, options?: UseQueryOptions<AdvisorWithProfile>) {
  return useQuery({
    queryKey: ['advisor', advisorId],
    queryFn: async () => {
      if (!advisorId) throw new Error('Advisor ID is required');

      const { data, error } = await supabase
        .from('advisors')
        .select(`
          *,
          profile:profiles(*),
          skills:advisor_skills(
            *,
            subtopic:subtopics(
              *,
              domain:domains(*)
            )
          )
        `)
        .eq('id', advisorId)
        .single();

      if (error) throw error;

      return {
        ...data,
        profile: data.profile!,
        skills: data.skills || [],
        capacityPercentage: (data.current_families / data.max_families) * 100,
      } as AdvisorWithProfile;
    },
    enabled: !!advisorId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUpdateAdvisorSkills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      advisorId, 
      skills 
    }: { 
      advisorId: string; 
      skills: Partial<AdvisorSkill>[] 
    }) => {
      // Delete existing skills
      await supabase
        .from('advisor_skills')
        .delete()
        .eq('advisor_id', advisorId);

      // Insert new skills
      const { data, error } = await supabase
        .from('advisor_skills')
        .insert(skills.map(skill => ({
          ...skill,
          advisor_id: advisorId,
        })))
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advisor', variables.advisorId] });
      queryClient.invalidateQueries({ queryKey: ['advisors'] });
    },
  });
}

// ============================================================================
// CLIENTS
// ============================================================================

export function useClients(isProspect = false, options?: UseQueryOptions<ClientWithNeeds[]>) {
  return useQuery({
    queryKey: ['clients', isProspect],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          needs:client_needs(
            *,
            subtopic:subtopics(
              *,
              domain:domains(*)
            )
          )
        `)
        .eq('is_prospect', isProspect)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(client => ({
        ...client,
        needs: client.needs || [],
      })) as ClientWithNeeds[];
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useClient(clientId: string | undefined, options?: UseQueryOptions<ClientWithNeeds>) {
  return useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID is required');

      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          needs:client_needs(
            *,
            subtopic:subtopics(
              *,
              domain:domains(*)
            )
          )
        `)
        .eq('id', clientId)
        .single();

      if (error) throw error;

      return {
        ...data,
        needs: data.needs || [],
      } as ClientWithNeeds;
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client: Partial<Client>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      clientId, 
      updates 
    }: { 
      clientId: string; 
      updates: Partial<Client> 
    }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClientNeeds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      clientId, 
      needs 
    }: { 
      clientId: string; 
      needs: Partial<ClientNeed>[] 
    }) => {
      // Delete existing needs
      await supabase
        .from('client_needs')
        .delete()
        .eq('client_id', clientId);

      // Insert new needs
      const { data, error } = await supabase
        .from('client_needs')
        .insert(needs.map(need => ({
          ...need,
          client_id: clientId,
        })))
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// ============================================================================
// TAXONOMY (Domains & Subtopics)
// ============================================================================

export function useDomains(options?: UseQueryOptions<DomainWithSubtopics[]>) {
  return useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('domains')
        .select(`
          *,
          subtopics:subtopics(*)
        `)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      return data.map(domain => ({
        ...domain,
        subtopics: (domain.subtopics || [])
          .filter((s: Subtopic) => s.is_active)
          .sort((a: Subtopic, b: Subtopic) => a.display_order - b.display_order),
      })) as DomainWithSubtopics[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - taxonomy doesn't change often
    ...options,
  });
}

export function useSubtopics(domainId?: string, options?: UseQueryOptions<Subtopic[]>) {
  return useQuery({
    queryKey: ['subtopics', domainId],
    queryFn: async () => {
      let query = supabase
        .from('subtopics')
        .select('*, domain:domains(*)')
        .eq('is_active', true)
        .order('display_order');

      if (domainId) {
        query = query.eq('domain_id', domainId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Subtopic[];
    },
    staleTime: 30 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to check if user has sufficient capacity
 */
export function useAdvisorCapacity(advisorId: string | undefined) {
  const { data: advisor } = useAdvisor(advisorId);
  
  const hasCapacity = advisor 
    ? advisor.current_families < advisor.max_families 
    : false;
    
  const remainingCapacity = advisor 
    ? advisor.max_families - advisor.current_families 
    : 0;
    
  const utilizationPercent = advisor?.capacityPercentage ?? 0;

  return {
    hasCapacity,
    remainingCapacity,
    utilizationPercent,
    isNearCapacity: utilizationPercent >= 80,
    isAtCapacity: utilizationPercent >= 100,
  };
}

/**
 * Hook for optimistic updates with rollback
 */
export function useOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  {
    queryKey,
    updater,
  }: {
    queryKey: string[];
    updater: (old: any, variables: TVariables) => any;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => updater(old, variables));

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
