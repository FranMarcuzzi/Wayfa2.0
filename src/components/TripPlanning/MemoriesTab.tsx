import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Plus, 
  Camera, 
  Heart, 
  MessageCircle, 
  MapPin, 
  Calendar,
  Edit3,
  Trash2,
  X,
  Upload,
  User,
  Clock
} from 'lucide-react';
import { useMemories } from '../../hooks/useMemories';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Memory } from '../../types';

interface MemoriesTabProps {
  tripId: string;
  canEdit: boolean;
}

const MemoriesTab: React.FC<MemoriesTabProps> = ({ tripId, canEdit }) => {
  const { user } = useAuth();
  const { memories, createMemory, updateMemory, deleteMemory, isCreating, isDeleting } = useMemories(tripId);
  const { success, error } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    taken_at: new Date().toISOString().split('T')[0],
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      error('Invalid File', 'Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      error('File Too Large', 'Image size must be less than 10MB');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage && !editingMemory) {
      error('Image Required', 'Please select an image to upload');
      return;
    }

    try {
      if (editingMemory) {
        // Update existing memory
        await updateMemory({
          id: editingMemory.id,
          title: formData.title || null,
          description: formData.description || null,
          location: formData.location || null,
          taken_at: formData.taken_at ? new Date(formData.taken_at).toISOString() : editingMemory.taken_at,
        });
        success('Memory Updated', 'Your memory has been updated successfully');
      } else if (selectedImage) {
        // Create new memory
        await createMemory({
          image: selectedImage,
          title: formData.title || undefined,
          description: formData.description || undefined,
          location: formData.location || undefined,
          taken_at: formData.taken_at ? new Date(formData.taken_at).toISOString() : undefined,
        });
        success('Memory Added', 'Your memory has been shared with the group');
      }
      
      resetForm();
    } catch (err: any) {
      error('Failed to Save', err.message || 'Failed to save memory');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      taken_at: new Date().toISOString().split('T')[0],
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingMemory(null);
    setShowAddModal(false);
  };

  const handleEdit = (memory: Memory) => {
    setEditingMemory(memory);
    setFormData({
      title: memory.title || '',
      description: memory.description || '',
      location: memory.location || '',
      taken_at: memory.taken_at ? format(parseISO(memory.taken_at), 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
    });
    setShowAddModal(true);
  };

  const handleDelete = async (memory: Memory) => {
    if (window.confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      try {
        await deleteMemory(memory.id);
        success('Memory Deleted', 'Memory has been removed from the trip');
      } catch (err: any) {
        error('Delete Failed', err.message || 'Failed to delete memory');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-text-primary dark:text-white">Trip Memories</h3>
          <p className="text-text-secondary dark:text-gray-400">Share photos and moments from your journey</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Camera className="h-4 w-4" />
            <span>Add Memory</span>
          </button>
        )}
      </div>

      {/* Memories Feed */}
      {memories.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-8 text-center">
          <Camera className="h-12 w-12 text-text-secondary dark:text-gray-400 mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-medium text-text-primary dark:text-white mb-2">No memories yet</h4>
          <p className="text-text-secondary dark:text-gray-400 mb-4">Start capturing and sharing your trip moments</p>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add First Memory
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {memories.map((memory) => (
            <div key={memory.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 overflow-hidden">
              {/* Post Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {memory.user?.full_name?.charAt(0) || memory.user?.email?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary dark:text-white">
                        {memory.user?.full_name || memory.user?.email || 'Unknown User'}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-text-secondary dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>{format(parseISO(memory.taken_at), 'MMM dd, yyyy')}</span>
                        {memory.location && (
                          <>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{memory.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions for memory owner */}
                  {memory.user_id === user?.id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(memory)}
                        className="p-2 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-4 w-4 text-text-secondary dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(memory)}
                        disabled={isDeleting}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Caption */}
                {memory.title && (
                  <div className="mt-3">
                    <p className="text-text-primary dark:text-white font-medium">{memory.title}</p>
                    {memory.description && (
                      <p className="text-text-secondary dark:text-gray-400 text-sm mt-1">{memory.description}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="relative">
                <img
                  src={memory.image_url}
                  alt={memory.title || 'Trip memory'}
                  className="w-full h-auto max-h-96 object-cover"
                  loading="lazy"
                />
              </div>

              {/* Post Actions */}
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-text-secondary dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">Like</span>
                  </button>
                  <button className="flex items-center space-x-2 text-text-secondary dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">Comment</span>
                  </button>
                </div>
                
                <div className="mt-3 text-xs text-text-secondary dark:text-gray-400">
                  Shared {format(parseISO(memory.created_at), 'MMM dd, yyyy \'at\' h:mm a')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">
                {editingMemory ? 'Edit Memory' : 'Add New Memory'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-text-secondary dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              {!editingMemory && (
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                    Photo *
                  </label>
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-text-secondary dark:text-gray-400 mx-auto mb-2" />
                      <p className="text-text-secondary dark:text-gray-400 text-sm mb-2">
                        Choose a photo to share
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="memory-image"
                      />
                      <label
                        htmlFor="memory-image"
                        className="inline-flex items-center px-3 py-2 bg-primary hover:bg-red-600 text-white rounded-lg cursor-pointer transition-colors text-sm"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Select Photo
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                  Caption
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                  placeholder="What's happening in this photo?"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                  placeholder="Tell us more about this moment..."
                />
              </div>

              {/* Location and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                    placeholder="Where was this?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                    Date Taken
                  </label>
                  <input
                    type="date"
                    value={formData.taken_at}
                    onChange={(e) => setFormData({ ...formData, taken_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-white rounded-lg hover:bg-secondary dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || (!selectedImage && !editingMemory)}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Sharing...' : editingMemory ? 'Update Memory' : 'Share Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoriesTab;