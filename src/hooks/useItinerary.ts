import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ItineraryItem } from '../types';
import { useAuth } from './useAuth';

export const useItinerary = (tripId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch itinerary items for a trip
  const {
    data: itineraryItems = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['itinerary', tripId],
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
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as (ItineraryItem & { creator: any })[];
    },
    enabled: !!tripId,
  });

  // Create itinerary item mutation
  const createItineraryItemMutation = useMutation({
    mutationFn: async (itemData: Omit<ItineraryItem, 'id' | 'created_at' | 'updated_at' | 'creator'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('itinerary')
        .insert([{
          ...itemData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
    },
  });

  // Update itinerary item mutation
  const updateItineraryItemMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
    },
  });

  // Delete itinerary item mutation
  const deleteItineraryItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('itinerary')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
    },
  });

  return {
    itineraryItems,
    isLoading,
    error,
    createItineraryItem: createItineraryItemMutation.mutate,
    updateItineraryItem: updateItineraryItemMutation.mutate,
    deleteItineraryItem: deleteItineraryItemMutation.mutate,
    isCreating: createItineraryItemMutation.isPending,
    isUpdating: updateItineraryItemMutation.isPending,
    isDeleting: deleteItineraryItemMutation.isPending,
  };
};