import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { 
  Send, 
  Reply, 
  Edit3, 
  Trash2, 
  MoreVertical,
  MessageCircle,
  X,
  Check,
  Clock
} from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Message } from '../../types';

interface ChatTabProps {
  tripId: string;
  canEdit: boolean;
}

const ChatTab: React.FC<ChatTabProps> = ({ tripId, canEdit }) => {
  const { user } = useAuth();
  const { messages, sendMessage, editMessage, deleteMessage, isSending, isEditing } = useChat(tripId);
  const { success, error } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showActions, setShowActions] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when replying
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        content: newMessage.trim(),
        reply_to: replyingTo?.id,
      });
      
      setNewMessage('');
      setReplyingTo(null);
    } catch (err: any) {
      error('Send Failed', err.message || 'Failed to send message');
    }
  };

  const handleEditMessage = async (message: Message) => {
    if (!editContent.trim() || editContent === message.content) {
      setEditingMessage(null);
      setEditContent('');
      return;
    }

    try {
      await editMessage({ id: message.id, content: editContent.trim() });
      setEditingMessage(null);
      setEditContent('');
      success('Message Updated', 'Your message has been edited');
    } catch (err: any) {
      error('Edit Failed', err.message || 'Failed to edit message');
    }
  };

  const handleDeleteMessage = async (message: Message) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(message.id);
        success('Message Deleted', 'Message has been removed');
      } catch (err: any) {
        error('Delete Failed', err.message || 'Failed to delete message');
      }
    }
  };

  const startEdit = (message: Message) => {
    setEditingMessage(message);
    setEditContent(message.content);
    setShowActions(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const formatMessageTime = (timestamp: string) => {
    const date = parseISO(timestamp);
    
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM dd, h:mm a');
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = format(parseISO(message.created_at), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM dd, yyyy');
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary rounded-lg">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary dark:text-white">Trip Chat</h3>
            <p className="text-sm text-text-secondary dark:text-gray-400">
              {messages.length} messages • Stay connected with your group
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-12 w-12 text-text-secondary dark:text-gray-400 mb-4 opacity-50" />
            <h4 className="text-lg font-medium text-text-primary dark:text-white mb-2">No messages yet</h4>
            <p className="text-text-secondary dark:text-gray-400 mb-4">Start the conversation with your travel companions</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dayMessages]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-secondary dark:bg-gray-700 px-3 py-1 rounded-full">
                  <span className="text-xs font-medium text-text-secondary dark:text-gray-400">
                    {formatDateHeader(date)}
                  </span>
                </div>
              </div>

              {/* Messages for this date */}
              {dayMessages.map((message, index) => {
                const isOwn = message.user_id === user?.id;
                const showAvatar = index === 0 || dayMessages[index - 1].user_id !== message.user_id;
                const isEditing = editingMessage?.id === message.id;

                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
                      {/* Avatar */}
                      {showAvatar && !isOwn && (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-medium">
                            {message.user?.full_name?.charAt(0) || message.user?.email?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      {!showAvatar && !isOwn && <div className="w-8" />}

                      {/* Message Bubble */}
                      <div className="relative group">
                        {/* Reply indicator */}
                        {message.reply_to && message.reply_message && (
                          <div className={`text-xs p-2 rounded-t-lg border-l-2 border-primary ${
                            isOwn 
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' 
                              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                          }`}>
                            <p className="font-medium">
                              Replying to {message.reply_message.user?.full_name || 'Unknown'}
                            </p>
                            <p className="truncate opacity-75">
                              {message.reply_message.content}
                            </p>
                          </div>
                        )}

                        {/* Message content */}
                        <div className={`px-4 py-2 rounded-lg ${
                          message.reply_to ? 'rounded-t-none' : ''
                        } ${
                          isOwn 
                            ? 'bg-primary text-white' 
                            : 'bg-secondary dark:bg-gray-700 text-text-primary dark:text-white'
                        }`}>
                          {/* User name for non-own messages */}
                          {!isOwn && showAvatar && (
                            <p className="text-xs font-medium mb-1 opacity-75">
                              {message.user?.full_name || message.user?.email}
                            </p>
                          )}

                          {/* Message content or edit input */}
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-2 text-sm bg-white dark:bg-gray-600 text-text-primary dark:text-white rounded border-0 resize-none"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditMessage(message)}
                                  disabled={isEditing}
                                  className="p-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          )}

                          {/* Message metadata */}
                          <div className={`flex items-center justify-between mt-1 text-xs ${
                            isOwn ? 'text-red-100' : 'text-text-secondary dark:text-gray-400'
                          }`}>
                            <span>{formatMessageTime(message.created_at)}</span>
                            {message.edited_at && (
                              <span className="flex items-center space-x-1">
                                <Edit3 className="h-3 w-3" />
                                <span>edited</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Message Actions */}
                        {!isEditing && (
                          <div className={`absolute top-0 ${isOwn ? 'left-0' : 'right-0'} transform ${
                            isOwn ? '-translate-x-full' : 'translate-x-full'
                          } opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <div className="flex items-center space-x-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-1 ml-2 mr-2">
                              <button
                                onClick={() => setReplyingTo(message)}
                                className="p-1 hover:bg-secondary dark:hover:bg-gray-600 rounded transition-colors"
                                title="Reply"
                              >
                                <Reply className="h-3 w-3 text-text-secondary dark:text-gray-400" />
                              </button>
                              
                              {isOwn && (
                                <>
                                  <button
                                    onClick={() => startEdit(message)}
                                    className="p-1 hover:bg-secondary dark:hover:bg-gray-600 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <Edit3 className="h-3 w-3 text-text-secondary dark:text-gray-400" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(message)}
                                    className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Replying to {replyingTo.user?.full_name || 'Unknown'}
              </span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
            >
              <X className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 truncate mt-1">
            {replyingTo.content}
          </p>
        </div>
      )}

      {/* Message Input */}
      {canEdit && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={replyingTo ? `Reply to ${replyingTo.user?.full_name || 'message'}...` : "Type a message..."}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="p-2 bg-primary hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
          <p className="text-xs text-text-secondary dark:text-gray-400 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatTab;