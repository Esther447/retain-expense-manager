import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Retain
      </Link>

      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/budget">Budget</Link>
        <Link to="/profile">Profile</Link>

        <span>{user?.name}</span>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;