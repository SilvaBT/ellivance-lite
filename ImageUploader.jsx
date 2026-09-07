import { useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth.jsx';

export default function ImageUploader({ value, onChange, bucket = 'event-banners', label = 'Event banner (optional)', round = false }) {
  const { user } = useAuth();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file) {
    if (!file || !user) return;
    setError('');
    setUploading(true);
    // Storage policy requires the first path segment to be the uploader's
    // own user ID (e.g. "93f52.../173-banner.jpg") — anything else is
    // rejected by Row Level Security before it ever reaches the bucket.
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `${user.id}/${Date.now()}-${cleanName}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file);
    setUploading(false);
    if (uploadError) return setError(uploadError.message);
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
  }

  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="dropzone" onClick={() => inputRef.current?.click()}>
        {value ? (
          <img src={value} alt="" style={round ? { borderRadius: '50%', width: 96, height: 96, objectFit: 'cover' } : undefined} />
        ) : null}
        <p style={{ margin: 0 }}>{uploading ? 'Uploading…' : value ? 'Click to replace image' : 'Click to choose an image'}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
