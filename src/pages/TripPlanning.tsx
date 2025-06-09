import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Plus,
  Edit3,
  Camera,
  Heart,
  Share2,
  Settings,
  ChevronLeft,
  Plane,
  Hotel,
  Utensils,
  Activity,
  Upload,
  Mail,
  UserPlus,
  X,
  Trash2,
  Crown,
  User,
  BarChart3,
  Car,
  Coffee,
  ShoppingBag,
  Music,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useInvitations } from '../hooks/useInvitations';
import { useTripParticipants } from '../hooks/useTripParticipants';
import ItineraryTab from '../components/TripPlanning/ItineraryTab';
import ExpensesTab from '../components/TripPlanning/ExpensesTab';
import PollsTab from '../components/TripPlanning/PollsTab';
import { Trip } from '../types';
import { format, differenceInDays } from 'date-fns';

const TripPlanning: React.FC = () => {
  const { tripId } = useParams();
  const { user } = useAuth();
  const { success, error, warning, info } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'participant' | 'guest'>('participant');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');

  // Hooks
  const { invitations, createInvitation, deleteInvitation, isCreating } = useInvitations(tripId);
  const { participants, removeParticipant, updateParticipantRole } = useTripParticipants(tripId);

  // Fetch trip data
  const { data: trip, isLoading: tripLoading, error: tripError } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      if (!tripId) throw new Error('No trip ID provided');

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          owner:owner_id(id, email, full_name, avatar_url)
        `)
        .eq('id', tripId)
        .single();

      if (error) throw error;
      return data as Trip & { owner: any };
    },
    enabled: !!tripId,
  });

  // Fetch itinerary for overview filtering
  const { data: itineraryItems = [] } = useQuery({
    queryKey: ['itinerary', tripId],
    queryFn: async () => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from('itinerary')
        .select('*')
        .eq('trip_id', tripId)
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!tripId,
  });

  // Update trip status mutation
  const updateTripStatusMutation = useMutation({
    mutationFn: async (newStatus: Trip['status']) => {
      if (!tripId) throw new Error('No trip ID');

      const { data, error } = await supabase
        .from('trips')
        .update({ status: newStatus })
        .eq('id', tripId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setShowStatusModal(false);
      success('Status Updated', `Trip status changed to ${data.status}`);
    },
    onError: (err: any) => {
      error('Update Failed', err.message || 'Failed to update trip status');
    },
  });

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!tripId || !user) throw new Error('Missing required data');

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${tripId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('trip-images')
        .getPublicUrl(fileName);

      // Update trip with new cover image
      const { error: updateError } = await supabase
        .from('trips')
        .update({ cover_image: publicUrl })
        .eq('id', tripId);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowPhotoUpload(false);
      success('Photo Updated', 'Cover photo uploaded successfully');
    },
    onError: (err: any) => {
      error('Upload Failed', err.message || 'Failed to upload photo');
    },
  });

  // Check if user has access to this trip
  const hasAccess = trip && (
    trip.owner_id === user?.id || 
    participants.some(p => p.user_id === user?.id)
  );

  const isOwner = trip && trip.owner_id === user?.id;
  const userParticipant = participants.find(p => p.user_id === user?.id);
  
  // Permisos más granulares
  const canEdit = isOwner || userParticipant?.role === 'organizer' || userParticipant?.role === 'participant';
  const canInvite = isOwner || userParticipant?.role === 'organizer';
  const canManagePhoto = isOwner;
  const canChangeStatus = isOwner;

  const handleInviteUser = async () => {
    if (!tripId || !inviteEmail.trim()) return;

    try {
      await createInvitation({
        trip_id: tripId,
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      setInviteEmail('');
      setShowInviteModal(false);
      success('Invitation Sent', `Invitation sent to ${inviteEmail.trim()}`);
    } catch (err: any) {
      error('Invitation Failed', err.message || 'Failed to send invitation');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      await uploadPhotoMutation.mutateAsync(file);
    } catch (err: any) {
      error('Upload Failed', err.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleStatusChange = (newStatus: Trip['status']) => {
    updateTripStatusMutation.mutate(newStatus);
  };

  const handleDeleteInvitation = async (invitationId: string, email: string) => {
    try {
      await deleteInvitation(invitationId);
      warning('Invitation Cancelled', `Invitation to ${email} has been cancelled`);
    } catch (err: any) {
      error('Delete Failed', err.message || 'Failed to cancel invitation');
    }
  };

  const handleRemoveParticipant = async (participantId: string, userName: string) => {
    try {
      await removeParticipant(participantId);
      info('Participant Removed', `${userName} has been removed from the trip`);
    } catch (err: any) {
      error('Remove Failed', err.message || 'Failed to remove participant');
    }
  };

  if (tripLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-primary dark:text-white font-medium">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (tripError || !trip) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-4">Trip Not Found</h2>
          <p className="text-text-secondary dark:text-gray-400 mb-6">The trip you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/trips" className="bg-primary hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors">
            Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/trips" replace />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'polls', label: 'Polls', icon: BarChart3 },
    { id: 'participants', label: 'People', icon: Users }
  ];

  const quickActions = [
    { icon: Plane, label: 'Flights', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', filter: 'transport' },
    { icon: Hotel, label: 'Hotels', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400', filter: 'accommodation' },
    { icon: Utensils, label: 'Dining', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400', filter: 'meal' },
    { icon: Activity, label: 'Activities', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400', filter: 'activity' }
  ];

  const tripDuration = differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1;
  const defaultCoverImage = "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=1200";

  // Filter itinerary items for overview
  const filteredItineraryItems = activityFilter === 'all' 
    ? itineraryItems 
    : itineraryItems.filter(item => item.type === activityFilter);

  // Get activity type icons
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transport': return Plane;
      case 'accommodation': return Hotel;
      case 'meal': return Utensils;
      case 'activity': return Activity;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'transport': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'accommodation': return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'meal': return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      case 'activity': return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      default: return 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  // Status options with icons and colors
  const statusOptions = [
    { 
      value: 'planning', 
      label: 'Planning', 
      icon: Edit3, 
      color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400',
      description: 'Trip is being planned'
    },
    { 
      value: 'active', 
      label: 'Active', 
      icon: PlayCircle, 
      color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400',
      description: 'Trip is currently happening'
    },
    { 
      value: 'completed', 
      label: 'Completed', 
      icon: CheckCircle, 
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400',
      description: 'Trip has been completed'
    },
    { 
      value: 'cancelled', 
      label: 'Cancelled', 
      icon: XCircle, 
      color: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400',
      description: 'Trip has been cancelled'
    }
  ];

  const getStatusInfo = (status: Trip['status']) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/trips" 
                className="p-2 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-text-secondary dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-text-primary dark:text-white">{trip.title}</h1>
                <p className="text-sm text-text-secondary dark:text-gray-400">{trip.destination}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Heart className="h-5 w-5 text-text-secondary dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Share2 className="h-5 w-5 text-text-secondary dark:text-gray-400" />
              </button>
              {canChangeStatus && (
                <button 
                  onClick={() => setShowStatusModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-primary hover:bg-red-600 text-white rounded-lg transition-colors"
                  title="Change trip status"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">Status</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-primary to-red-600">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-blend-overlay"
          style={{ backgroundImage: `url(${trip.cover_image || defaultCoverImage})` }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
          <div className="text-white">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(trip.status).color} bg-white bg-opacity-90`}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </div>
              <span className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                {tripDuration} days
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-2">{trip.title}</h2>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(trip.start_date), 'MMM dd')} - {format(new Date(trip.end_date), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{participants.length} travelers</span>
              </div>
              {trip.budget && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span>${trip.budget.toLocaleString()} budget</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photo Upload Button */}
        {canManagePhoto && (
          <button 
            onClick={() => setShowPhotoUpload(true)}
            disabled={isUploadingPhoto}
            className="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-lg hover:bg-opacity-30 transition-all disabled:opacity-50"
          >
            {isUploadingPhoto ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <Camera className="h-5 w-5 text-white" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              // Ocultar tab de people para participants
              if (tab.id === 'participants' && userParticipant?.role === 'participant') {
                return null;
              }
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary dark:text-red-400'
                      : 'border-transparent text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-6">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => setActivityFilter(action.filter)}
                        className={`flex flex-col items-center p-4 rounded-lg hover:bg-secondary dark:hover:bg-gray-700 transition-colors group ${
                          activityFilter === action.filter ? 'bg-secondary dark:bg-gray-700' : ''
                        }`}
                      >
                        <div className={`p-3 rounded-lg ${action.color} group-hover:scale-105 transition-transform`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium text-text-primary dark:text-white mt-2">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Filter Reset */}
                {activityFilter !== 'all' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => setActivityFilter('all')}
                      className="text-primary hover:text-red-600 dark:hover:text-red-400 text-sm font-medium"
                    >
                      Show all activities
                    </button>
                  </div>
                )}
              </div>

              {/* Filtered Itinerary Preview */}
              {filteredItineraryItems.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-white">
                      {activityFilter === 'all' ? 'Upcoming Activities' : `${quickActions.find(a => a.filter === activityFilter)?.label || 'Activities'}`}
                    </h3>
                    <button
                      onClick={() => setActiveTab('itinerary')}
                      className="text-primary hover:text-red-600 dark:hover:text-red-400 text-sm font-medium"
                    >
                      View Full Itinerary
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {filteredItineraryItems.slice(0, 5).map((item) => {
                      const Icon = getActivityIcon(item.type);
                      const colorClass = getActivityColor(item.type);
                      
                      return (
                        <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-text-primary dark:text-white">{item.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-text-secondary dark:text-gray-400">
                              <span>{format(new Date(item.date), 'MMM dd')}</span>
                              {item.start_time && <span>{item.start_time}</span>}
                              {item.location && <span>{item.location}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {filteredItineraryItems.length > 5 && (
                      <p className="text-sm text-text-secondary dark:text-gray-400 text-center pt-2">
                        And {filteredItineraryItems.length - 5} more...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Trip Description */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary dark:text-white">About This Trip</h3>
                  {isOwner && (
                    <button className="p-2 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Edit3 className="h-4 w-4 text-text-secondary dark:text-gray-400" />
                    </button>
                  )}
                </div>
                <p className="text-text-secondary dark:text-gray-400 leading-relaxed">
                  {trip.description || 'No description available for this trip yet. Add one to help participants know what to expect!'}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Trip Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-6">
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Trip Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary dark:text-gray-400">Duration</span>
                    <span className="font-medium text-text-primary dark:text-white">{tripDuration} days</span>
                  </div>
                  {trip.budget && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary dark:text-gray-400">Budget</span>
                      <span className="font-medium text-text-primary dark:text-white">${trip.budget.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary dark:text-gray-400">Travelers</span>
                    <span className="font-medium text-text-primary dark:text-white">{participants.length} people</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary dark:text-gray-400">Status</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(trip.status).color}`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                      {canChangeStatus && (
                        <button
                          onClick={() => setShowStatusModal(true)}
                          className="p-1 hover:bg-secondary dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          <Edit3 className="h-3 w-3 text-text-secondary dark:text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary dark:text-white">Travelers</h3>
                  {canInvite && (
                    <button 
                      onClick={() => setShowInviteModal(true)}
                      className="p-2 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <UserPlus className="h-4 w-4 text-text-secondary dark:text-gray-400" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {participants.slice(0, 5).map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {participant.user?.full_name?.charAt(0) || participant.user?.email?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-text-primary dark:text-white">
                            {participant.user?.full_name || participant.user?.email || 'Unknown User'}
                          </p>
                          {participant.role === 'organizer' && (
                            <Crown className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-text-secondary dark:text-gray-400 capitalize">{participant.role}</p>
                      </div>
                    </div>
                  ))}
                  {participants.length > 5 && (
                    <button
                      onClick={() => setActiveTab('participants')}
                      className="text-primary hover:text-red-600 dark:hover:text-red-400 text-sm font-medium"
                    >
                      View all {participants.length} participants
                    </button>
                  )}
                </div>

                {/* Pending Invitations */}
                {invitations.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-text-primary dark:text-white mb-3">Pending Invitations</h4>
                    <div className="space-y-2">
                      {invitations.slice(0, 3).map((invitation) => (
                        <div key={invitation.id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-text-primary dark:text-white">{invitation.email}</span>
                            <span className="text-text-secondary dark:text-gray-400 ml-2">({invitation.role})</span>
                          </div>
                          {isOwner && (
                            <button
                              onClick={() => handleDeleteInvitation(invitation.id, invitation.email)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && tripId && (
          <ItineraryTab tripId={tripId} isOwner={!!isOwner} canEdit={!!canEdit} />
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && tripId && (
          <ExpensesTab tripId={tripId} isOwner={!!isOwner} canEdit={!!canEdit} />
        )}

        {/* Polls Tab */}
        {activeTab === 'polls' && tripId && (
          <PollsTab tripId={tripId} isOwner={!!isOwner} canEdit={!!canEdit} />
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text-primary dark:text-white">Trip Participants</h3>
                {canInvite && (
                  <button 
                    onClick={() => setShowInviteModal(true)}
                    className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Invite People</span>
                  </button>
                )}
              </div>

              {/* Participants List */}
              <div className="space-y-4">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {participant.user?.full_name?.charAt(0) || participant.user?.email?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-text-primary dark:text-white">
                            {participant.user?.full_name || 'Unknown User'}
                          </h4>
                          {participant.role === 'organizer' && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-text-secondary dark:text-gray-400">{participant.user?.email}</p>
                        <p className="text-xs text-text-secondary dark:text-gray-400 capitalize">
                          {participant.role} • Joined {format(new Date(participant.joined_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    {isOwner && participant.user_id !== user?.id && (
                      <div className="flex items-center space-x-2">
                        <select
                          value={participant.role}
                          onChange={(e) => updateParticipantRole({
                            participantId: participant.id,
                            role: e.target.value as 'organizer' | 'participant' | 'guest'
                          })}
                          className="text-sm border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                        >
                          <option value="participant">Participant</option>
                          <option value="organizer">Organizer</option>
                          <option value="guest">Guest</option>
                        </select>
                        <button
                          onClick={() => handleRemoveParticipant(participant.id, participant.user?.full_name || participant.user?.email || 'Unknown User')}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pending Invitations */}
              {invitations.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-text-primary dark:text-white mb-4">Pending Invitations</h4>
                  <div className="space-y-3">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div>
                          <p className="font-medium text-text-primary dark:text-white">{invitation.email}</p>
                          <p className="text-sm text-text-secondary dark:text-gray-400">
                            Invited as {invitation.role} • Expires {format(new Date(invitation.expires_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        {isOwner && (
                          <button
                            onClick={() => handleDeleteInvitation(invitation.id, invitation.email)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">Change Trip Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-2 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-text-secondary dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              {statusOptions.map((status) => {
                const Icon = status.icon;
                const isCurrentStatus = trip.status === status.value;
                
                return (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value as Trip['status'])}
                    disabled={isCurrentStatus || updateTripStatusMutation.isPending}
                    className={`w-full flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                      isCurrentStatus 
                        ? 'border-primary bg-red-50 dark:bg-red-900/20 cursor-not-allowed' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${status.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-text-primary dark:text-white">{status.label}</span>
                        {isCurrentStatus && (
                          <span className="text-xs text-primary dark:text-red-400 font-medium">(Current)</span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary dark:text-gray-400">{status.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-white rounded-lg hover:bg-secondary dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">Invite People</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-text-secondary dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary dark:text-gray-400" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'participant' | 'guest')}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                >
                  <option value="participant">Participant</option>
                  <option value="guest">Guest</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-white rounded-lg hover:bg-secondary dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUser}
                  disabled={!inviteEmail.trim() || isCreating}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">Upload Cover Photo</h3>
              <button
                onClick={() => setShowPhotoUpload(false)}
                className="p-2 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-text-secondary dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-text-secondary dark:text-gray-400 mx-auto mb-4" />
                <p className="text-text-primary dark:text-white font-medium mb-2">Choose a cover photo</p>
                <p className="text-text-secondary dark:text-gray-400 text-sm mb-4">Upload an image to represent your trip</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center px-4 py-2 bg-primary hover:bg-red-600 text-white rounded-lg cursor-pointer transition-colors"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Select Photo
                </label>
              </div>
              <p className="text-xs text-text-secondary dark:text-gray-400 text-center">
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlanning;