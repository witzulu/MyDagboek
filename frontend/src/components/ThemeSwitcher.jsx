import { useState, useEffect, useRef } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function ThemeSwitcher() {
  const { theme: currentTheme, setTheme, themes } = useTheme();
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

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  const currentThemeData = themes.find(t => t.id === currentTheme);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-base-200 hover:bg-base-300 rounded-lg transition-colors text-sm"
      >
        {currentThemeData?.icon ? <currentThemeData.icon className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
        <span className="hidden sm:inline">{currentThemeData?.name || 'Theme'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 z-50 overflow-hidden">
          <div className="p-4 border-b border-base-300">
            <h3 className="font-semibold">Choose Theme</h3>
            <p className="text-sm text-base-content/70">Select your preferred visual style</p>
          </div>
          
          <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
            {themes.map((theme) => {
              const Icon = theme.icon;
              const isActive = currentTheme === theme.id;
              
              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-base-200 border border-transparent'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                        {theme.name}
                      </span>
                      {isActive && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className={`text-sm ${isActive ? 'text-base-content/70' : 'text-base-content/60'}`}>
                      {theme.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="p-4 border-t border-base-300 bg-base-200/50">
            <p className="text-xs text-base-content/60">
              💡 Tip: Your theme preference is saved automatically
            </p>
          </div>
        </div>
      )}
    </div>
  );
}