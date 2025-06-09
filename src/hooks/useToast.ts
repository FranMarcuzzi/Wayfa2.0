import { useState, useCallback } from 'react';
import { ToastProps, ToastType } from '../components/UI/Toast';

interface ToastOptions {
  type?: ToastType;
  message?: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((title: string, options: ToastOptions = {}) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastProps = {
      id,
      title,
      type: options.type || 'info',
      message: options.message,
      duration: options.duration || 5000,
      onClose: removeToast,
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    return addToast(title, { type: 'success', message, duration });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    return addToast(title, { type: 'error', message, duration });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    return addToast(title, { type: 'warning', message, duration });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    return addToast(title, { type: 'info', message, duration });
  }, [addToast]);

  const clear = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clear,
  };
};