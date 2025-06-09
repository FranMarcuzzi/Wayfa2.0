import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Edit3, 
  Trash2,
  Plane,
  Hotel,
  Utensils,
  Activity,
  Car,
  MoreHorizontal,
  Coffee,
  ShoppingBag,
  Camera,
  Music,
  Gamepad2,
  X
} from 'lucide-react';
import { useItinerary } from '../../hooks/useItinerary';
import { ItineraryItem } from '../../types';

interface ItineraryTabProps {
  tripId: string;
  isOwner: boolean;
  canEdit: boolean;
}

const ItineraryTab: React.FC<ItineraryTabProps> = ({ tripId, isOwner, canEdit }) => {
  const { itineraryItems, createItineraryItem, updateItineraryItem, deleteItineraryItem, isCreating } = useItinerary(tripId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [selectedActivityType, setSelectedActivityType] = useState<ItineraryItem['type'] | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    title: '',
    description: '',
    location: '',
    type: 'activity' as ItineraryItem['type'],
  });

  const quickActions = [
    { 
      type: 'transport' as const, 
      label: 'Transport', 
      icon: Plane, 
      color: 'bg-blue-50 text-blue-600',
      examples: ['Flight', 'Train', 'Bus', 'Car Rental', 'Taxi']
    },
    { 
      type: 'accommodation' as const, 
      label: 'Hotels', 
      icon: Hotel, 
      color: 'bg-green-50 text-green-600',
      examples: ['Hotel Check-in', 'Airbnb', 'Hostel', 'Resort']
    },
    { 
      type: 'meal' as const, 
      label: 'Dining', 
      icon: Utensils, 
      color: 'bg-yellow-50 text-yellow-600',
      examples: ['Breakfast', 'Lunch', 'Dinner', 'Coffee Break']
    },
    { 
      type: 'activity' as const, 
      label: 'Activities', 
      icon: Activity, 
      color: 'bg-purple-50 text-purple-600',
      examples: ['Sightseeing', 'Museum', 'Tour', 'Adventure']
    }
  ];

  const typeOptions = [
    { value: 'activity', label: 'Activity', icon: Activity, color: 'bg-purple-50 text-purple-600' },
    { value: 'meal', label: 'Meal', icon: Utensils, color: 'bg-yellow-50 text-yellow-600' },
    { value: 'transport', label: 'Transport', icon: Car, color: 'bg-blue-50 text-blue-600' },
    { value: 'accommodation', label: 'Accommodation', icon: Hotel, color: 'bg-green-50 text-green-600' },
    { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'bg-gray-50 text-gray-600' },
  ];

  const getTypeInfo = (type: ItineraryItem['type']) => {
    return typeOptions.find(option => option.value === type) || typeOptions[typeOptions.length - 1];
  };

  const handleQuickAction = (type: ItineraryItem['type']) => {
    setSelectedActivityType(type);
    setFormData({
      ...formData,
      type,
      title: '',
      description: '',
      location: '',
      date: '',
      start_time: '',
      end_time: ''
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date) return;

    const itemData = {
      trip_id: tripId,
      date: formData.date,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      title: formData.title,
      description: formData.description || null,
      location: formData.location || null,
      type: formData.type,
      order_index: 0,
    };

    try {
      if (editingItem) {
        updateItineraryItem({ id: editingItem.id, ...itemData });
      } else {
        createItineraryItem(itemData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving itinerary item:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      date: '',
      start_time: '',
      end_time: '',
      title: '',
      description: '',
      location: '',
      type: 'activity',
    });
    setShowAddModal(false);
    setEditingItem(null);
    setSelectedActivityType(null);
  };

  const handleEdit = (item: ItineraryItem) => {
    setEditingItem(item);
    setFormData({
      date: item.date,
      start_time: item.start_time || '',
      end_time: item.end_time || '',
      title: item.title,
      description: item.description || '',
      location: item.location || '',
      type: item.type,
    });
    setShowAddModal(true);
  };

  const handleDelete = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this itinerary item?')) {
      deleteItineraryItem(itemId);
    }
  };

  // Group items by date and sort chronologically
  const groupedItems = itineraryItems.reduce((groups, item) => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as Record<string, ItineraryItem[]>);

  // Sort dates chronologically and items within each date by time
  const sortedDates = Object.keys(groupedItems).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const getFormFields = () => {
    const selectedAction = quickActions.find(action => action.type === selectedActivityType);
    
    switch (selectedActivityType) {
      case 'transport':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Transport Type *
              </label>
              <select
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select transport type</option>
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Bus">Bus</option>
                <option value="Car Rental">Car Rental</option>
                <option value="Taxi/Uber">Taxi/Uber</option>
                <option value="Ferry">Ferry</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  From
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Departure location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  To
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Arrival location"
                />
              </div>
            </div>
          </>
        );

      case 'accommodation':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Accommodation Type *
              </label>
              <select
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select accommodation</option>
                <option value="Hotel Check-in">Hotel Check-in</option>
                <option value="Hotel Check-out">Hotel Check-out</option>
                <option value="Airbnb Check-in">Airbnb Check-in</option>
                <option value="Hostel">Hostel</option>
                <option value="Resort">Resort</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Property Name
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Hotel/property name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Notes
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Confirmation number, special requests..."
              />
            </div>
          </>
        );

      case 'meal':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Meal Type *
              </label>
              <select
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select meal type</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Coffee Break">Coffee Break</option>
                <option value="Snack">Snack</option>
                <option value="Drinks">Drinks</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Restaurant/Venue
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Restaurant name or location"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Notes
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Reservation details, dietary requirements..."
              />
            </div>
          </>
        );

      case 'activity':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Activity Type *
              </label>
              <select
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select activity</option>
                <option value="Sightseeing">Sightseeing</option>
                <option value="Museum Visit">Museum Visit</option>
                <option value="Guided Tour">Guided Tour</option>
                <option value="Adventure Activity">Adventure Activity</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Cultural Experience">Cultural Experience</option>
                <option value="Sports">Sports</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Location/Venue
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Where is this activity?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Activity details, tickets, meeting point..."
              />
            </div>
          </>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Activity title"
              required
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">Trip Itinerary</h3>
          <p className="text-text-secondary">Plan your daily activities and schedule</p>
        </div>
      </div>

      {/* Quick Actions */}
      {canEdit && (
        <div className="bg-white rounded-xl shadow-apple p-6">
          <h4 className="text-lg font-semibold text-text-primary mb-4">Quick Add</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.type}
                  onClick={() => handleQuickAction(action.type)}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-secondary transition-colors group"
                >
                  <div className={`p-3 rounded-lg ${action.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-text-primary mt-2">{action.label}</span>
                  <span className="text-xs text-text-secondary mt-1">
                    {action.examples.slice(0, 2).join(', ')}...
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Itinerary Timeline */}
      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-apple p-8 text-center">
          <Calendar className="h-12 w-12 text-text-secondary mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-medium text-text-primary mb-2">No activities planned yet</h4>
          <p className="text-text-secondary mb-4">Start building your itinerary by adding activities, meals, and more</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => {
            const items = groupedItems[date];
            // Sort items by time (items without time go to the end)
            const sortedItems = items.sort((a, b) => {
              if (!a.start_time && !b.start_time) return 0;
              if (!a.start_time) return 1;
              if (!b.start_time) return -1;
              return a.start_time.localeCompare(b.start_time);
            });

            return (
              <div key={date} className="bg-white rounded-xl shadow-apple p-6">
                <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>{format(parseISO(date), 'EEEE, MMMM dd, yyyy')}</span>
                </h4>
                
                <div className="space-y-4">
                  {sortedItems.map((item) => {
                    const typeInfo = getTypeInfo(item.type);
                    const Icon = typeInfo.icon;
                    
                    return (
                      <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-secondary transition-colors">
                        <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="font-medium text-text-primary">{item.title}</h5>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                  {typeInfo.label}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-text-secondary text-sm mt-1">{item.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-text-secondary">
                                {item.start_time && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {item.start_time}
                                      {item.end_time && ` - ${item.end_time}`}
                                    </span>
                                  </div>
                                )}
                                {item.location && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{item.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {canEdit && (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <Edit3 className="h-3 w-3 text-text-secondary" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="h-3 w-3 text-red-500" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                {editingItem ? 'Edit Activity' : selectedActivityType ? `Add ${quickActions.find(a => a.type === selectedActivityType)?.label}` : 'Add New Activity'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dynamic form fields based on activity type */}
              {getFormFields()}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                {!selectedActivityType && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ItineraryItem['type'] })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Show generic fields for custom activities */}
              {!selectedActivityType && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Where is this happening?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Additional details..."
                    />
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-200 text-text-primary rounded-lg hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Saving...' : editingItem ? 'Update' : 'Add Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryTab;