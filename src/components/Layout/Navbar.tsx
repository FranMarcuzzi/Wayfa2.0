import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useInvitations } from '../../hooks/useInvitations';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  MapPin,
  Check,
  Clock,
  Moon,
  Sun,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { userInvitations, acceptInvitation, isAccepting } = useInvitations();
  const { isDark, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage, languageOptions } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
      setIsNotificationsOpen(false);
    } catch (error: any) {
      console.error('❌ Error accepting invitation:', error);
      alert(error.message || 'Failed to accept invitation');
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    setIsLanguageMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  const toggleNotifications = () => setIsNotificationsOpen(!isNotificationsOpen);
  const toggleLanguageMenu = () => setIsLanguageMenuOpen(!isLanguageMenuOpen);

  const getCurrentLanguageOption = () => {
    return languageOptions.find(lang => lang.code === currentLanguage) || languageOptions[0];
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-apple dark:shadow-gray-900/20 border-b border-gray-100 dark:border-gray-700 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-text-primary dark:text-white transition-colors">TripPlanner</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className="text-text-primary dark:text-gray-300 hover:text-primary dark:hover:text-red-400 transition-colors duration-200"
            >
              {t('navigation.dashboard')}
            </Link>
            <Link 
              to="/trips" 
              className="text-text-primary dark:text-gray-300 hover:text-primary dark:hover:text-red-400 transition-colors duration-200"
            >
              {t('navigation.trips')}
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={toggleLanguageMenu}
                className="flex items-center space-x-2 p-2 text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-red-400 transition-all duration-200 rounded-lg hover:bg-secondary dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                title={t('settings.language')}
                aria-label={t('settings.language')}
              >
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:block">
                  {getCurrentLanguageOption().code.toUpperCase()}
                </span>
              </button>

              {/* Language Dropdown */}
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-apple-lg dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-text-primary dark:text-white text-sm">{t('settings.language')}</h3>
                  </div>
                  {languageOptions.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        currentLanguage === language.code
                          ? 'bg-primary text-white'
                          : 'text-text-primary dark:text-gray-300 hover:bg-secondary dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{language.nativeName}</span>
                        {currentLanguage === language.code && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-red-400 transition-all duration-200 rounded-lg hover:bg-secondary dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              title={isDark ? t('settings.switchToLight') : t('settings.switchToDark')}
              aria-label={isDark ? t('settings.switchToLight') : t('settings.switchToDark')}
            >
              {isDark ? (
                <Sun className="h-5 w-5 transform transition-transform duration-200 hover:scale-110" />
              ) : (
                <Moon className="h-5 w-5 transform transition-transform duration-200 hover:scale-110" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={toggleNotifications}
                className="relative p-2 text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-red-400 transition-colors duration-200 rounded-lg hover:bg-secondary dark:hover:bg-gray-700"
              >
                <Bell className="h-5 w-5" />
                {userInvitations && userInvitations.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {userInvitations.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-apple-lg dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-700 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-text-primary dark:text-white">{t('navigation.notifications')}</h3>
                  </div>
                  
                  {!userInvitations || userInvitations.length === 0 ? (
                    <div className="px-4 py-6 text-center text-text-secondary dark:text-gray-400">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{t('notifications.noNotifications')}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {userInvitations.map((invitation) => (
                        <div key={invitation.id} className="px-4 py-3 hover:bg-secondary dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary dark:text-white">
                                {t('notifications.tripInvitation')}
                              </p>
                              <p className="text-sm text-text-secondary dark:text-gray-400">
                                {t('notifications.invitedToJoin', { title: invitation.trip?.title })}
                              </p>
                              <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                                {t('notifications.from', { name: invitation.inviter?.full_name || invitation.inviter?.email })}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <button
                                  onClick={() => handleAcceptInvitation(invitation.id)}
                                  disabled={isAccepting}
                                  className="bg-primary hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition-colors disabled:opacity-50"
                                >
                                  {isAccepting ? t('notifications.accepting') : t('notifications.accept')}
                                </button>
                                <div className="flex items-center space-x-1 text-xs text-text-secondary dark:text-gray-400">
                                  <Clock className="h-3 w-3" />
                                  <span>{t('notifications.expires', { date: format(new Date(invitation.expires_at), 'MMM dd') })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="hidden md:block text-text-primary dark:text-white transition-colors">
                  {user?.full_name || user?.email}
                </span>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-apple-lg dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-700 py-2 z-50">
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 px-4 py-2 text-text-primary dark:text-gray-300 hover:bg-secondary dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('navigation.settings')}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-text-primary dark:text-gray-300 hover:bg-secondary dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('navigation.signOut')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-red-400 transition-colors duration-200 rounded-lg hover:bg-secondary dark:hover:bg-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col space-y-2">
              <Link
                to="/dashboard"
                className="px-4 py-2 text-text-primary dark:text-gray-300 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.dashboard')}
              </Link>
              <Link
                to="/trips"
                className="px-4 py-2 text-text-primary dark:text-gray-300 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navigation.trips')}
              </Link>
              
              {/* Mobile Language Selector */}
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-text-primary dark:text-white mb-2">{t('settings.language')}</p>
                <div className="flex space-x-2">
                  {languageOptions.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        handleLanguageChange(language.code);
                        setIsMenuOpen(false);
                      }}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        currentLanguage === language.code
                          ? 'bg-primary text-white'
                          : 'bg-secondary dark:bg-gray-700 text-text-primary dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {language.nativeName}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Mobile Theme Toggle */}
              <button
                onClick={() => {
                  handleThemeToggle();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-text-primary dark:text-gray-300 hover:bg-secondary dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
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
        )}
      </div>
    </nav>
  );
};

export default Navbar;