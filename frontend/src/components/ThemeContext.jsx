import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Moon, Sun, Cloud, Sparkles, Leaf, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const themes = [
  // daisyUI themes
  {
    id: 'light',
    name: 'Light',
    icon: Sun,
    description: 'Default light theme from daisyUI',
    isDaisyUI: true,
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: Moon,
    description: 'Default dark theme from daisyUI',
    isDaisyUI: true,
  },
  {
    id: 'cupcake',
    name: 'Cupcake',
    icon: Sun,
    description: 'A light, sweet theme from daisyUI',
    isDaisyUI: true,
  },
  {
    id: 'dracula',
    name: 'Dracula',
    icon: Moon,
    description: 'A dark, spooky theme from daisyUI',
    isDaisyUI: true,
  },
  // Original custom themes
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
  const { user, isAuthenticated } = useAuth();
  const [theme, _setTheme] = useState('dark');

  const applyTheme = useCallback((themeId) => {
    const themeData = themes.find(t => t.id === themeId);
    if (!themeData) {
      console.warn(`Theme "${themeId}" not found. Falling back to "dark".`);
      applyTheme('dark');
      return;
    }

    const root = document.documentElement;
    root.removeAttribute('style');
    root.classList.remove(...themes.filter(t => !t.isDaisyUI).map(t => `${t.id}-theme`));

    if (themeData.isDaisyUI) {
      root.setAttribute('data-theme', themeId);
    } else {
      root.removeAttribute('data-theme');
      root.classList.add(`${themeId}-theme`);
      Object.entries(themeData.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
      });
    }

    window.dispatchEvent(new CustomEvent('themeChange', { detail: themeId }));
  }, []);

  const setTheme = useCallback(async (themeId) => {
    _setTheme(themeId);
    if (isAuthenticated) {
      try {
        await api('/users/theme', {
          method: 'PUT',
          body: { theme: themeId },
        });
        localStorage.setItem('theme', themeId);
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    } else {
      localStorage.setItem('theme', themeId);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    _setTheme(initialTheme);
    applyTheme(initialTheme);
  }, [applyTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      if (!localStorage.getItem('theme')) {
        _setTheme(e.matches ? 'dark' : 'light');
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
