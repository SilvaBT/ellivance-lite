export default function App() {
  return (
    <>
      <header className="navbar">
        <div className="navbar__inner">
          <span className="brand">Ellivance</span>
          <span className="pill pill--accent">Events</span>
        </div>
      </header>

      <main className="page">
        <section className="card stack">
          <span className="eyebrow">Gather together</span>
          <h1>Post an event, or RSVP to one.</h1>
          <p className="help-text">
            Ellivance makes it simple to share upcoming events and reserve a place.
          </p>
        </section>
      </main>
    </>
  );
}
