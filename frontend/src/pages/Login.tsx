import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../services/api';
import { Mail, Lock, User, Wallet } from 'lucide-react';

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
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg-page">
      <div className="auth-bg-image" />
      <div className="auth-bg-overlay" />

      {/* Top-left logo */}
      <div className="auth-top-logo">
        <div className="auth-logo-icon"><Wallet size={16} /></div>
        <span>Retain</span>
      </div>

      {/* Card */}
      <div className="auth-centered-card">
        <div className="auth-avatar">
          <User size={32} />
        </div>

        <h2 className="auth-centered-title">Login</h2>

        {error && <p className="error-message" style={{ textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSubmit} className="auth-centered-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-icon-wrap">
              <Mail size={15} className="input-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane.doe@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrap">
              <Lock size={15} className="input-icon" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="auth-forgot">
              <a href="#">Forgot password?</a>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>

      <div />
    </div>
  );
}

export default Login;
