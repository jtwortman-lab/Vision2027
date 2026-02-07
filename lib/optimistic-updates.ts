import { useQueryClient } from '@tanstack/react-query';
import type { 
  Advisor, 
  AdvisorWithProfile, 
  Client, 
  ClientWithNeeds,
  AdvisorSkill,
  ClientNeed
} from '@/types/database';
import { showSuccess, showError } from './toasts';

// ============================================================================
// OPTIMISTIC UPDATE UTILITIES
// ============================================================================

/**
 * Generic optimistic update helper
 */
export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  const optimisticUpdate = async <TData, TVariables>({
    queryKey,
    mutationFn,
    updater,
    successMessage,
    errorMessage,
  }: {
    queryKey: string[];
    mutationFn: (variables: TVariables) => Promise<TData>;
    updater: (oldData: any, variables: TVariables) => any;
    successMessage?: string;
    errorMessage?: string;
  }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey });

    // Snapshot previous value
    const previousData = queryClient.getQueryData(queryKey);

    try {
      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => updater(old, undefined as any));

      // Perform the actual mutation
      const result = await mutationFn(undefined as any);

      // Show success message
      if (successMessage) {
        showSuccess(successMessage);
      }

      return result;
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(queryKey, previousData);

      // Show error message
      if (errorMessage) {
        showError(errorMessage);
      }

      throw error;
    } finally {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey });
    }
  };

  return { optimisticUpdate };
}

// ============================================================================
// ADVISOR OPTIMISTIC UPDATES
// ============================================================================

export function useAdvisorOptimisticUpdates() {
  const queryClient = useQueryClient();

  const updateAdvisorCapacity = async (
    advisorId: string,
    newCurrentFamilies: number
  ) => {
    const queryKey = ['advisor', advisorId];
    const previousData = queryClient.getQueryData<AdvisorWithProfile>(queryKey);

    try {
      // Optimistic update
      queryClient.setQueryData<AdvisorWithProfile>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          current_families: newCurrentFamilies,
          capacityPercentage: (newCurrentFamilies / old.max_families) * 100,
        };
      });

      // Also update in advisors list
      queryClient.setQueryData<AdvisorWithProfile[]>(['advisors'], (old) => {
        if (!old) return old;
        return old.map((advisor) =>
          advisor.id === advisorId
            ? {
                ...advisor,
                current_families: newCurrentFamilies,
                capacityPercentage: (newCurrentFamilies / advisor.max_families) * 100,
              }
            : advisor
        );
      });

      return previousData;
    } catch (error) {
      // Rollback
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }
      throw error;
    }
  };

  const addSkillOptimistically = async (
    advisorId: string,
    skill: Partial<AdvisorSkill>
  ) => {
    const queryKey = ['advisor', advisorId];
    const previousData = queryClient.getQueryData<AdvisorWithProfile>(queryKey);

    try {
      queryClient.setQueryData<AdvisorWithProfile>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          skills: [
            ...(old.skills || []),
            { ...skill, id: `temp-${Date.now()}` } as AdvisorSkill,
          ],
        };
      });

      return previousData;
    } catch (error) {
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }
      throw error;
    }
  };

  const updateSkillOptimistically = async (
    advisorId: string,
    skillId: string,
    updates: Partial<AdvisorSkill>
  ) => {
    const queryKey = ['advisor', advisorId];
    const previousData = queryClient.getQueryData<AdvisorWithProfile>(queryKey);

    try {
      queryClient.setQueryData<AdvisorWithProfile>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          skills: old.skills?.map((skill) =>
            skill.id === skillId ? { ...skill, ...updates } : skill
          ),
        };
      });

      return previousData;
    } catch (error) {
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }
      throw error;
    }
  };

  return {
    updateAdvisorCapacity,
    addSkillOptimistically,
    updateSkillOptimistically,
  };
}

// ============================================================================
// CLIENT OPTIMISTIC UPDATES
// ============================================================================

