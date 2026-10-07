import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <header className="page-header">
          <div>
            <h1>Profile</h1>
            <p>View your Retain account information.</p>
          </div>
        </header>

        <section className="profile-card">
          <div className="profile-row">
            <span>Name</span>
            <strong>{user?.name || 'Not available'}</strong>
          </div>

          <div className="profile-row">
            <span>Email</span>
            <strong>{user?.email || 'Not available'}</strong>
          </div>

          <div className="profile-row">
            <span>Role</span>
            <strong>{user?.role || 'Not available'}</strong>
          </div>
        </section>
      </main>
    </>
  );
}

export default Profile;
