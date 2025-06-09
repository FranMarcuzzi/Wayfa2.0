import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Message } from '../types';
import { useAuth } from './useAuth';
import { useEffect } from 'react';

export const useChat = (tripId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch messages for a trip
  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['messages', tripId],
    queryFn: async () => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          user:user_id(id, email, full_name, avatar_url),
          reply_message:reply_to(
            id,
            content,
            user_id,
            user:user_id(id, email, full_name)
          )
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as (Message & { user: any; reply_message?: any })[];
    },
    enabled: !!tripId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel(`messages:${tripId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          // Invalidate and refetch messages when changes occur
          queryClient.invalidateQueries({ queryKey: ['messages', tripId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      content: string;
      message_type?: 'text' | 'image' | 'system';
      reply_to?: string;
    }) => {
      if (!user || !tripId) throw new Error('Missing required data');

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          trip_id: tripId,
          user_id: user.id,
          content: messageData.content,
          message_type: messageData.message_type || 'text',
          reply_to: messageData.reply_to || null,
        }])
        .select(`
          *,
          user:user_id(id, email, full_name, avatar_url),
          reply_message:reply_to(
            id,
            content,
            user_id,
            user:user_id(id, email, full_name)
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', tripId] });
    },
  });

  // Edit message mutation
  const editMessageMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ content })
        .eq('id', id)
        .select(`
          *,
          user:user_id(id, email, full_name, avatar_url),
          reply_message:reply_to(
            id,
            content,
            user_id,
            user:user_id(id, email, full_name)
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', tripId] });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', tripId] });
    },
  });

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutate,
    editMessage: editMessageMutation.mutate,
    deleteMessage: deleteMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    isEditing: editMessageMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
  };
};