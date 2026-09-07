import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth.jsx';
import Navbar from '../components/Navbar.jsx';
import ImageUploader from '../components/ImageUploader.jsx';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), avatar_url: avatarUrl || null })
      .eq('id', user.id);
    setSaving(false);
    if (err) return setError(err.message);
    await refreshProfile();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <>
      <Navbar />
      <div className="page page--narrow">
        <div className="card stack">
          <div>
            <p className="eyebrow">Your profile</p>
            <h1>Edit profile</h1>
          </div>
          <form className="stack" onSubmit={handleSave}>
            <ImageUploader
              bucket="avatars"
              label="Profile photo"
              round
              value={avatarUrl}
              onChange={setAvatarUrl}
            />
            <div className="field">
              <label className="label">Full name</label>
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Email</label>
              <input className="input" value={user?.email || ''} disabled />
              <p className="help-text" style={{ margin: 0 }}>Email can't be changed here.</p>
            </div>
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn--primary btn--block" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && <p className="help-text" style={{ textAlign: 'center' }}>Saved.</p>}
          </form>
        </div>
      </div>
    </>
  );
}
