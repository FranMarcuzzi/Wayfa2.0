import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    console.log('🎨 Theme changed to:', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('🔄 Toggling theme from', prevTheme, 'to', newTheme);
      return newTheme;
    });
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