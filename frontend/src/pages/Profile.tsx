import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <header className="page-header">
          <div>
            <h1>Profile</h1>
            <p>Your Retain account information.</p>
          </div>
        </header>

        <div className="profile-grid">
          <section className="profile-card">
            <div className="profile-avatar-row">
              <div className="profile-avatar">{initial}</div>
              <div>
                <p className="profile-name">{user?.name}</p>
                <span className={`role-badge role-${user?.role ?? 'user'}`}>
                  {user?.role ?? 'user'}
                </span>
              </div>
            </div>

            <div className="profile-row">
              <span><User size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Name</span>
              <strong>{user?.name || '—'}</strong>
            </div>

            <div className="profile-row">
              <span><Mail size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Email</span>
              <strong>{user?.email || '—'}</strong>
            </div>

            <div className="profile-row">
              <span><ShieldCheck size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Role</span>
              <span className={`role-badge role-${user?.role ?? 'user'}`}>
                {user?.role ?? 'user'}
              </span>
            </div>
          </section>

          <section className="profile-settings-card">
            <h2>Account</h2>
            <p>Manage your Retain session.</p>

            <hr className="profile-divider" />

            <div className="profile-danger-zone">
              <h3>Sign Out</h3>
              <p>You will be returned to the login screen.</p>
              <button
                type="button"
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', boxShadow: '0 0 16px rgba(239,68,68,0.3)' }}
                onClick={handleLogout}
              >
                <LogOut size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Sign Out
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default Profile;
