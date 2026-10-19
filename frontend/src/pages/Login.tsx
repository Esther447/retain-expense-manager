import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../services/api';

interface LoginResponse {
  message: string;
  user: { id: number; name: string; email: string; role: 'user' | 'admin' };
  token: string;
}

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await apiPost<LoginResponse>('/auth/signin', { email, password });
      localStorage.setItem('token', response.token);
      login(response.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      {/* Left branding panel */}
      <div className="auth-panel-left">
        <div className="auth-brand-mark">Retain</div>
        <h2>Take control of your finances.</h2>
        <p>
          Track every expense, set monthly budgets, and gain clear insights
          into your spending — all in one secure place.
        </p>
        <div className="auth-wave" />
      </div>

      {/* Right form panel */}
      <div className="auth-panel-right">
        <div className="auth-card">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue.</p>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
