import { useState, useEffect } from 'react';
import { Language, translations, Translation } from '@/constants/i18n';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
      return savedLanguage;
    }
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) {
      return 'zh';
    }
    return 'en';
  });

  const t: Translation = translations[language];

  const setLanguageWithStorage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return {
    language,
    setLanguage: setLanguageWithStorage,
    t
  };
}
