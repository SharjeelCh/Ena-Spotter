import { useState } from "react";
import TopNav from "./components/TopNav";
import TripForm from "./components/TripForm";
import MapView from "./components/MapView";
import RouteInfo from "./components/RouteInfo";
import EldLogs from "./components/EldLogs";
import Footer from "./components/Footer";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "https://sharjeel.pythonanywhere.com/api";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [waypoints, setWaypoints] = useState(null);
  const [stops, setStops] = useState(null);
  const [dailyLogs, setDailyLogs] = useState(null);
  const [planned, setPlanned] = useState(false);

  async function handlePlanTrip(inputs) {
    setLoading(true);
    setError(null);
    setRouteData(null);
    setWaypoints(null);
    setStops(null);
    setDailyLogs(null);
    setPlanned(false);

    try {
      const res = await fetch(`${API_URL}/plan-trip/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      setRouteData(data.route);
      setWaypoints(data.waypoints);
      setStops(data.stops);
      setDailyLogs(data.daily_logs);
      setPlanned(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setRouteData(null);
    setWaypoints(null);
    setStops(null);
    setDailyLogs(null);
    setPlanned(false);
    setError(null);
  }

  return (
    <>
      <TopNav />

      <main className="main-content">
        <div className="main-layout">
          <aside className="sidebar">
            <TripForm onSubmit={handlePlanTrip} loading={loading} />
          </aside>

          <div className="content-area">
            {error && (
              <div className="error-banner">
                <span className="error-icon" aria-hidden="true">!</span>
                <span>{error}</span>
                <button className="error-dismiss" onClick={() => setError(null)} aria-label="Dismiss error">&times;</button>
              </div>
            )}

            {!planned ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                    <circle cx="32" cy="32" r="28" stroke="var(--color-surface-elevated-dark)" strokeWidth="2" />
                    <path d="M20 32h24M32 20v24" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="32" cy="32" r="6" fill="var(--color-primary)" />
                  </svg>
                </div>
                <h2 className="empty-title">Plan Your Next Trip</h2>
                <p className="empty-text">
                  Enter your current location, pickup, and dropoff to generate a HOS-compliant route with ELD log sheets.
                </p>
              </div>
            ) : (
              <>
                <div className="map-section">
                  <MapView routeData={routeData} waypoints={waypoints} stops={stops} />
                </div>

                <div className="results-panel">
                  <RouteInfo routeData={routeData} waypoints={waypoints} stops={stops} />
                </div>

                <EldLogs dailyLogs={dailyLogs} />
              </>
            )}

            {planned && (
              <div className="plan-actions">
                <button className="btn-secondary" onClick={handleReset}>
                  Plan New Trip
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default App;
