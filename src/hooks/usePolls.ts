import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Poll, PollOption, Vote } from '../types';
import { useAuth } from './useAuth';

export const usePolls = (tripId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch polls for a trip
  const {
    data: polls = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['polls', tripId],
    queryFn: async () => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from('polls')
        .select(`
          *,
          creator:created_by(id, email, full_name, avatar_url),
          poll_options(*),
          votes(
            id,
            option_id,
            user_id,
            created_at,
            users(id, email, full_name)
          )
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((poll: any) => ({
        ...poll,
        creator: poll.creator,
        options: poll.poll_options,
        user_votes: poll.votes.filter((vote: any) => vote.user_id === user?.id),
      }));
    },
    enabled: !!tripId,
  });

  // Create poll mutation
  const createPollMutation = useMutation({
    mutationFn: async (pollData: {
      question: string;
      description?: string;
      multiple_choice: boolean;
      closes_at?: string;
      options: string[];
    }) => {
      if (!user || !tripId) throw new Error('Missing required data');

      // Create poll
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert([{
          trip_id: tripId,
          question: pollData.question,
          description: pollData.description,
          multiple_choice: pollData.multiple_choice,
          closes_at: pollData.closes_at,
          created_by: user.id,
        }])
        .select()
        .single();

      if (pollError) throw pollError;

      // Create poll options
      const optionsData = pollData.options.map(text => ({
        poll_id: poll.id,
        text,
      }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(optionsData);

      if (optionsError) throw optionsError;

      return poll;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls', tripId] });
    },
  });

  // Vote on poll mutation
  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionIds }: { pollId: string; optionIds: string[] }) => {
      if (!user) throw new Error('User not authenticated');

      // Remove existing votes for this poll if not multiple choice
      const poll = polls.find(p => p.id === pollId);
      if (!poll?.multiple_choice) {
        await supabase
          .from('votes')
          .delete()
          .eq('poll_id', pollId)
          .eq('user_id', user.id);
      }

      // Add new votes
      const votesData = optionIds.map(optionId => ({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id,
      }));

      const { error } = await supabase
        .from('votes')
        .insert(votesData);

      if (error) throw error;

      // Update vote counts
      for (const optionId of optionIds) {
        const { error: updateError } = await supabase.rpc('increment_poll_votes', {
          option_id: optionId
        });
        if (updateError) console.error('Error updating vote count:', updateError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls', tripId] });
    },
  });

  // Delete poll mutation
  const deletePollMutation = useMutation({
    mutationFn: async (pollId: string) => {
      const { error } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls', tripId] });
    },
  });

  // Close poll mutation
  const closePollMutation = useMutation({
    mutationFn: async (pollId: string) => {
      const { error } = await supabase
        .from('polls')
        .update({ closed: true })
        .eq('id', pollId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls', tripId] });
    },
  });

  return {
    polls,
    isLoading,
    error,
    createPoll: createPollMutation.mutate,
    vote: voteMutation.mutate,
    deletePoll: deletePollMutation.mutate,
    closePoll: closePollMutation.mutate,
    isCreating: createPollMutation.isPending,
    isVoting: voteMutation.isPending,
    isDeleting: deletePollMutation.isPending,
  };
};