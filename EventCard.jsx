import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const date = new Date(`${event.event_date}T${event.start_time || '00:00'}`);
  return (
    <Link to={`/events/${event.id}`} className="event-card">
      {event.banner_url ? (
        <img className="event-card__banner" src={event.banner_url} alt="" />
      ) : (
        <div className="event-card__banner" />
      )}
      <div className="event-card__body stack-sm">
        <p className="eyebrow" style={{ margin: 0 }}>
          {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
        <h3 style={{ fontSize: 18 }}>{event.title}</h3>
        <p className="help-text" style={{ margin: 0 }}>{event.location || 'Location TBA'}</p>
      </div>
    </Link>
  );
}
