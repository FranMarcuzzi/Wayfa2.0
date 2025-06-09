import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Invitation } from '../types';
import { useAuth } from './useAuth';

export const useInvitations = (tripId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch invitations for a trip
  const {
    data: invitations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['invitations', tripId],
    queryFn: async () => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          trip:trip_id(id, title, destination),
          inviter:invited_by(id, email, full_name)
        `)
        .eq('trip_id', tripId)
        .is('accepted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        throw error;
      }
      return data as (Invitation & { trip: any; inviter: any })[];
    },
    enabled: !!tripId,
  });

  // Fetch user's pending invitations
  const {
    data: userInvitations = [],
    isLoading: isLoadingUserInvitations,
  } = useQuery({
    queryKey: ['user-invitations', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];

      console.log('🔍 Fetching invitations for email:', user.email);

      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
          trip:trip_id(id, title, destination, start_date, end_date),
          inviter:invited_by(id, email, full_name)
        `)
        .eq('email', user.email)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user invitations:', error);
        throw error;
      }

      console.log('📧 Found invitations:', data?.length || 0);
      return data as (Invitation & { trip: any; inviter: any })[];
    },
    enabled: !!user?.email,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async (invitationData: {
      trip_id: string;
      email: string;
      role: 'participant' | 'guest';
    }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('📤 Creating invitation:', invitationData);

      // Check if email is already a participant
      const { data: existingParticipant, error: participantError } = await supabase
        .from('trip_participants')
        .select(`
          id,
          users!inner(email)
        `)
        .eq('trip_id', invitationData.trip_id)
        .eq('users.email', invitationData.email)
        .single();

      if (participantError && participantError.code !== 'PGRST116') {
        console.error('❌ Error checking existing participant:', participantError);
        throw participantError;
      }

      if (existingParticipant) {
        throw new Error('User is already a participant in this trip');
      }

      // Check if there's already a pending invitation
      const { data: existingInvitation, error: invitationError } = await supabase
        .from('invitations')
        .select('id')
        .eq('trip_id', invitationData.trip_id)
        .eq('email', invitationData.email)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (invitationError && invitationError.code !== 'PGRST116') {
        console.error('❌ Error checking existing invitation:', invitationError);
        throw invitationError;
      }

      if (existingInvitation) {
        throw new Error('User already has a pending invitation');
      }

      // Create the invitation
      const { data, error } = await supabase
        .from('invitations')
        .insert([{
          ...invitationData,
          invited_by: user.id,
        }])
        .select(`
          *,
          trip:trip_id(id, title, destination),
          inviter:invited_by(id, email, full_name)
        `)
        .single();

      if (error) {
        console.error('❌ Error creating invitation:', error);
        throw error;
      }

      console.log('✅ Invitation created successfully:', data);

      // Try to create a notification if the user exists
      const { data: invitedUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', invitationData.email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('❌ Error finding invited user:', userError);
      }

      if (invitedUser) {
        console.log('📬 Creating notification for existing user:', invitedUser.id);
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: invitedUser.id,
            title: 'Trip Invitation',
            message: `You've been invited to join "${data.trip?.title}"`,
            type: 'trip_invite',
            trip_id: invitationData.trip_id,
          }]);

        if (notificationError) {
          console.error('❌ Error creating notification:', notificationError);
        }
      } else {
        console.log('👤 User does not exist yet, invitation will be auto-accepted when they sign up');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-participants', tripId] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });

  // Accept invitation mutation
  const acceptInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      if (!user) throw new Error('User not authenticated');

      console.log('✅ Accepting invitation:', invitationId);

      const { data: invitation, error: fetchError } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('email', user.email)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching invitation:', fetchError);
        throw fetchError;
      }
      if (!invitation) throw new Error('Invitation not found');

      // Check if invitation is still valid
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
      }

      if (invitation.accepted_at) {
        throw new Error('Invitation already accepted');
      }

      // Mark invitation as accepted (trigger will handle adding to participants)
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitationId);

      if (updateError) {
        console.error('❌ Error accepting invitation:', updateError);
        throw updateError;
      }

      console.log('✅ Invitation accepted successfully');
      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['trip-participants'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  // Delete invitation mutation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', tripId] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
    },
  });

  return {
    invitations,
    userInvitations,
    isLoading,
    isLoadingUserInvitations,
    error,
    refetch,
    createInvitation: createInvitationMutation.mutate,
    acceptInvitation: acceptInvitationMutation.mutate,
    deleteInvitation: deleteInvitationMutation.mutate,
    isCreating: createInvitationMutation.isPending,
    isAccepting: acceptInvitationMutation.isPending,
    isDeleting: deleteInvitationMutation.isPending,
  };
};