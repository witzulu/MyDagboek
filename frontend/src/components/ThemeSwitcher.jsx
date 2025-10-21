import { useState, useEffect, useRef } from 'react';
import { Palette, Check, Sun, Moon, Monitor, Sparkles, Zap, Leaf, Cloud } from 'lucide-react';
import PropTypes from 'prop-types';
import { themes } from './ThemeContext';

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