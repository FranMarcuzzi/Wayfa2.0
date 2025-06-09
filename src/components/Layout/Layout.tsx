import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;