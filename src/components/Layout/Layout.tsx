import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Ensure theme is applied to document root
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    console.log('📄 Layout theme applied:', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;