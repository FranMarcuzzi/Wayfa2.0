import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize theme before app renders to prevent flash
const initializeTheme = () => {
  try {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = savedTheme || systemTheme;
    
    console.log('🚀 Initializing theme:', theme);
    
    // Apply theme immediately to prevent flash
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    console.log('✅ Initial theme applied:', theme);
  } catch (error) {
    console.error('❌ Error initializing theme:', error);
    // Fallback to light theme
    document.documentElement.classList.add('light');
  }
};

// Initialize theme synchronously
initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);