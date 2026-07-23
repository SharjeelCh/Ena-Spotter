import { useState } from "react";

function TripForm({ onSubmit, loading }) {
  const [currentLocation, setCurrentLocation] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [cycleUsed, setCycleUsed] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!currentLocation || !pickupLocation || !dropoffLocation) return;
    onSubmit({
      current_location: currentLocation,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      cycle_used_hours: parseFloat(cycleUsed) || 0,
    });
  }

  return (
    <div className="trip-form-card">
      <h2 className="trip-form-title">Plan Your Trip</h2>
      <form onSubmit={handleSubmit} className="trip-form">
        <label className="trip-form-field">
          <span className="trip-form-label">Current Location</span>
          <input
            type="text"
            className="trip-form-input"
            placeholder="e.g. Chicago, IL"
            value={currentLocation}
            onChange={(e) => setCurrentLocation(e.target.value)}
            required
          />
        </label>
        <label className="trip-form-field">
          <span className="trip-form-label">Pickup Location</span>
          <input
            type="text"
            className="trip-form-input"
            placeholder="e.g. Dallas, TX"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
          />
        </label>
        <label className="trip-form-field">
          <span className="trip-form-label">Dropoff Location</span>
          <input
            type="text"
            className="trip-form-input"
            placeholder="e.g. Los Angeles, CA"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            required
          />
        </label>
        <label className="trip-form-field">
          <span className="trip-form-label">Current Cycle Used (Hrs)</span>
          <input
            type="number"
            className="trip-form-input"
            placeholder="0"
            min="0"
            max="70"
            step="0.5"
            value={cycleUsed}
            onChange={(e) => setCycleUsed(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !currentLocation || !pickupLocation || !dropoffLocation}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="spinner" />
              Planning...
            </span>
          ) : (
            "Plan Trip"
          )}
        </button>
      </form>
    </div>
  );
}

export default TripForm;
