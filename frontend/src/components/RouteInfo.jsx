function RouteInfo({ routeData, waypoints, stops }) {
  if (!routeData) return null;

  return (
    <div className="route-info">
      <div className="route-info-header">
        <h3 className="route-info-title">Trip Overview</h3>
        <span className="route-info-badge">{routeData.total_days} day{routeData.total_days > 1 ? "s" : ""}</span>
      </div>

      <div className="route-stats">
        <div className="route-stat">
          <span className="route-stat-value">{routeData.total_miles.toLocaleString()}</span>
          <span className="route-stat-label">Total Miles</span>
        </div>
        <div className="route-stat">
          <span className="route-stat-value">{routeData.total_drive_hours.toFixed(1)}</span>
          <span className="route-stat-label">Drive Hours</span>
        </div>
        <div className="route-stat">
          <span className="route-stat-value">{routeData.total_days}</span>
          <span className="route-stat-label">Days</span>
        </div>
        <div className="route-stat">
          <span className="route-stat-value route-stat-up">{Math.round(routeData.total_miles / routeData.total_drive_hours)}</span>
          <span className="route-stat-label">Avg MPH</span>
        </div>
      </div>

      {waypoints && (
        <div className="route-waypoints">
          <div className="route-waypoint">
            <span className="wp-dot wp-dot-yellow" />
            <div>
              <span className="wp-label">Current</span>
              <span className="wp-address">{waypoints.current?.address}</span>
            </div>
          </div>
          <div className="route-waypoint">
            <span className="wp-dot wp-dot-blue" />
            <div>
              <span className="wp-label">Pickup</span>
              <span className="wp-address">{waypoints.pickup?.address}</span>
            </div>
          </div>
          <div className="route-waypoint">
            <span className="wp-dot wp-dot-green" />
            <div>
              <span className="wp-label">Dropoff</span>
              <span className="wp-address">{waypoints.dropoff?.address}</span>
            </div>
          </div>
        </div>
      )}

      {routeData.instructions?.length > 0 && (
        <div className="route-instructions">
          <div className="route-instructions-header">
            <span className="route-instructions-icon" aria-hidden="true">🗺️</span>
            <div>
              <h4 className="route-instructions-title">Route Instructions</h4>
              <p className="route-instructions-subtitle">Visual step cards for pickup, driving, fueling and dropoff.</p>
            </div>
          </div>
          <div className="route-steps">
            {routeData.instructions.map((item, index) => (
              <div key={index} className="route-step-item">
                <span className="route-step-badge">{index + 1}</span>
                <div className="route-step-content">
                  <span className="route-step-label">{item.title}</span>
                  <p className="route-step-desc">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stops && stops.length > 0 && (
        <div className="route-stops">
          <h4 className="route-stops-title">Stops &amp; Rests</h4>
          <div className="route-stops-list">
            {stops.map((stop, i) => (
              <div key={i} className="route-stop-item">
                <span className={`stop-type stop-type-${stop.type.toLowerCase()}`}>
                  {stop.type}
                </span>
                <span className="stop-remark">{stop.remark}</span>
                <span className="stop-duration">{stop.duration_hours.toFixed(1)}h</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteInfo;
