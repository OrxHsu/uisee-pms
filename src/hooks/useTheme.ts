import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    return 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateEffectiveTheme = () => {
      if (theme === 'light') {
        setEffectiveTheme('light');
      } else if (theme === 'dark') {
        setEffectiveTheme('dark');
      } else {
        setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    updateEffectiveTheme();
    
    mediaQuery.addEventListener('change', updateEffectiveTheme);
    
    return () => {
      mediaQuery.removeEventListener('change', updateEffectiveTheme);
    };
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(effectiveTheme);
  }, [effectiveTheme]);

  const setThemeWithStorage = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return {
    theme,
    effectiveTheme,
    setTheme: setThemeWithStorage,
    isDark: effectiveTheme === 'dark'
  };
}
