import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme) || 'system';
    setThemeState(saved);

    const root = window.document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeToApply = saved === 'system' ? (systemDark ? 'dark' : 'light') : saved;

    root.classList.toggle('dark', themeToApply === 'dark');
  }, []);

  const setTheme = (theme: Theme) => {
    const root = window.document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeToApply = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

    root.classList.toggle('dark', themeToApply === 'dark');
    localStorage.setItem('theme', theme);
    setThemeState(theme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
