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
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'expense_added':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'user_joined':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'poll_created':
        return 'text-primary dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-6">
        <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-text-secondary dark:text-gray-400 mx-auto mb-4" />
          <p className="text-text-secondary dark:text-gray-400">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-6">
      <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-6">Recent Activity</h3>
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
                <p className="text-text-primary dark:text-white font-medium">{activity.title}</p>
                <p className="text-text-secondary dark:text-gray-400 text-sm">{activity.description}</p>
                {activity.tripName && (
                  <p className="text-text-secondary dark:text-gray-400 text-xs mt-1">
                    Trip: {activity.tripName}
                  </p>
                )}
                <p className="text-text-secondary dark:text-gray-400 text-xs mt-1">
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