import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth.jsx';
import Navbar from '../components/Navbar.jsx';
import ImageUploader from '../components/ImageUploader.jsx';

const EMPTY = { title: '', description: '', location: '', event_date: '', start_time: '', capacity: '', banner_url: '' };

export default function EventForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    supabase.from('events').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setForm({ ...EMPTY, ...data, capacity: data.capacity ?? '' });
      setLoading(false);
    });
  }, [id, isEdit]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.event_date) {
      return setError('Title and date are required.');
    }
    setSaving(true);
    const payload = {
      organiser_id: user.id,
      title: form.title.trim(),
      description: form.description || null,
      location: form.location || null,
      event_date: form.event_date,
      start_time: form.start_time || null,
      capacity: form.capacity ? Number(form.capacity) : null,
      banner_url: form.banner_url || null,
    };

    const result = isEdit
      ? await supabase.from('events').update(payload).eq('id', id).select().single()
      : await supabase.from('events').insert(payload).select().single();

    setSaving(false);
    if (result.error) return setError(result.error.message);
    navigate(`/events/${result.data.id}`);
  }

  if (loading) return (<><Navbar /><div className="page">Loading…</div></>);

  return (
    <>
      <Navbar />
      <div className="page page--narrow">
        <div className="card stack">
          <div>
            <p className="eyebrow">{isEdit ? 'Edit event' : 'Post an event'}</p>
            <h1>{isEdit ? 'Update details' : 'What are you hosting?'}</h1>
          </div>
          <form className="stack" onSubmit={handleSubmit}>
            <div className="field">
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Sunset Rooftop Jazz Night" />
            </div>
            <div className="field">
              <label className="label">Description</label>
              <textarea className="textarea" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What should people expect?" />
            </div>
            <div className="field">
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Address or 'Online'" />
            </div>
            <div className="grid grid-2">
              <div className="field">
                <label className="label">Date</label>
                <input type="date" className="input" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Start time</label>
                <input type="time" className="input" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label className="label">Capacity (leave blank for unlimited)</label>
              <input type="number" min="1" className="input" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} />
            </div>
            <ImageUploader value={form.banner_url} onChange={(v) => set('banner_url', v)} />
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn--primary btn--block" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Post event'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
