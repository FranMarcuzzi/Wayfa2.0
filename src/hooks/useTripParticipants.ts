import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { TripParticipant } from '../types';
import { useAuth } from './useAuth';

export const useTripParticipants = (tripId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch participants for a trip
  const {
    data: participants = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['trip-participants', tripId],
    queryFn: async () => {
      if (!tripId) return [];

      console.log('🔍 Fetching participants for trip:', tripId);

      const { data, error } = await supabase
        .from('trip_participants')
        .select(`
          *,
          user:user_id(
            id, 
            email, 
            full_name, 
            avatar_url
          )
        `)
        .eq('trip_id', tripId)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching participants:', error);
        throw error;
      }

      console.log('✅ Participants fetched:', data?.length || 0, data);
      return data as (TripParticipant & { user: any })[];
    },
    enabled: !!tripId,
    retry: 2,
    staleTime: 30000, // 30 seconds
  });

  // Remove participant mutation
  const removeParticipantMutation = useMutation({
    mutationFn: async (participantId: string) => {
      console.log('🗑️ Removing participant:', participantId);

      const { error } = await supabase
        .from('trip_participants')
        .delete()
        .eq('id', participantId);

      if (error) {
        console.error('❌ Error removing participant:', error);
        throw error;
      }

      console.log('✅ Participant removed successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-participants', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (error) => {
      console.error('❌ Remove participant failed:', error);
    },
  });

  // Update participant role mutation
  const updateParticipantRoleMutation = useMutation({
    mutationFn: async ({ participantId, role }: { participantId: string; role: 'organizer' | 'participant' | 'guest' }) => {
      console.log('📝 Updating participant role:', participantId, role);

      const { error } = await supabase
        .from('trip_participants')
        .update({ role })
        .eq('id', participantId);

      if (error) {
        console.error('❌ Error updating participant role:', error);
        throw error;
      }

      console.log('✅ Participant role updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-participants', tripId] });
    },
    onError: (error) => {
      console.error('❌ Update participant role failed:', error);
    },
  });

  return {
    participants,
    isLoading,
    error,
    removeParticipant: removeParticipantMutation.mutate,
    updateParticipantRole: updateParticipantRoleMutation.mutate,
    isRemoving: removeParticipantMutation.isPending,
    isUpdating: updateParticipantRoleMutation.isPending,
  };
};