import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const getLanguageOptions = () => [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Español', nativeName: 'Español' },
  ];

  return {
    currentLanguage: getCurrentLanguage(),
    changeLanguage,
    languageOptions: getLanguageOptions(),
  };
};