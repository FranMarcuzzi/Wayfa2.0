import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'info':
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "border-l-4";
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200`;
      case 'error':
        return `${baseStyles} border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200`;
      case 'warning':
        return `${baseStyles} border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200`;
      case 'info':
      default:
        return `${baseStyles} border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200`;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
        max-w-sm w-full ${getStyles()} rounded-lg shadow-apple-lg dark:shadow-gray-900/20 p-4 mb-3
      `}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{title}</h4>
          {message && (
            <p className="text-sm opacity-90 mt-1">{message}</p>
          )}
        </div>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      {duration > 0 && (
        <div className="mt-3 w-full bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 rounded-full h-1">
          <div 
            className="h-1 bg-current rounded-full transition-all ease-linear"
            style={{
              width: isLeaving ? '0%' : '100%',
              transitionDuration: isLeaving ? '300ms' : `${duration}ms`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Toast;