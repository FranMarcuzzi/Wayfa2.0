import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  BarChart3,
  Clock
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'trip_created' | 'expense_added' | 'user_joined' | 'poll_created';
  title: string;
  description: string;
  timestamp: string;
  tripName?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'trip_created':
        return Calendar;
      case 'expense_added':
        return DollarSign;
      case 'user_joined':
        return Users;
      case 'poll_created':
        return BarChart3;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'trip_created':
        return 'text-blue-600 bg-blue-50';
      case 'expense_added':
        return 'text-green-600 bg-green-50';
      case 'user_joined':
        return 'text-purple-600 bg-purple-50';
      case 'poll_created':
        return 'text-primary bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-apple p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-apple p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const colorClasses = getActivityColor(activity.type);
          
          return (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${colorClasses}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium">{activity.title}</p>
                <p className="text-text-secondary text-sm">{activity.description}</p>
                {activity.tripName && (
                  <p className="text-text-secondary text-xs mt-1">
                    Trip: {activity.tripName}
                  </p>
                )}
                <p className="text-text-secondary text-xs mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;