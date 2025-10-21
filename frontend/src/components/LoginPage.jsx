import PropTypes from 'prop-types';
import { Book, Moon, Sun, Monitor, Sparkles, Cloud, Leaf, Zap } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function LoginPage({ loginForm, setLoginForm, handleLogin }) {
  const { theme, setTheme, themes, currentTheme } = useTheme();

  const themeIcons = {
    dark: Moon,
    light: Sun,
    blue: Cloud,
    purple: Sparkles,
    green: Leaf,
    orange: Zap
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-100 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="bg-background/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-border">
        {/* Theme Selector */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-2 bg-secondary/50 backdrop-blur-sm rounded-lg p-2">
            {themes.slice(0, 4).map((t) => {
              const Icon = themeIcons[t.id];
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === t.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                  title={t.name}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-center mb-8">
          <Book className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold text-foreground mb-2">Dagboek</h1>
          <p className="text-muted">Developer Hub & Collaboration Platform</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-sm text-muted">Current theme:</span>
            <div className="flex items-center gap-1">
              {currentTheme?.icon && (
                <currentTheme.icon className="w-4 h-4 text-primary" />
              )}
              <span className="text-sm font-medium">{currentTheme?.name}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Username</label>
            <input
              type="text"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your password"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold py-3 rounded-lg transition-opacity duration-200 shadow-lg"
          >
            Sign In
          </button>
        </div>

        <p className="text-center text-muted text-sm mt-6">
          Demo mode - enter any credentials to continue
        </p>

        {/* Theme Showcase */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Available Themes</h3>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => {
              const Icon = themeIcons[t.id];
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${
                    theme === t.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${theme === t.id ? 'text-primary' : 'text-muted'}`} />
                  <span className="text-xs">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

LoginPage.propTypes = {
  loginForm: PropTypes.object.isRequired,
  setLoginForm: PropTypes.func.isRequired,
  handleLogin: PropTypes.func.isRequired,
};