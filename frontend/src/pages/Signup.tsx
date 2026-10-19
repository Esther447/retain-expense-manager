import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../services/api';
import { Mail, Lock, User, UserPlus, Wallet } from 'lucide-react';

interface SignupResponse {
  token: string;
  user: { id: number; name: string; email: string; role: 'user' | 'admin' };
}

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await apiPost<SignupResponse>('/auth/signup', { name, email, password });
      localStorage.setItem('token', data.token);
      login(data.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
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
          <UserPlus size={32} />
        </div>

        <h2 className="auth-centered-title">Create Account</h2>

        {error && <p className="error-message" style={{ textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSubmit} className="auth-centered-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-icon-wrap">
              <User size={15} className="input-icon" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
          </div>

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
                placeholder="Min. 6 characters"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <div className="input-icon-wrap">
              <Lock size={15} className="input-icon" />
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>

      <div />
    </div>
  );
}

export default Signup;
