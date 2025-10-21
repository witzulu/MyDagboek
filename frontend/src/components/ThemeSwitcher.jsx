import { useState, useEffect, useRef } from 'react';
import { Palette, Check, Sun, Moon, Monitor, Sparkles, Zap, Leaf, Cloud } from 'lucide-react';
import PropTypes from 'prop-types';

const themes = [
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

export default function ThemeSwitcher({ currentTheme, onThemeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTheme = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    
    // Remove all theme classes
    themes.forEach(t => root.classList.remove(`${t.id}-theme`));
    
    // Add new theme class
    root.classList.add(`${themeId}-theme`);
    
    // Update CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
    });

    // Save to localStorage
    localStorage.setItem('theme', themeId);
    
    // Call parent callback
    onThemeChange(themeId);
    
    // Close dropdown
    setIsOpen(false);
  };

  const currentThemeData = themes.find(t => t.id === currentTheme);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors text-sm"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">{currentThemeData?.name || 'Theme'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-white">Choose Theme</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Select your preferred visual style</p>
          </div>
          
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {themes.map((theme) => {
              const Icon = theme.icon;
              const isActive = currentTheme === theme.id;
              
              return (
                <button
                  key={theme.id}
                  onClick={() => applyTheme(theme.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <Icon className={`w-5 h-5 ${
                      isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${
                        isActive ? 'text-purple-800 dark:text-purple-200' : 'text-slate-800 dark:text-white'
                      }`}>
                        {theme.name}
                      </span>
                      {isActive && (
                        <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <p className={`text-sm ${
                      isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {theme.description}
                    </p>
                  </div>
                  
                  <div className="flex gap-1 mt-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600"
                      style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600"
                      style={{ backgroundColor: `hsl(${theme.colors.secondary})` }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600"
                      style={{ backgroundColor: `hsl(${theme.colors.accent})` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              💡 Tip: Your theme preference is saved automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

ThemeSwitcher.propTypes = {
  currentTheme: PropTypes.string.isRequired,
  onThemeChange: PropTypes.func.isRequired,
};

export { themes };