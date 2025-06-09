import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
  // Función para obtener el tema inicial
  const getInitialTheme = (): Theme => {
    try {
      // 1. Verificar localStorage primero
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        console.log('🔍 Found saved theme:', savedTheme);
        return savedTheme;
      }
      
      // 2. Si no hay tema guardado, usar preferencia del sistema
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = systemPrefersDark ? 'dark' : 'light';
      console.log('🖥️ Using system preference:', systemTheme);
      return systemTheme;
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
      
      console.log('🎨 Applying theme:', newTheme);
      console.log('📋 Current classes before:', root.classList.toString());
      
      // Remover TODAS las clases de tema
      root.classList.remove('light', 'dark');
      
      // Forzar un reflow para asegurar que los cambios se apliquen
      root.offsetHeight;
      
      // Agregar la nueva clase de tema
      root.classList.add(newTheme);
      
      console.log('📋 Current classes after:', root.classList.toString());
      
      // Guardar en localStorage
      localStorage.setItem('theme', newTheme);
      
      console.log('✅ Theme applied successfully:', newTheme);
      
      // Verificar que se aplicó correctamente
      const hasCorrectClass = root.classList.contains(newTheme);
      console.log('🔍 Verification - has correct class:', hasCorrectClass);
      
      return hasCorrectClass;
    } catch (error) {
      console.error('❌ Error applying theme:', error);
      return false;
    }
  };

  // Aplicar tema cuando cambie el estado
  useEffect(() => {
    const success = applyTheme(theme);
    if (!success) {
      console.warn('⚠️ Theme application failed, retrying...');
      // Retry después de un pequeño delay
      setTimeout(() => applyTheme(theme), 100);
    }
  }, [theme]);

  // Aplicar tema inicial al montar el componente
  useEffect(() => {
    console.log('🚀 Theme hook mounted, applying initial theme:', theme);
    applyTheme(theme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('🔄 Toggling theme from', theme, 'to', newTheme);
    setTheme(newTheme);
  };

  const setThemeDirectly = (newTheme: Theme) => {
    console.log('🎯 Setting theme directly to:', newTheme);
    setTheme(newTheme);
  };

  return {
    theme,
    setTheme: setThemeDirectly,
    toggleTheme,
    isDark: theme === 'dark',
  };
};