import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
  // Función para obtener el tema inicial - DEFAULT: LIGHT
  const getInitialTheme = (): Theme => {
    try {
      // 1. Verificar localStorage primero
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      
      // 2. DEFAULT: LIGHT THEME (no usar preferencia del sistema)
      return 'light';
    } catch (error) {
      console.error('❌ Error getting initial theme:', error);
      return 'light'; // Fallback seguro
    }
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Función para aplicar el tema al DOM
  const applyTheme = (newTheme: Theme) => {
    try {
      const root = document.documentElement;
      
      // Remover TODAS las clases de tema
      root.classList.remove('light', 'dark');
      
      // Forzar un reflow para asegurar que los cambios se apliquen
      root.offsetHeight;
      
      // Agregar la nueva clase de tema
      root.classList.add(newTheme);
      
      // Guardar en localStorage
      localStorage.setItem('theme', newTheme);
      
      return true;
    } catch (error) {
      console.error('❌ Error applying theme:', error);
      return false;
    }
  };

  // Aplicar tema cuando cambie el estado
  useEffect(() => {
    const success = applyTheme(theme);
    if (!success) {
      // Retry después de un pequeño delay
      setTimeout(() => applyTheme(theme), 100);
    }
  }, [theme]);

  // Aplicar tema inicial al montar el componente
  useEffect(() => {
    applyTheme(theme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const setThemeDirectly = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return {
    theme,
    setTheme: setThemeDirectly,
    toggleTheme,
    isDark: theme === 'dark',
  };
};