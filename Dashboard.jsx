import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth.jsx';
import Navbar from '../components/Navbar.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('posted');
  const [myEvents, setMyEvents] = useState([]);
  const [myRsvps, setMyRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('events').select('*').eq('organiser_id', user.id).order('event_date', { ascending: true }),
      supabase.from('rsvps').select('*, events (*)').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]).then(([events, rsvps]) => {
      setMyEvents(events.data || []);
      setMyRsvps((rsvps.data || []).filter((r) => r.events));
      setLoading(false);
    });
  }, [user?.id]);

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="page stack">
        <div className="row row--between row--wrap">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Your events</h1>
          </div>
          <Link to="/create" className="btn btn--primary">+ Post event</Link>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'posted' ? 'tab--active' : ''}`} onClick={() => setTab('posted')}>Posted by you ({myEvents.length})</button>
          <button className={`tab ${tab === 'rsvps' ? 'tab--active' : ''}`} onClick={() => setTab('rsvps')}>Your RSVPs ({myRsvps.length})</button>
        </div>

        {loading ? (
          <p className="help-text">Loading…</p>
        ) : tab === 'posted' ? (
          myEvents.length === 0 ? (
            <div className="card empty-state">You haven't posted an event yet. <Link to="/create">Post one now</Link>.</div>
          ) : (
            <div className="stack-sm">
              {myEvents.map((e) => (
                <Link key={e.id} to={`/events/${e.id}`} className="card row row--between">
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{e.title}</p>
                    <p className="help-text" style={{ margin: 0 }}>{new Date(e.event_date).toLocaleDateString()}</p>
                  </div>
                  <span className="help-text">Manage →</span>
                </Link>
              ))}
            </div>
          )
        ) : myRsvps.length === 0 ? (
          <div className="card empty-state">No RSVPs yet — <Link to="/">browse events</Link> and book a place.</div>
        ) : (
          <div className="stack-sm">
            {myRsvps.map((r) => (
              <Link key={r.id} to={`/events/${r.events.id}`} className="card row row--between">
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{r.events.title}</p>
                  <p className="help-text" style={{ margin: 0 }}>{new Date(r.events.event_date).toLocaleDateString()}</p>
                </div>
                <span className="pill pill--accent">Going</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
