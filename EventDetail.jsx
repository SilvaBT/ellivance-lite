import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth.jsx';
import Navbar from '../components/Navbar.jsx';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [organiser, setOrganiser] = useState(null);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [myRsvp, setMyRsvp] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shareMsg, setShareMsg] = useState('');

  async function load() {
    const { data: ev } = await supabase.from('events').select('*').eq('id', id).single();
    if (!ev) return;
    setEvent(ev);

    const { data: org } = await supabase.from('profiles').select('full_name').eq('id', ev.organiser_id).single();
    setOrganiser(org);

    const { count } = await supabase.from('rsvps').select('id', { count: 'exact', head: true }).eq('event_id', id);
    setRsvpCount(count || 0);

    if (user) {
      const { data: mine } = await supabase.from('rsvps').select('*').eq('event_id', id).eq('user_id', user.id).maybeSingle();
      setMyRsvp(mine);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  async function handleRSVP() {
    if (!user) return navigate('/login');
    setBusy(true);
    setError('');
    const { error: err } = await supabase.from('rsvps').insert({ event_id: id, user_id: user.id });
    setBusy(false);
    if (err) return setError(err.message.includes('fully booked') ? err.message : 'Could not book a place — please try again.');
    load();
  }

  async function handleCancel() {
    setBusy(true);
    await supabase.from('rsvps').delete().eq('event_id', id).eq('user_id', user.id);
    setBusy(false);
    load();
  }

  async function handleDelete() {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    await supabase.from('events').delete().eq('id', id);
    navigate('/dashboard');
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: `You're invited: ${event.title}`, url });
      } catch {
        // user cancelled the share sheet — no error needed
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setShareMsg('Link copied!');
    setTimeout(() => setShareMsg(''), 2000);
  }

  if (!event) return (<><Navbar /><div className="page">Loading…</div></>);

  const isOrganiser = user?.id === event.organiser_id;
  const full = event.capacity != null && rsvpCount >= event.capacity;
  const date = new Date(`${event.event_date}T${event.start_time || '00:00'}`);

  return (
    <>
      <Navbar />
      <div className="page page--narrow stack">
        {event.banner_url && <img src={event.banner_url} alt="" style={{ width: '100%', borderRadius: 14, aspectRatio: '16/9', objectFit: 'cover' }} />}

        <div className="row row--between">
          <div>
            <p className="eyebrow">{date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1>{event.title}</h1>
            <p className="help-text">
              {event.start_time ? date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) + ' · ' : ''}
              {event.location || 'Location TBA'}
            </p>
            <p className="help-text">Hosted by {organiser?.full_name || 'someone'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button className="btn btn--ghost btn--sm" onClick={handleShare}>🔗 Share</button>
            {shareMsg && <p className="help-text" style={{ margin: '4px 0 0' }}>{shareMsg}</p>}
          </div>
        </div>

        {event.description && <p style={{ whiteSpace: 'pre-wrap' }}>{event.description}</p>}

        <div className="card row row--between">
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>
              {event.capacity != null ? `${rsvpCount} / ${event.capacity} booked` : `${rsvpCount} booked`}
            </p>
            {full && !myRsvp && <span className="pill pill--danger">Fully booked</span>}
          </div>
          {isOrganiser ? (
            <div className="row">
              <Link to={`/edit/${event.id}`} className="btn btn--ghost btn--sm">Edit</Link>
              <button className="btn btn--danger btn--sm" onClick={handleDelete}>Delete</button>
            </div>
          ) : myRsvp ? (
            <button className="btn btn--ghost" onClick={handleCancel} disabled={busy}>
              {busy ? 'Cancelling…' : "You're going — cancel"}
            </button>
          ) : (
            <button className="btn btn--primary" onClick={handleRSVP} disabled={busy || full}>
              {busy ? 'Booking…' : full ? 'Fully booked' : 'RSVP — book a place'}
            </button>
          )}
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>
    </>
  );
}
