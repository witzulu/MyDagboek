import PropTypes from 'prop-types';
import { Book } from 'lucide-react';

export default function LoginPage({ loginForm, setLoginForm, handleLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-100 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
          <Book className="w-16 h-16 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">Dagboek</h1>
          <p className="text-slate-600 dark:text-slate-400">Developer Hub & Collaboration Platform</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
            <input
              type="text"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 bg-slate-100/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 bg-slate-100/50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-lg"
          >
            Sign In
          </button>
        </div>

        <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-6">
          Demo mode - enter any credentials to continue
        </p>
      </div>
    </div>
  );
}

LoginPage.propTypes = {
  loginForm: PropTypes.object.isRequired,
  setLoginForm: PropTypes.func.isRequired,
  handleLogin: PropTypes.func.isRequired,
};
