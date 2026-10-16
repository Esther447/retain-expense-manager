import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../services/api';

interface SignupResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
  };
}

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    <main className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Start managing your expenses with Retain.</p>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a password"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

export default Signup;