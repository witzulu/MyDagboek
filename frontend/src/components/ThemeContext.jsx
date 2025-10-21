import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Moon, Sun, Cloud, Sparkles, Leaf, Zap } from 'lucide-react';

export const themes = [
  {
    id: 'dark',
    name: 'Dark',
    icon: Moon,
    description: 'Classic dark theme for late-night coding',
    colors: {
      background: '240 10% 3.9%',
      foreground: '0 0% 98%',
      primary: '262.1 83.3% 57.8%',
      primaryForeground: '262.1 83.3% 100%',
      secondary: '240 3.7% 15.9%',
      accent: '217.2 91.2% 59.8%',
      muted: '240 5% 64.9%'
    }
  },
  {
    id: 'light',
    name: 'Light',
    icon: Sun,
    description: 'Clean light theme for daytime work',
    colors: {
      background: '0 0% 100%',
      foreground: '240 10% 3.9%',
      primary: '262.1 83.3% 57.8%',
      primaryForeground: '262.1 83.3% 100%',
      secondary: '240 4.8% 95.9%',
      accent: '217.2 91.2% 59.8%',
      muted: '240 3.8% 46.1%'
    }
  },
  {
    id: 'blue',
    name: 'Ocean',
    icon: Cloud,
    description: 'Deep blue theme with oceanic vibes',
    colors: {
      background: '202 40% 9%',
      foreground: '210 40% 98%',
      primary: '217.2 91.2% 59.8%',
      primaryForeground: '217.2 91.2% 100%',
      secondary: '215 25% 27%',
      accent: '217.2 91.2% 59.8%',
      muted: '215 20% 65%'
    }
  },
  {
    id: 'purple',
    name: 'Neon',
    icon: Sparkles,
    description: 'Vibrant purple theme with neon accents',
    colors: {
      background: '274 70% 5%',
      foreground: '270 100% 98%',
      primary: '274 100% 65%',
      primaryForeground: '274 100% 100%',
      secondary: '274 50% 15%',
      accent: '320 100% 55%',
      muted: '274 30% 60%'
    }
  },
  {
    id: 'green',
    name: 'Forest',
    icon: Leaf,
    description: 'Natural green theme for focused work',
    colors: {
      background: '120 30% 8%',
      foreground: '120 40% 98%',
      primary: '142 71% 45%',
      primaryForeground: '142 71% 100%',
      secondary: '120 25% 18%',
      accent: '35 92% 60%',
      muted: '120 20% 65%'
    }
  },
  {
    id: 'orange',
    name: 'Sunset',
    icon: Zap,
    description: 'Warm orange theme with sunset colors',
    colors: {
      background: '20 40% 8%',
      foreground: '20 40% 98%',
      primary: '24 100% 55%',
      primaryForeground: '24 100% 100%',
      secondary: '20 30% 18%',
      accent: '45 100% 55%',
      muted: '20 25% 65%'
    }
  }
];

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark'); // Default to dark, client-side effect will override

  useEffect(() => {
    try {
      // This effect runs only on the client
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
      setTheme(initialTheme);
    } catch (error) {
      console.error('Error in theme initialization:', error);
    }
  }, []);

  const applyTheme = useCallback((themeId) => {
    const themeData = themes.find(t => t.id === themeId);
    if (!themeData) return;

    const body = document.body;

    // Remove all theme classes
    themes.forEach(t => body.classList.remove(`${t.id}-theme`));

    // Add new theme class
    body.classList.add(`${themeId}-theme`);

    // Update CSS variables
    Object.entries(themeData.colors).forEach(([key, value]) => {
      body.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });

    // Save to localStorage
    localStorage.setItem('theme', themeId);

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themeChange', { detail: themeId }));
  }, []);

  useEffect(() => {
    try {
      // This effect applies the theme whenever it changes
      applyTheme(theme);
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }, [theme, applyTheme]);

  useEffect(() => {
    // This effect listens for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
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
    icon: themes.find(t => t.id === theme)?.icon,
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