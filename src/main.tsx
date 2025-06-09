import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Función para inicializar el tema ANTES de que React se monte
const initializeTheme = () => {
  try {
    console.log('🚀 Initializing theme system...');
    
    // Obtener tema guardado o usar preferencia del sistema
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme: 'light' | 'dark';
    
    if (savedTheme === 'light' || savedTheme === 'dark') {
      initialTheme = savedTheme;
      console.log('📱 Using saved theme:', initialTheme);
    } else {
      initialTheme = systemPrefersDark ? 'dark' : 'light';
      console.log('🖥️ Using system preference:', initialTheme);
    }
    
    // Aplicar tema inmediatamente al DOM
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(initialTheme);
    
    // Guardar en localStorage si no estaba guardado
    if (!savedTheme) {
      localStorage.setItem('theme', initialTheme);
    }
    
    console.log('✅ Initial theme applied:', initialTheme);
    console.log('📋 DOM classes:', root.classList.toString());
    
  } catch (error) {
    console.error('❌ Error initializing theme:', error);
    // Fallback seguro
    document.documentElement.classList.add('light');
  }
};

// Inicializar tema INMEDIATAMENTE
initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);