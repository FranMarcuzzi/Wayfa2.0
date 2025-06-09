import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';

interface StatsProps {
  totalTrips: number;
  activeTrips: number;
  totalParticipants: number;
  totalExpenses: number;
}

const DashboardStats: React.FC<StatsProps> = ({
  totalTrips,
  activeTrips,
  totalParticipants,
  totalExpenses,
}) => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('dashboard.stats.totalTrips'),
      value: totalTrips,
      icon: MapPin,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: t('dashboard.stats.activeTrips'),
      value: activeTrips,
      icon: Calendar,
      color: 'text-primary dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: t('dashboard.stats.tripMembers'),
      value: totalParticipants,
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: t('dashboard.stats.totalExpenses'),
      value: `$${totalExpenses.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-6 hover:shadow-apple-lg dark:hover:shadow-gray-900/30 transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary dark:text-gray-400 text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-text-primary dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;