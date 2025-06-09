import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize theme before app renders
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = savedTheme || systemTheme;
  
  // Apply theme immediately to prevent flash
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  
  console.log('🚀 Initial theme set to:', theme);
};

initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);