import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { themes } from './ThemeSwitcher';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      return savedTheme;
    }
    
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  const applyTheme = (themeId) => {
    const themeData = themes.find(t => t.id === themeId);
    if (!themeData) return;

    const root = document.documentElement;
    
    // Remove all theme classes
    themes.forEach(t => root.classList.remove(`${t.id}-theme`));
    
    // Add new theme class
    root.classList.add(`${themeId}-theme`);
    
    // Update CSS variables
    Object.entries(themeData.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });

    // Save to localStorage
    localStorage.setItem('theme', themeId);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themeChange', { detail: themeId }));
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const value = {
    theme,
    setTheme,
    themes,
    currentTheme: themes.find(t => t.id === theme),
    applyTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};