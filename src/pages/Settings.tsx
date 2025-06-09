import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Moon, Sun, Monitor, Palette, Zap, Globe, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme, isDark, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage, languageOptions } = useLanguage();

  const themeOptions = [
    {
      value: 'light' as const,
      label: t('settings.themes.light'),
      description: t('settings.themes.lightDescription'),
      icon: Sun,
      preview: 'bg-white text-gray-900 border-gray-200',
    },
    {
      value: 'dark' as const,
      label: t('settings.themes.dark'),
      description: t('settings.themes.darkDescription'),
      icon: Moon,
      preview: 'bg-gray-900 text-white border-gray-700',
    },
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  const handleQuickToggle = () => {
    toggleTheme();
  };

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
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
            <h1 className="text-3xl font-bold text-text-primary dark:text-white">{t('settings.title')}</h1>
            <p className="text-text-secondary dark:text-gray-400 mt-2">
              {t('settings.subtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Language Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-6 transition-colors duration-200">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <Globe className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary dark:text-white">
                  {t('settings.language')}
                </h2>
              </div>
              <p className="text-text-secondary dark:text-gray-400">
                {t('settings.languageSubtitle')}
              </p>
            </div>

            {/* Language Options */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-text-primary dark:text-white mb-4">
                {t('settings.languageOptions')}
              </h3>
              {languageOptions.map((language) => {
                const isSelected = currentLanguage === language.code;
                
                return (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
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
                      <Globe className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-medium transition-colors duration-200 ${
                          isSelected 
                            ? 'text-primary dark:text-red-400' 
                            : 'text-text-primary dark:text-white'
                        }`}>
                          {language.nativeName}
                        </h4>
                        {isSelected && (
                          <div className="w-2 h-2 bg-primary dark:bg-red-400 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
                        {language.code === 'en' ? t('settings.languages.enDescription') : t('settings.languages.esDescription')}
                      </p>
                    </div>

                    {/* Language Preview */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-text-secondary dark:text-gray-400">
                        {language.code.toUpperCase()}
                      </span>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary dark:text-red-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-apple dark:shadow-gray-900/20 p-6 transition-colors duration-200">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <Palette className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold text-text-primary dark:text-white">
                  {t('settings.appearance')}
                </h2>
              </div>
              <p className="text-text-secondary dark:text-gray-400">
                {t('settings.appearanceSubtitle')}
              </p>
            </div>

            {/* Quick Toggle */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">
                      {t('settings.quickThemeSwitch')}
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {t('settings.currentlyUsing', { theme: isDark ? t('settings.themes.dark') : t('settings.themes.light') })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleQuickToggle}
                  className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {isDark ? (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>{t('settings.switchToLight')}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>{t('settings.switchToDark')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Theme Options */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-text-primary dark:text-white mb-4">
                {t('settings.themeOptions')}
              </h3>
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleThemeChange(option.value)}
                    className={`w-full flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
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
                <span>{t('settings.livePreview')}</span>
              </h3>
              <div className="space-y-4">
                {/* Sample Card */}
                <div className="bg-secondary dark:bg-gray-700 p-4 rounded-lg transition-colors duration-200">
                  <h4 className="font-medium text-text-primary dark:text-white mb-2">
                    {t('settings.sampleTripCard')}
                  </h4>
                  <p className="text-text-secondary dark:text-gray-400 text-sm mb-3">
                    {t('settings.sampleDescription', { theme: isDark ? t('settings.themes.dark') : t('settings.themes.light') })}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                      {t('trips.status.planning')}
                    </div>
                    <span className="text-text-secondary dark:text-gray-400 text-xs">
                      5 {t('tripPlanning.days')} • 3 {t('tripPlanning.travelers')}
                    </span>
                  </div>
                </div>

                {/* Sample Buttons */}
                <div className="flex space-x-3">
                  <button className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                    {t('settings.primaryButton')}
                  </button>
                  <button className="bg-secondary dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-text-primary dark:text-white px-4 py-2 rounded-lg transition-colors">
                    {t('settings.secondaryButton')}
                  </button>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                {t('settings.proTips')}
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>{t('settings.tips.themeToggle')}</li>
                <li>{t('settings.tips.themePersist')}</li>
                <li>{t('settings.tips.darkMode')}</li>
                <li>{t('settings.tips.themeApply')}</li>
                <li>{t('settings.tips.languageToggle')}</li>
                <li>{t('settings.tips.languagePersist')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;