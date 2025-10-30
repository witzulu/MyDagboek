import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/auth/login', { body: formData });
      login(data.token);
      navigate('/projects');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-border">
        <div className="text-center mb-8">
          <Book className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted">Sign in to your Dagboek account</p>
        </div>

        {error && <div className="bg-destructive text-destructive-foreground p-3 rounded-md mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-accent border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-accent border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold py-3 rounded-lg transition-opacity duration-200 shadow-lg"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
