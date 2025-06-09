import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Memory } from '../types';
import { useAuth } from './useAuth';

export const useMemories = (tripId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch memories for a trip
  const {
    data: memories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['memories', tripId],
    queryFn: async () => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from('memories')
        .select(`
          *,
          user:user_id(id, email, full_name, avatar_url)
        `)
        .eq('trip_id', tripId)
        .order('taken_at', { ascending: false });

      if (error) throw error;
      return data as (Memory & { user: any })[];
    },
    enabled: !!tripId,
  });

  // Create memory mutation
  const createMemoryMutation = useMutation({
    mutationFn: async (memoryData: {
      image: File;
      title?: string;
      description?: string;
      location?: string;
      taken_at?: string;
    }) => {
      if (!user || !tripId) throw new Error('Missing required data');

      // Validate file
      if (!memoryData.image.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }
      if (memoryData.image.size > 10 * 1024 * 1024) {
        throw new Error('Image size must be less than 10MB');
      }

      // Upload to Supabase Storage
      const fileExt = memoryData.image.name.split('.').pop();
      const fileName = `memories/${user.id}/${tripId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-images')
        .upload(fileName, memoryData.image);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('trip-images')
        .getPublicUrl(fileName);

      // Create memory record
      const { data, error } = await supabase
        .from('memories')
        .insert([{
          trip_id: tripId,
          user_id: user.id,
          title: memoryData.title || null,
          description: memoryData.description || null,
          location: memoryData.location || null,
          image_url: publicUrl,
          taken_at: memoryData.taken_at || new Date().toISOString(),
        }])
        .select(`
          *,
          user:user_id(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', tripId] });
    },
  });

  // Update memory mutation
  const updateMemoryMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Memory> & { id: string }) => {
      const { data, error } = await supabase
        .from('memories')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          user:user_id(id, email, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', tripId] });
    },
  });

  // Delete memory mutation
  const deleteMemoryMutation = useMutation({
    mutationFn: async (memoryId: string) => {
      // First get the memory to delete the image from storage
      const { data: memory, error: fetchError } = await supabase
        .from('memories')
        .select('image_url')
        .eq('id', memoryId)
        .single();

      if (fetchError) throw fetchError;

      // Extract file path from URL and delete from storage
      if (memory.image_url) {
        const urlParts = memory.image_url.split('/');
        const fileName = urlParts.slice(-4).join('/'); // Get the path after the bucket name
        
        await supabase.storage
          .from('trip-images')
          .remove([fileName]);
      }

      // Delete memory record
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', tripId] });
    },
  });

  return {
    memories,
    isLoading,
    error,
    createMemory: createMemoryMutation.mutate,
    updateMemory: updateMemoryMutation.mutate,
    deleteMemory: deleteMemoryMutation.mutate,
    isCreating: createMemoryMutation.isPending,
    isUpdating: updateMemoryMutation.isPending,
    isDeleting: deleteMemoryMutation.isPending,
  };
};