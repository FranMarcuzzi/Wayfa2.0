import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ItineraryItem } from '../types';
import { useAuth } from './useAuth';

export const useActivities = (tripId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch activities for a specific trip
  const {
    data: activities = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['activities', tripId],
    queryFn: async () => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from('itinerary')
        .select(`
          *,
          creator:created_by(id, email, full_name, avatar_url)
        `)
        .eq('trip_id', tripId)
        .order('date', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;

      return data.map((item: any) => ({
        ...item,
        creator: item.creator,
      }));
    },
    enabled: !!tripId,
  });

  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: async (activityData: Omit<ItineraryItem, 'id' | 'created_at' | 'updated_at' | 'creator'>) => {
      const { data, error } = await supabase
        .from('itinerary')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] });
    },
  });

  // Update activity mutation
  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ItineraryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('itinerary')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] });
    },
  });

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: async (activityId: string) => {
      const { error } = await supabase
        .from('itinerary')
        .delete()
        .eq('id', activityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', tripId] });
    },
  });

  return {
    activities,
    isLoading,
    error,
    createActivity: createActivityMutation.mutate,
    updateActivity: updateActivityMutation.mutate,
    deleteActivity: deleteActivityMutation.mutate,
    isCreating: createActivityMutation.isPending,
    isUpdating: updateActivityMutation.isPending,
    isDeleting: deleteActivityMutation.isPending,
  };
};