import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  Plus, 
  BarChart3, 
  Edit3, 
  Trash2,
  Clock,
  Users,
  CheckCircle,
  Circle,
  X
} from 'lucide-react';
import { usePolls } from '../../hooks/usePolls';
import { Poll } from '../../types';

interface PollsTabProps {
  tripId: string;
  isOwner: boolean;
  canEdit: boolean;
}

const PollsTab: React.FC<PollsTabProps> = ({ tripId, isOwner, canEdit }) => {
  const { polls, createPoll, vote, deletePoll, closePoll, isCreating, isVoting } = usePolls(tripId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    multiple_choice: false,
    closes_at: '',
    options: ['', ''],
  });
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question || formData.options.filter(opt => opt.trim()).length < 2) return;

    const pollData = {
      question: formData.question,
      description: formData.description || undefined,
      multiple_choice: formData.multiple_choice,
      closes_at: formData.closes_at || undefined,
      options: formData.options.filter(opt => opt.trim()),
    };

    try {
      createPoll(pollData);
      resetForm();
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      description: '',
      multiple_choice: false,
      closes_at: '',
      options: ['', ''],
    });
    setShowAddModal(false);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ''],
    });
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index),
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleVote = (pollId: string, optionId: string, isMultiple: boolean) => {
    const currentSelected = selectedOptions[pollId] || [];
    
    let newSelected: string[];
    if (isMultiple) {
      newSelected = currentSelected.includes(optionId)
        ? currentSelected.filter(id => id !== optionId)
        : [...currentSelected, optionId];
    } else {
      newSelected = [optionId];
    }

    setSelectedOptions({ ...selectedOptions, [pollId]: newSelected });
  };

  const submitVote = (pollId: string) => {
    const optionIds = selectedOptions[pollId] || [];
    if (optionIds.length > 0) {
      vote({ pollId, optionIds });
      setSelectedOptions({ ...selectedOptions, [pollId]: [] });
    }
  };

  const handleDelete = (pollId: string) => {
    if (window.confirm('Are you sure you want to delete this poll?')) {
      deletePoll(pollId);
    }
  };

  const handleClose = (pollId: string) => {
    if (window.confirm('Are you sure you want to close this poll? No more votes will be accepted.')) {
      closePoll(pollId);
    }
  };

  const getVotePercentage = (poll: Poll, optionId: string) => {
    const totalVotes = poll.options?.reduce((sum, opt) => sum + opt.votes, 0) || 0;
    const optionVotes = poll.options?.find(opt => opt.id === optionId)?.votes || 0;
    return totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
  };

  const hasUserVoted = (poll: Poll) => {
    return poll.user_votes && poll.user_votes.length > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">Group Polls</h3>
          <p className="text-text-secondary">Make decisions together with group voting</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Poll</span>
          </button>
        )}
      </div>

      {/* Polls List */}
      {polls.length === 0 ? (
        <div className="bg-white rounded-xl shadow-apple p-8 text-center">
          <BarChart3 className="h-12 w-12 text-text-secondary mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-medium text-text-primary mb-2">No polls yet</h4>
          <p className="text-text-secondary mb-4">Create polls to make group decisions about your trip</p>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create First Poll
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => {
            const userVoted = hasUserVoted(poll);
            const isPollClosed = poll.closed || (poll.closes_at && new Date(poll.closes_at) < new Date());
            const totalVotes = poll.options?.reduce((sum, opt) => sum + opt.votes, 0) || 0;

            return (
              <div key={poll.id} className="bg-white rounded-xl shadow-apple p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-text-primary mb-2">{poll.question}</h4>
                    {poll.description && (
                      <p className="text-text-secondary text-sm mb-3">{poll.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{totalVotes} votes</span>
                      </div>
                      {poll.multiple_choice && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          Multiple Choice
                        </span>
                      )}
                      {isPollClosed && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                          Closed
                        </span>
                      )}
                      {poll.closes_at && !isPollClosed && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Closes {format(parseISO(poll.closes_at), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex items-center space-x-2">
                      {!isPollClosed && (
                        <button
                          onClick={() => handleClose(poll.id)}
                          className="text-yellow-600 hover:text-yellow-800 p-1"
                          title="Close poll"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(poll.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete poll"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Poll Options */}
                <div className="space-y-3">
                  {poll.options?.map((option) => {
                    const percentage = getVotePercentage(poll, option.id);
                    const isSelected = selectedOptions[poll.id]?.includes(option.id);
                    const userVotedForThis = poll.user_votes?.some(vote => vote.option_id === option.id);

                    return (
                      <div key={option.id} className="relative">
                        {/* Voting Interface */}
                        {!userVoted && !isPollClosed && (
                          <button
                            onClick={() => handleVote(poll.id, option.id, poll.multiple_choice)}
                            className={`w-full text-left p-3 border rounded-lg transition-all ${
                              isSelected 
                                ? 'border-primary bg-red-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {poll.multiple_choice ? (
                                isSelected ? (
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-400" />
                                )
                              ) : (
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                                }`} />
                              )}
                              <span className="font-medium text-text-primary">{option.text}</span>
                            </div>
                          </button>
                        )}

                        {/* Results View */}
                        {(userVoted || isPollClosed) && (
                          <div className="p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-text-primary">{option.text}</span>
                                {userVotedForThis && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <span className="text-sm text-text-secondary">
                                {option.votes} votes ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Vote Button */}
                {!userVoted && !isPollClosed && selectedOptions[poll.id]?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => submitVote(poll.id)}
                      disabled={isVoting}
                      className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isVoting ? 'Submitting...' : 'Submit Vote'}
                    </button>
                  </div>
                )}

                {/* Poll Info */}
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-text-secondary">
                  Created by {poll.creator?.full_name || poll.creator?.email} • {format(parseISO(poll.created_at), 'MMM dd, yyyy')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Poll Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Create New Poll</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="What would you like to ask?"
                  required
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
                  placeholder="Additional context (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.multiple_choice}
                      onChange={(e) => setFormData({ ...formData, multiple_choice: e.target.checked })}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-text-primary">Multiple choice</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Closes at
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.closes_at}
                    onChange={(e) => setFormData({ ...formData, closes_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Options *
                </label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      {formData.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {formData.options.length < 6 && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="mt-2 text-primary hover:text-red-600 text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add option</span>
                  </button>
                )}
              </div>

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
                  {isCreating ? 'Creating...' : 'Create Poll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollsTab;