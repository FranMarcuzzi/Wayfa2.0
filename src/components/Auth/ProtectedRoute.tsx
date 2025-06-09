import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, supabaseUser, loading } = useAuth();
  const location = useLocation();

  // Show loading for maximum 3 seconds
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary font-medium">Loading TripPlanner...</p>
          <p className="text-text-secondary text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // If we have a Supabase user but no profile, allow access
  if (supabaseUser && !user) {
    return <>{children}</>;
  }

  // If no user at all, redirect to login
  if (!user && !supabaseUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;