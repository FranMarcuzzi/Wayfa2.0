import React from 'react';
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
  const stats = [
    {
      title: 'Total Trips',
      value: totalTrips,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Trips',
      value: activeTrips,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Trip Members',
      value: totalParticipants,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-apple p-6 hover:shadow-apple-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
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