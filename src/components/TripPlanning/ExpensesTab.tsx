import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Plus, 
  DollarSign, 
  Receipt, 
  Edit3, 
  Trash2,
  User,
  Check,
  X,
  CreditCard
} from 'lucide-react';
import { useExpenses } from '../../hooks/useExpenses';
import { useTripParticipants } from '../../hooks/useTripParticipants';
import { Expense } from '../../types';

interface ExpensesTabProps {
  tripId: string;
  isOwner: boolean;
  canEdit: boolean;
}

const ExpensesTab: React.FC<ExpensesTabProps> = ({ tripId, isOwner, canEdit }) => {
  const { expenses, createExpense, deleteExpense, markSplitPaid, isCreating } = useExpenses(tripId);
  const { participants } = useTripParticipants(tripId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'other' as Expense['category'],
    paid_by: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    splits: [] as { user_id: string; amount: number }[],
  });

  const categories = [
    { value: 'accommodation', label: 'Accommodation', color: 'bg-green-50 text-green-600' },
    { value: 'transport', label: 'Transport', color: 'bg-blue-50 text-blue-600' },
    { value: 'food', label: 'Food & Dining', color: 'bg-yellow-50 text-yellow-600' },
    { value: 'activities', label: 'Activities', color: 'bg-purple-50 text-purple-600' },
    { value: 'shopping', label: 'Shopping', color: 'bg-pink-50 text-pink-600' },
    { value: 'other', label: 'Other', color: 'bg-gray-50 text-gray-600' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.paid_by) return;

    const amount = parseFloat(formData.amount);
    const splitAmount = amount / participants.length;

    const expenseData = {
      expense: {
        trip_id: tripId,
        title: formData.title,
        amount,
        category: formData.category,
        paid_by: formData.paid_by,
        date: formData.date,
        currency: 'USD',
      },
      splits: participants.map(participant => ({
        user_id: participant.user_id,
        amount: splitAmount,
        paid: participant.user_id === formData.paid_by,
      })),
    };

    try {
      createExpense(expenseData);
      resetForm();
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: 'other',
      paid_by: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      splits: [],
    });
    setShowAddModal(false);
  };

  const handleDelete = (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpense(expenseId);
    }
  };

  const toggleSplitPaid = (splitId: string, currentPaid: boolean) => {
    markSplitPaid({ splitId, paid: !currentPaid });
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const getCategoryInfo = (category: string) => categories.find(c => c.value === category) || categories[categories.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">Trip Expenses</h3>
          <p className="text-text-secondary">Track and split expenses with your group</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-apple p-6">
        <h4 className="text-lg font-semibold text-text-primary mb-4">Expense Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-secondary rounded-lg">
            <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">${totalExpenses.toFixed(2)}</p>
            <p className="text-text-secondary text-sm">Total Spent</p>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <Receipt className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">{expenses.length}</p>
            <p className="text-text-secondary text-sm">Expenses</p>
          </div>
          <div className="text-center p-4 bg-secondary rounded-lg">
            <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-text-primary">${(totalExpenses / participants.length).toFixed(2)}</p>
            <p className="text-text-secondary text-sm">Per Person</p>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-apple p-8 text-center">
          <Receipt className="h-12 w-12 text-text-secondary mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-medium text-text-primary mb-2">No expenses yet</h4>
          <p className="text-text-secondary mb-4">Start tracking your trip expenses to split costs with your group</p>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add First Expense
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => {
            const categoryInfo = getCategoryInfo(expense.category);
            return (
              <div key={expense.id} className="bg-white rounded-xl shadow-apple p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${categoryInfo.color}`}>
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-text-primary">{expense.title}</h5>
                      <p className="text-text-secondary text-sm">
                        Paid by {expense.payer?.full_name || expense.payer?.email} • {format(parseISO(expense.date), 'MMM dd, yyyy')}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-text-primary">${Number(expense.amount).toFixed(2)}</p>
                    {canEdit && (
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-500 hover:text-red-700 mt-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Splits */}
                <div className="border-t border-gray-100 pt-4">
                  <h6 className="text-sm font-medium text-text-primary mb-3">Split Details</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {expense.splits?.map((split) => (
                      <div key={split.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {split.user?.full_name?.charAt(0) || split.user?.email?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {split.user?.full_name || split.user?.email}
                            </p>
                            <p className="text-xs text-text-secondary">${Number(split.amount).toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => toggleSplitPaid(split.id, split.paid)}
                          className={`p-1 rounded-full transition-colors ${
                            split.paid 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {split.paid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Add New Expense</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Expense Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="What was this expense for?"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Expense['category'] })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Paid By *
                  </label>
                  <select
                    value={formData.paid_by}
                    onChange={(e) => setFormData({ ...formData, paid_by: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select person</option>
                    {participants.map(participant => (
                      <option key={participant.user_id} value={participant.user_id}>
                        {participant.user?.full_name || participant.user?.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-200 text-text-primary rounded-lg hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;