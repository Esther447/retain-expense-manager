import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, Wallet, User, ShieldCheck, LogOut } from 'lucide-react';
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
      <Link to="/" className="navbar-brand">Retain</Link>

      <div className="navbar-links">
        <Link to="/"><LayoutDashboard size={14} className="nav-icon" />Dashboard</Link>
        <Link to="/expenses"><Receipt size={14} className="nav-icon" />Expenses</Link>
        <Link to="/budget"><Wallet size={14} className="nav-icon" />Budget</Link>
        <Link to="/profile"><User size={14} className="nav-icon" />Profile</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="nav-admin">
            <ShieldCheck size={14} className="nav-icon" />Admin
          </Link>
        )}

        <span className="nav-user">{user?.name}</span>

        <button type="button" onClick={handleLogout}>
          <LogOut size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
