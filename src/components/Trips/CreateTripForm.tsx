import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calendar, MapPin, DollarSign, FileText, X } from 'lucide-react';
import { useTrips } from '../../hooks/useTrips';
import { useAuth } from '../../hooks/useAuth';

interface TripFormData {
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number | null;
  currency: string;
}

interface CreateTripFormProps {
  onClose?: () => void;
}

const CreateTripForm: React.FC<CreateTripFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { createTrip, isCreating } = useTrips();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TripFormData>({
    defaultValues: {
      currency: 'USD',
      budget: null,
      description: '',
    },
  });

  const startDate = watch('start_date');

  const onSubmit = async (data: TripFormData) => {
    if (!user) {
      setError('You must be logged in to create a trip');
      return;
    }

    console.log('📝 Form submitted with data:', data);

    try {
      setError('');
      
      const tripData = {
        title: data.title,
        description: data.description || null,
        destination: data.destination,
        start_date: data.start_date,
        end_date: data.end_date,
        budget: data.budget || null,
        currency: data.currency,
        owner_id: user.id,
        status: 'planning' as const,
      };

      console.log('🚀 Creating trip with data:', tripData);

      createTrip(tripData, {
        onSuccess: (createdTrip) => {
          console.log('✅ Trip created successfully:', createdTrip);
          
          if (onClose) {
            onClose();
          } else {
            // Navigate to the trips list to see the new trip
            navigate('/trips');
          }
        },
        onError: (error: any) => {
          console.error('❌ Error creating trip:', error);
          setError(error?.message || 'Failed to create trip. Please try again.');
        },
      });
    } catch (err) {
      console.error('❌ Error creating trip:', err);
      setError('Failed to create trip. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-apple p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Create New Trip</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
            Trip Title *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input
              {...register('title', { required: 'Trip title is required' })}
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              placeholder="Enter trip title"
            />
          </div>
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            placeholder="Describe your trip..."
          />
        </div>

        {/* Destination */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-text-primary mb-2">
            Destination *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input
              {...register('destination', { required: 'Destination is required' })}
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              placeholder="Where are you going?"
            />
          </div>
          {errors.destination && (
            <p className="text-red-600 text-sm mt-1">{errors.destination.message}</p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-text-primary mb-2">
              Start Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input
                {...register('start_date', { required: 'Start date is required' })}
                type="date"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>
            {errors.start_date && (
              <p className="text-red-600 text-sm mt-1">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-text-primary mb-2">
              End Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input
                {...register('end_date', { 
                  required: 'End date is required',
                  validate: (value) => {
                    if (startDate && value < startDate) {
                      return 'End date must be after start date';
                    }
                    return true;
                  }
                })}
                type="date"
                min={startDate}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
            </div>
            {errors.end_date && (
              <p className="text-red-600 text-sm mt-1">{errors.end_date.message}</p>
            )}
          </div>
        </div>

        {/* Budget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="budget" className="block text-sm font-medium text-text-primary mb-2">
              Budget (Optional)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input
                {...register('budget', { 
                  valueAsNumber: true,
                  min: { value: 0, message: 'Budget must be positive' }
                })}
                type="number"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="0.00"
              />
            </div>
            {errors.budget && (
              <p className="text-red-600 text-sm mt-1">{errors.budget.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-text-primary mb-2">
              Currency
            </label>
            <select
              {...register('currency')}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 text-text-primary rounded-lg hover:bg-secondary transition-colors duration-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isCreating}
            className="px-6 py-3 bg-primary hover:bg-red-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isCreating && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isCreating ? 'Creating...' : 'Create Trip'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTripForm;