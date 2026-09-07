import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="brand">Ellivance</Link>
        <div className="row">
          {user ? (
            <>
              <Link to="/create" className="btn btn--primary btn--sm">+ Post event</Link>
              <Link to="/dashboard" className="btn btn--ghost btn--sm">My events</Link>
              <Link to="/profile" className="row" style={{ gap: 6 }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span
                    style={{
                      width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-soft)',
                      color: '#8a4f14', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                    }}
                  >
                    {(profile?.full_name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
              <button className="btn btn--ghost btn--sm" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--sm">Sign in</Link>
              <Link to="/signup" className="btn btn--primary btn--sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
