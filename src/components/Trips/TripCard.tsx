import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  MoreVertical,
  Trash2,
  Settings,
  Eye
} from 'lucide-react';
import { Trip } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface TripCardProps {
  trip: Trip;
  onDelete?: (trip: Trip) => void;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onDelete }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Check if current user is the owner
  const isOwner = trip.owner_id === user?.id;
  
  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400';
    }
  };

  const isUpcoming = new Date(trip.start_date) > new Date();
  const daysUntil = isUpcoming 
    ? formatDistanceToNow(new Date(trip.start_date), { addSuffix: true })
    : format(new Date(trip.start_date), 'MMM dd, yyyy');

  const handlePlanTripClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isNavigating) return;
    
    try {
      setIsNavigating(true);
      navigate(`/trips/${trip.id}/plan`);
    } catch (error) {
      console.error('❌ Navigation error:', error);
      window.location.href = `/trips/${trip.id}/plan`;
    } finally {
      setTimeout(() => setIsNavigating(false), 1000);
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/trips/${trip.id}/plan`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(trip);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 hover:shadow-apple-lg dark:hover:shadow-gray-900/30 transition-all duration-200 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary dark:text-white group-hover:text-primary dark:group-hover:text-red-400 transition-colors">
              {trip.title}
            </h3>
            <div className="flex items-center space-x-1 mt-1">
              <MapPin className="h-4 w-4 text-text-secondary dark:text-gray-400" />
              <span className="text-text-secondary dark:text-gray-400 text-sm">{trip.destination}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
              {t(`trips.status.${trip.status}`)}
            </span>
            
            {/* Only show delete menu if user is owner and callback is provided */}
            {isOwner && onDelete && (
              <div className="relative group/menu">
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-full hover:bg-secondary dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-text-secondary dark:text-gray-400" />
                </button>
                
                <div className="absolute right-0 top-8 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-apple-lg dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-700 py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-10">
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{t('common.delete')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {trip.description && (
          <p className="text-text-secondary dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {trip.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-text-secondary dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{daysUntil}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{trip.participants?.length || 0}</span>
            </div>
            
            {trip.budget && (
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>{trip.budget.toLocaleString()} {trip.currency}</span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handlePlanTripClick}
            disabled={isNavigating}
            className="flex-1 bg-primary hover:bg-red-600 disabled:bg-red-400 text-white text-center py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
          >
            {isNavigating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{t('common.loading')}</span>
              </>
            ) : (
              <>
                <Settings className="h-4 w-4" />
                <span>{t('trips.planTrip')}</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleViewClick}
            className="bg-secondary dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-text-primary dark:text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
            title={t('trips.viewTrip')}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCard;