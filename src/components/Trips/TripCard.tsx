import React from 'react';
import { Link } from 'react-router-dom';
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
  const { user } = useAuth();
  
  // Check if current user is the owner
  const isOwner = trip.owner_id === user?.id;
  
  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = new Date(trip.start_date) > new Date();
  const daysUntil = isUpcoming 
    ? formatDistanceToNow(new Date(trip.start_date), { addSuffix: true })
    : format(new Date(trip.start_date), 'MMM dd, yyyy');

  return (
    <div className="bg-white rounded-xl shadow-apple hover:shadow-apple-lg transition-all duration-200 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
              {trip.title}
            </h3>
            <div className="flex items-center space-x-1 mt-1">
              <MapPin className="h-4 w-4 text-text-secondary" />
              <span className="text-text-secondary text-sm">{trip.destination}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </span>
            
            {/* Only show delete menu if user is owner and callback is provided */}
            {isOwner && onDelete && (
              <div className="relative group/menu">
                <button className="p-1 rounded-full hover:bg-secondary transition-colors">
                  <MoreVertical className="h-4 w-4 text-text-secondary" />
                </button>
                
                <div className="absolute right-0 top-8 w-32 bg-white rounded-lg shadow-apple-lg border border-gray-100 py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => onDelete(trip)}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {trip.description && (
          <p className="text-text-secondary text-sm mb-4 line-clamp-2">
            {trip.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
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

        <div className="flex space-x-2">
          <Link
            to={`/trips/${trip.id}/plan`}
            className="flex-1 bg-primary hover:bg-red-600 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Plan Trip</span>
          </Link>
          <Link
            to={`/trips/${trip.id}/plan`}
            className="bg-secondary hover:bg-gray-200 text-text-primary py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TripCard;