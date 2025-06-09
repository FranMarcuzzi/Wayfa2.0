import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Expense, ExpenseSplit } from '../types';
import { useAuth } from './useAuth';

export const useExpenses = (tripId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch expenses for a specific trip
  const {
    data: expenses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: async () => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          payer:paid_by(id, email, full_name, avatar_url),
          creator:created_by(id, email, full_name, avatar_url),
          expense_splits(
            id,
            user_id,
            amount,
            paid,
            created_at,
            users(id, email, full_name, avatar_url)
          )
        `)
        .eq('trip_id', tripId)
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map((expense: any) => ({
        ...expense,
        payer: expense.payer,
        creator: expense.creator,
        splits: expense.expense_splits.map((split: any) => ({
          id: split.id,
          expense_id: expense.id,
          user_id: split.user_id,
          amount: split.amount,
          paid: split.paid,
          created_at: split.created_at,
          user: split.users,
        })),
      }));
    },
    enabled: !!tripId,
  });

  // Create expense mutation
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: {
      expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'payer' | 'creator' | 'splits'>;
      splits: Omit<ExpenseSplit, 'id' | 'expense_id' | 'created_at' | 'user'>[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: expense, error: expenseError } = await supabase
        .from('expenses')
        .insert([{
          ...expenseData.expense,
          created_by: user.id,
        }])
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create expense splits
      if (expenseData.splits.length > 0) {
        const splitsWithExpenseId = expenseData.splits.map(split => ({
          ...split,
          expense_id: expense.id,
        }));

        const { error: splitsError } = await supabase
          .from('expense_splits')
          .insert(splitsWithExpenseId);

        if (splitsError) throw splitsError;
      }

      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-stats'] });
    },
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-stats'] });
    },
  });

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-stats'] });
    },
  });

  // Mark split as paid mutation
  const markSplitPaidMutation = useMutation({
    mutationFn: async ({ splitId, paid }: { splitId: string; paid: boolean }) => {
      const { error } = await supabase
        .from('expense_splits')
        .update({ paid })
        .eq('id', splitId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
    },
  });

  return {
    expenses,
    isLoading,
    error,
    createExpense: createExpenseMutation.mutate,
    updateExpense: updateExpenseMutation.mutate,
    deleteExpense: deleteExpenseMutation.mutate,
    markSplitPaid: markSplitPaidMutation.mutate,
    isCreating: createExpenseMutation.isPending,
    isUpdating: updateExpenseMutation.isPending,
    isDeleting: deleteExpenseMutation.isPending,
  };
};