import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import CreateTrip from './pages/CreateTrip';
import TripPlanning from './pages/TripPlanning';
import Settings from './pages/Settings';
import ToastContainer from './components/UI/ToastContainer';
import { useToast } from './hooks/useToast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
    },
  },
});

function AppContent() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="trips" element={<Trips />} />
            <Route path="trips/new" element={<CreateTrip />} />
            <Route path="trips/:tripId/plan" element={<TripPlanning />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;