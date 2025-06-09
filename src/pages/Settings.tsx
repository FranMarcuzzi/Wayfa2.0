import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Moon, Sun, Monitor, Palette } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Settings: React.FC = () => {
  const { theme, setTheme, isDark, toggleTheme } = useTheme();

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      description: 'Light theme for bright environments',
      icon: Sun,
      preview: 'bg-white text-gray-900 border-gray-200',
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      description: 'Dark theme for low-light environments',
      icon: Moon,
      preview: 'bg-gray-900 text-white border-gray-700',
    },
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    console.log('🎨 Settings: Changing theme to', newTheme);
    setTheme(newTheme);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link 
            to="/dashboard" 
            className="p-2 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-text-secondary dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-white">Settings</h1>
            <p className="text-text-secondary dark:text-gray-400 mt-2">
              Customize your TripPlanner experience
            </p>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-6 transition-colors duration-200">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <Palette className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold text-text-primary dark:text-white">
                Appearance
              </h2>
            </div>
            <p className="text-text-secondary dark:text-gray-400">
              Choose how TripPlanner looks on your device
            </p>
          </div>

          {/* Quick Toggle */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isDark ? (
                  <Moon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Sun className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Current Theme: {isDark ? 'Dark' : 'Light'}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Quick toggle between light and dark modes
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                {isDark ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Switch to Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Switch to Dark</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Theme Options */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-text-primary dark:text-white mb-4">
              Theme Options
            </h3>
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`w-full flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-red-50 dark:bg-red-900/20 dark:border-red-500'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-secondary dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`p-3 rounded-lg transition-colors duration-200 ${
                    isSelected 
                      ? 'bg-primary text-white' 
                      : 'bg-secondary dark:bg-gray-700 text-text-secondary dark:text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-medium transition-colors duration-200 ${
                        isSelected 
                          ? 'text-primary dark:text-red-400' 
                          : 'text-text-primary dark:text-white'
                      }`}>
                        {option.label}
                      </h4>
                      {isSelected && (
                        <div className="w-2 h-2 bg-primary dark:bg-red-400 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  </div>

                  {/* Theme Preview */}
                  <div className={`w-16 h-12 rounded-lg border-2 ${option.preview} flex items-center justify-center transition-all duration-200`}>
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Theme Preview Section */}
          <div className="mt-8 p-6 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-200">
            <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-4 flex items-center space-x-2">
              <Monitor className="h-5 w-5" />
              <span>Live Preview</span>
            </h3>
            <div className="space-y-4">
              {/* Sample Card */}
              <div className="bg-secondary dark:bg-gray-700 p-4 rounded-lg transition-colors duration-200">
                <h4 className="font-medium text-text-primary dark:text-white mb-2">
                  Sample Trip Card
                </h4>
                <p className="text-text-secondary dark:text-gray-400 text-sm mb-3">
                  This is how your trip cards will look with the {isDark ? 'dark' : 'light'} theme.
                </p>
                <div className="flex items-center space-x-2">
                  <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                    Planning
                  </div>
                  <span className="text-text-secondary dark:text-gray-400 text-xs">
                    5 days • 3 travelers
                  </span>
                </div>
              </div>

              {/* Sample Buttons */}
              <div className="flex space-x-3">
                <button className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Primary Button
                </button>
                <button className="bg-secondary dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-text-primary dark:text-white px-4 py-2 rounded-lg transition-colors">
                  Secondary Button
                </button>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              💡 Pro Tips
            </h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Use the {isDark ? <Sun className="inline h-4 w-4" /> : <Moon className="inline h-4 w-4" />} button in the navigation bar for quick theme switching</li>
              <li>• Your theme preference is automatically saved and will persist across sessions</li>
              <li>• Dark mode can help reduce eye strain in low-light environments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;