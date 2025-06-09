import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      console.log('🔍 Found saved theme:', savedTheme);
      return savedTheme;
    }
    
    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = systemPrefersDark ? 'dark' : 'light';
    console.log('🖥️ System prefers:', systemTheme);
    return systemTheme;
  });

  // Apply theme to DOM immediately when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    console.log('🎨 Applying theme:', theme);
    
    // Remove all theme classes first
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    console.log('✅ Theme applied successfully. DOM classes:', root.classList.toString());
  }, [theme]);

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