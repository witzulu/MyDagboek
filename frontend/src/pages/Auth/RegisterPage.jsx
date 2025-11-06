import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book } from 'lucide-react';
import api from '../../services/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const data = await api('/auth/register', { body: formData });
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md border border-border">
        <div className="text-center mb-8">
          <Book className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted">Join Dagboek Developer Hub</p>
        </div>

        {error && <div className="bg-destructive text-destructive-foreground p-3 rounded-md mb-4">{error}</div>}
        {message && <div className="bg-primary/20 text-primary-foreground p-3 rounded-md mb-4">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Choose a unique username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring"
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
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Create a password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-semibold py-3 rounded-lg transition-opacity duration-200 shadow-lg"
          >
            Register
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
