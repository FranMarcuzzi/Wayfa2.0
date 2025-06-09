import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  const { theme, isDark } = useTheme();

  useEffect(() => {
    console.log('📄 Layout mounted - Current theme:', theme, 'isDark:', isDark);
    console.log('📋 Layout - DOM classes:', document.documentElement.classList.toString());
  }, [theme, isDark]);

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