export function useClientOptimisticUpdates() {
  const queryClient = useQueryClient();

  const updateClientInfo = async (
    clientId: string,
    updates: Partial<Client>
  ) => {
    const queryKey = ['client', clientId];
    const previousData = queryClient.getQueryData<ClientWithNeeds>(queryKey);

    try {
      // Update single client
      queryClient.setQueryData<ClientWithNeeds>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, ...updates };
      });

      // Update in clients list
      queryClient.setQueryData<ClientWithNeeds[]>(['clients', false], (old) => {
        if (!old) return old;
        return old.map((client) =>
          client.id === clientId ? { ...client, ...updates } : client
        );
      });

      // Update in prospects list if needed
      queryClient.setQueryData<ClientWithNeeds[]>(['clients', true], (old) => {
        if (!old) return old;
        return old.map((client) =>
          client.id === clientId ? { ...client, ...updates } : client
        );
      });

      return previousData;
    } catch (error) {
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }
      throw error;
    }
  };

  const convertProspectToClient = async (clientId: string) => {
    const previousProspects = queryClient.getQueryData<ClientWithNeeds[]>(['clients', true]);
    const previousClients = queryClient.getQueryData<ClientWithNeeds[]>(['clients', false]);

    try {
      // Find the prospect
      const prospect = previousProspects?.find((p) => p.id === clientId);
      if (!prospect) return;

      // Remove from prospects
      queryClient.setQueryData<ClientWithNeeds[]>(['clients', true], (old) => {
        if (!old) return old;
        return old.filter((p) => p.id !== clientId);
      });

      // Add to clients
      queryClient.setQueryData<ClientWithNeeds[]>(['clients', false], (old) => {
        if (!old) return [{ ...prospect, is_prospect: false }];
        return [...old, { ...prospect, is_prospect: false }];
      });

      return { previousProspects, previousClients };
    } catch (error) {
      // Rollback
      if (previousProspects) {
        queryClient.setQueryData(['clients', true], previousProspects);
      }
      if (previousClients) {
        queryClient.setQueryData(['clients', false], previousClients);
      }
      throw error;
    }
  };

  const addNeedOptimistically = async (
    clientId: string,
    need: Partial<ClientNeed>
  ) => {
    const queryKey = ['client', clientId];
    const previousData = queryClient.getQueryData<ClientWithNeeds>(queryKey);

    try {
      queryClient.setQueryData<ClientWithNeeds>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          needs: [
            ...(old.needs || []),
            { ...need, id: `temp-${Date.now()}` } as ClientNeed,
          ],
        };
      });

      return previousData;
    } catch (error) {
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }
      throw error;
    }
  };

  const removeNeedOptimistically = async (clientId: string, needId: string) => {
    const queryKey = ['client', clientId];
    const previousData = queryClient.getQueryData<ClientWithNeeds>(queryKey);

    try {
      queryClient.setQueryData<ClientWithNeeds>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          needs: old.needs?.filter((need) => need.id !== needId),
        };
      });

      return previousData;
    } catch (error) {
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }
      throw error;
    }
  };

  return {
    updateClientInfo,
    convertProspectToClient,
    addNeedOptimistically,
    removeNeedOptimistically,
  };
}

// ============================================================================
// LIST OPERATIONS (Add/Remove items from lists)
// ============================================================================

export function useListOptimisticUpdates() {
  const queryClient = useQueryClient();

  const addToList = async <T extends { id: string }>(
    queryKey: string[],
    newItem: T
  ) => {
    const previousData = queryClient.getQueryData<T[]>(queryKey);

    try {
      queryClient.setQueryData<T[]>(queryKey, (old) => {
        if (!old) return [newItem];
        return [newItem, ...old];
      });

      return previousData;
    } catch (error) {
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }
      throw error;
    }
  };

  const removeFromList = async <T extends { id: string }>(
    queryKey: string[],
    itemId: string
  ) => {
    const previousData = queryClient.getQueryData<T[]>(queryKey);

    try {
      queryClient.setQueryData<T[]>(queryKey, (old) => {
        if (!old) return old;
        return old.filter((item) => item.id !== itemId);
      });

      return previousData;
    } catch (error) {
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }
      throw error;
    }
  };

  const updateInList = async <T extends { id: string }>(
    queryKey: string[],
    itemId: string,
    updates: Partial<T>
  ) => {
    const previousData = queryClient.getQueryData<T[]>(queryKey);

    try {
      queryClient.setQueryData<T[]>(queryKey, (old) => {
        if (!old) return old;
        return old.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        );
      });

      return previousData;
    } catch (error) {
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }
      throw error;
    }
  };

  return {
    addToList,
    removeFromList,
    updateInList,
  };
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export function useBatchOptimisticUpdates() {
  const queryClient = useQueryClient();

  const batchUpdate = async <T extends { id: string }>(
    queryKey: string[],
    updates: Array<{ id: string; data: Partial<T> }>
  ) => {
    const previousData = queryClient.getQueryData<T[]>(queryKey);

    try {
      queryClient.setQueryData<T[]>(queryKey, (old) => {
        if (!old) return old;
        
        const updateMap = new Map(updates.map((u) => [u.id, u.data]));
        
        return old.map((item) => {
          const update = updateMap.get(item.id);
          return update ? { ...item, ...update } : item;
        });
      });

      return previousData;
    } catch (error) {
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }
      throw error;
    }
  };

  return { batchUpdate };
}
