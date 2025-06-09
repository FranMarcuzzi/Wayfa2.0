import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Trip } from '../types';
import { useAuth } from './useAuth';

export const useTrips = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all trips for the current user
  const {
    data: trips = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['trips', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      try {
        // Obtener viajes donde el usuario es owner
        const { data: ownedTrips, error: ownedError } = await supabase
          .from('trips')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (ownedError) {
          console.error('❌ Error fetching owned trips:', ownedError);
          throw ownedError;
        }

        // Intentar obtener viajes donde es participante
        let participantTrips: Trip[] = [];
        try {
          const { data: participantData, error: participantError } = await supabase
            .from('trip_participants')
            .select('trip_id')
            .eq('user_id', user.id);

          if (!participantError && participantData && participantData.length > 0) {
            const tripIds = participantData.map(p => p.trip_id);
            const { data: trips, error: tripsError } = await supabase
              .from('trips')
              .select('*')
              .in('id', tripIds)
              .neq('owner_id', user.id) // Excluir los que ya tenemos como owner
              .order('created_at', { ascending: false });

            if (!tripsError && trips) {
              participantTrips = trips;
            }
          }
        } catch (participantError) {
          console.warn('⚠️ Could not fetch participant trips:', participantError);
        }

        // Combinar todos los viajes
        const allTrips = [...(ownedTrips || []), ...participantTrips];
        return allTrips;

      } catch (error) {
        console.error('❌ Error in useTrips:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 2,
    staleTime: 5000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Create trip mutation
  const createTripMutation = useMutation({
    mutationFn: async (tripData: Omit<Trip, 'id' | 'created_at' | 'updated_at' | 'participants'>) => {
      // Crear el viaje
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
        .single();

      if (tripError) {
        throw new Error(`Failed to create trip: ${tripError.message}`);
      }

      // Agregar el creador como organizador
      const { error: participantError } = await supabase
        .from('trip_participants')
        .insert([{
          trip_id: trip.id,
          user_id: tripData.owner_id,
          role: 'organizer',
        }]);

      if (participantError) {
        console.warn('⚠️ Trip created but could not add participant:', participantError);
      }

      return trip;
    },
    onSuccess: (data) => {
      // Invalidar y refrescar inmediatamente
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip-stats'] });
      queryClient.invalidateQueries({ queryKey: ['trip-participants', data.id] });
      
      // Forzar refetch inmediato
      queryClient.refetchQueries({ queryKey: ['trips', user?.id] });
    },
    onError: (error) => {
      console.error('❌ Trip creation failed:', error);
    },
  });

  // Update trip mutation
  const updateTripMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Trip> & { id: string }) => {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip-stats'] });
    },
  });

  // Delete trip mutation - ARREGLADO
  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: string) => {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) {
        throw new Error(`Failed to delete trip: ${error.message}`);
      }

      return tripId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip-stats'] });
    },
    onError: (error) => {
      console.error('❌ Trip deletion failed:', error);
    },
  });

  return {
    trips,
    isLoading,
    error,
    createTrip: createTripMutation.mutate,
    updateTrip: updateTripMutation.mutate,
    deleteTrip: deleteTripMutation.mutateAsync, // CAMBIADO A mutateAsync para mejor manejo de errores
    isCreating: createTripMutation.isPending,
    isUpdating: updateTripMutation.isPending,
    isDeleting: deleteTripMutation.isPending,
  };
};

// Hook for getting trip statistics
export const useTripStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trip-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          totalTrips: 0,
          activeTrips: 0,
          totalParticipants: 0,
          totalExpenses: 0,
        };
      }

      try {
        // Obtener viajes donde el usuario es owner
        const { data: ownedTrips, error: ownedError } = await supabase
          .from('trips')
          .select('id, status')
          .eq('owner_id', user.id);

        if (ownedError) {
          throw ownedError;
        }

        // Obtener viajes donde el usuario es participante
        const { data: participantData, error: participantError } = await supabase
          .from('trip_participants')
          .select('trip_id')
          .eq('user_id', user.id);

        if (participantError) {
          console.error('❌ Error fetching participant data for stats:', participantError);
        }

        // Combinar IDs de viajes
        const ownedTripIds = ownedTrips?.map(t => t.id) || [];
        const participantTripIds = participantData?.map(p => p.trip_id) || [];
        const allTripIds = [...new Set([...ownedTripIds, ...participantTripIds])];

        if (allTripIds.length === 0) {
          return {
            totalTrips: 0,
            activeTrips: 0,
            totalParticipants: 0,
            totalExpenses: 0,
          };
        }

        // Obtener estados de viajes para contar activos
        const { data: allTripsData, error: allTripsError } = await supabase
          .from('trips')
          .select('status')
          .in('id', allTripIds);

        if (allTripsError) {
          console.error('❌ Error fetching all trips data:', allTripsError);
        }

        // Obtener total de participantes
        const { data: participantsData, error: participantsError } = await supabase
          .from('trip_participants')
          .select('id')
          .in('trip_id', allTripIds);

        if (participantsError) {
          console.error('❌ Error fetching participants data:', participantsError);
        }

        // Obtener total de gastos
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('amount')
          .in('trip_id', allTripIds);

        if (expensesError) {
          console.error('❌ Error fetching expenses data:', expensesError);
        }

        const totalExpenses = expensesData?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
        const activeTrips = allTripsData?.filter(t => t.status === 'active').length || 0;

        const stats = {
          totalTrips: allTripIds.length,
          activeTrips,
          totalParticipants: participantsData?.length || 0,
          totalExpenses,
        };

        return stats;
      } catch (error) {
        console.error('❌ Error in useTripStats:', error);
        return {
          totalTrips: 0,
          activeTrips: 0,
          totalParticipants: 0,
          totalExpenses: 0,
        };
      }
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 30000,
  });
};