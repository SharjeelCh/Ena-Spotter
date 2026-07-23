function TopNav() {
  return (
    <nav className="top-nav">
      <div className="top-nav-inner">
        <div className="top-nav-brand">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="6" fill="var(--color-primary)" />
            <path d="M8 14l4-4 4 4-4 4-4-4z" fill="var(--color-on-primary)" />
            <path d="M14 8l4 4-4 4" stroke="var(--color-on-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span className="top-nav-title">ENA-SPOTTER</span>
        </div>
        <span className="top-nav-tagline">Trip Planner &bull; ELD Logs</span>
      </div>
    </nav>
  );
}

export default TopNav;
