import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTrips, useTripStats } from '../hooks/useTrips';
import DashboardStats from '../components/Dashboard/DashboardStats';
import RecentActivity from '../components/Dashboard/RecentActivity';
import TripCard from '../components/Trips/TripCard';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { trips, isLoading: tripsLoading, error: tripsError } = useTrips();
  const { data: stats, isLoading: statsLoading, error: statsError } = useTripStats();

  // Get recent trips (last 4)
  const recentTrips = trips?.slice(0, 4) || [];

  // Mock recent activities for now - in a real app, this would come from a notifications/activity feed
  const recentActivities = [
    {
      id: '1',
      type: 'trip_created' as const,
      title: 'New Trip Created',
      description: 'A new trip was created',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'expense_added' as const,
      title: 'Expense Added',
      description: 'A new expense was recorded',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
  ];

  // Show error state if there are errors
  if (tripsError || statsError) {
    console.error('Dashboard errors:', { tripsError, statsError });
  }

  if (tripsLoading || statsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24"></div>
            ))}
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64"></div>
                ))}
              </div>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  const userName = user?.full_name || user?.email?.split('@')[0] || 'Traveler';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            {t('dashboard.welcomeBack', { name: userName })}
          </h1>
          <p className="text-text-secondary dark:text-gray-400 mt-2">
            {t('dashboard.subtitle')}
          </p>
        </div>
        
        <Link
          to="/trips/new"
          className="bg-primary hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>{t('dashboard.newTrip')}</span>
        </Link>
      </div>

      {/* Stats */}
      <DashboardStats 
        totalTrips={stats?.totalTrips || 0}
        activeTrips={stats?.activeTrips || 0}
        totalParticipants={stats?.totalParticipants || 0}
        totalExpenses={stats?.totalExpenses || 0}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Trips */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary dark:text-white">{t('dashboard.recentTrips')}</h2>
            <Link
              to="/trips"
              className="text-primary hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors flex items-center space-x-1"
            >
              <span>{t('dashboard.viewAll')}</span>
              <TrendingUp className="h-4 w-4" />
            </Link>
          </div>

          {recentTrips.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-8 text-center">
              <div className="text-text-secondary dark:text-gray-400 mb-4">
                <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">{t('dashboard.noTripsYet')}</p>
                <p className="text-sm">{t('dashboard.noTripsSubtitle')}</p>
              </div>
              <Link
                to="/trips/new"
                className="inline-flex items-center space-x-2 bg-primary hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>{t('dashboard.createTrip')}</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div>
          <RecentActivity activities={recentActivities} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;