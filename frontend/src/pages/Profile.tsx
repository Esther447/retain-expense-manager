import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck } from 'lucide-react';

function Profile() {
  const { user } = useAuth();

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?';

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
      </main>
    </>
  );
}

export default Profile;
