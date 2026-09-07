import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Navbar from '../components/Navbar.jsx';
import EventCard from '../components/EventCard.jsx';

const DATE_FILTERS = {
  any: { label: 'Any time' },
  today: { label: 'Today' },
  week: { label: 'This week' },
  month: { label: 'This month' },
};

function dateRangeFor(key) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (key === 'today') {
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return [start, end];
  }
  if (key === 'week') {
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return [start, end];
  }
  if (key === 'month') {
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return [start, end];
  }
  return [start, null];
}

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('any');

  useEffect(() => {
    setLoading(true);
    const [start, end] = dateRangeFor(dateFilter);
    let query = supabase
      .from('events')
      .select('*')
      .gte('event_date', start.toISOString().slice(0, 10))
      .order('event_date', { ascending: true });
    if (end) query = query.lt('event_date', end.toISOString().slice(0, 10));

    query.then(({ data }) => {
      setEvents(data || []);
      setLoading(false);
    });
  }, [dateFilter]);

  const filtered = events.filter((e) =>
    `${e.title} ${e.location || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="page stack">
        <div>
          <p className="eyebrow">Upcoming</p>
          <h1>Find something happening</h1>
        </div>
        <div className="row row--wrap">
          <input
            className="input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Search by title or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            {Object.entries(DATE_FILTERS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <p className="help-text">Loading events…</p>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            {search || dateFilter !== 'any' ? 'No events match your search.' : 'No upcoming events yet — be the first to post one.'}
          </div>
        ) : (
          <div className="grid grid-cards">
            {filtered.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
    </>
  );
}
