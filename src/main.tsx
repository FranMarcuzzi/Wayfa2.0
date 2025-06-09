import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; // Import i18n configuration

// Función para inicializar el tema ANTES de que React se monte
const initializeTheme = () => {
  try {
    // Obtener tema guardado o usar LIGHT como default
    const savedTheme = localStorage.getItem('theme');
    
    let initialTheme: 'light' | 'dark';
    
    if (savedTheme === 'light' || savedTheme === 'dark') {
      initialTheme = savedTheme;
    } else {
      // DEFAULT: LIGHT THEME (no usar preferencia del sistema)
      initialTheme = 'light';
    }
    
    // Aplicar tema inmediatamente al DOM
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(initialTheme);
    
    // Guardar en localStorage si no estaba guardado
    if (!savedTheme) {
      localStorage.setItem('theme', initialTheme);
    }
    
  } catch (error) {
    console.error('❌ Error initializing theme:', error);
    // Fallback seguro: LIGHT
    document.documentElement.classList.add('light');
    localStorage.setItem('theme', 'light');
  }
};

// Inicializar tema INMEDIATAMENTE
initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);