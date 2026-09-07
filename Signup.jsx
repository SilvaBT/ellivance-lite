import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar.jsx';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setBusy(false);
    if (err) return setError(err.message);
    navigate('/dashboard');
  }

  return (
    <>
      <Navbar />
      <div className="page page--narrow">
        <div className="card stack">
          <div>
            <p className="eyebrow">Get started</p>
            <h1>Create your account</h1>
          </div>
          <form className="stack" onSubmit={handleSubmit}>
            <div className="field">
              <label className="label">Full name</label>
              <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn--primary btn--block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
          </form>
          <p className="help-text">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </>
  );
}
