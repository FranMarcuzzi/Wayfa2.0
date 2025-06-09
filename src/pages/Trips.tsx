import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import TripCard from '../components/Trips/TripCard';
import { Trip } from '../types';

const Trips: React.FC = () => {
  const { user } = useAuth();
  const { trips, isLoading, deleteTrip, isDeleting } = useTrips();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (trip: Trip) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${trip.title}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteTrip(trip.id);
        success('Trip Deleted', `"${trip.title}" has been deleted successfully`);
      } catch (err: any) {
        error('Delete Failed', err.message || 'Failed to delete trip');
      }
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    queryClient.refetchQueries({ queryKey: ['trips', user?.id] });
    success('Refreshed', 'Trip list has been updated');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">My Trips</h1>
          <p className="text-text-secondary dark:text-gray-400 mt-2">
            Manage all your travel adventures
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-secondary dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-text-primary dark:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <Link
            to="/trips/new"
            className="bg-primary hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Trip</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 appearance-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading overlay for deletion */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-text-primary dark:text-white font-medium">Deleting trip...</span>
          </div>
        </div>
      )}

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-12 text-center">
          <Plus className="h-16 w-16 text-text-secondary dark:text-gray-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-text-primary dark:text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No trips found' : 'No trips yet'}
          </h3>
          <p className="text-text-secondary dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first trip to get started'
            }
          </p>
          <Link
            to="/trips/new"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Create Trip</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard 
              key={trip.id} 
              trip={trip} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Trips;