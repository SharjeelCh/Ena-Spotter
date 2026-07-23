import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://sharjeel.pythonanywhere.com/api";

function TripForm({ onSubmit, loading }) {
  const [currentLocation, setCurrentLocation] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [cycleUsed, setCycleUsed] = useState("");
  const [suggestions, setSuggestions] = useState({ current: [], pickup: [], dropoff: [] });
  const [activeField, setActiveField] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!activeField) return;

    const fieldKeyMap = {
      current: currentLocation,
      pickup: pickupLocation,
      dropoff: dropoffLocation,
    };

    const query = (fieldKeyMap[activeField] || "").trim();
    if (query.length < 2) {
      setSuggestions((prev) => ({ ...prev, [activeField]: [] }));
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`${API_URL}/suggest-locations/?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Unable to load suggestions");
        const data = await res.json();
        setSuggestions((prev) => ({ ...prev, [activeField]: data.suggestions || [] }));
      } catch {
        setSuggestions((prev) => ({ ...prev, [activeField]: [] }));
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [activeField, currentLocation, pickupLocation, dropoffLocation]);

  function handleSelectSuggestion(field, suggestion) {
    const value = suggestion.display_name;
    if (field === "current") {
      setCurrentLocation(value);
    } else if (field === "pickup") {
      setPickupLocation(value);
    } else {
      setDropoffLocation(value);
    }
    setSuggestions((prev) => ({ ...prev, [field]: [] }));
    setActiveField(null);
  }

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
            onFocus={() => setActiveField("current")}
            onBlur={() => window.setTimeout(() => setActiveField(null), 150)}
            onChange={(e) => setCurrentLocation(e.target.value)}
            required
          />
          {activeField === "current" && (
            <div className="trip-form-suggestions" role="listbox">
              {isSearching && <div className="trip-form-suggestion-empty">Searching locations...</div>}
              {!isSearching && currentLocation.trim().length >= 2 && suggestions.current.length === 0 && (
                <div className="trip-form-suggestion-empty">No matching places found. Try a city, state, or ZIP code.</div>
              )}
              {!isSearching && suggestions.current.map((suggestion, index) => (
                <button
                  key={`${suggestion.display_name}-${index}`}
                  type="button"
                  className="trip-form-suggestion"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectSuggestion("current", suggestion)}
                >
                  <span className="trip-form-suggestion-main">{suggestion.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </label>
        <label className="trip-form-field">
          <span className="trip-form-label">Pickup Location</span>
          <input
            type="text"
            className="trip-form-input"
            placeholder="e.g. Dallas, TX"
            value={pickupLocation}
            onFocus={() => setActiveField("pickup")}
            onBlur={() => window.setTimeout(() => setActiveField(null), 150)}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
          />
          {activeField === "pickup" && (
            <div className="trip-form-suggestions" role="listbox">
              {isSearching && <div className="trip-form-suggestion-empty">Searching locations...</div>}
              {!isSearching && pickupLocation.trim().length >= 2 && suggestions.pickup.length === 0 && (
                <div className="trip-form-suggestion-empty">No matching places found. Try a city, state, or ZIP code.</div>
              )}
              {!isSearching && suggestions.pickup.map((suggestion, index) => (
                <button
                  key={`${suggestion.display_name}-${index}`}
                  type="button"
                  className="trip-form-suggestion"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectSuggestion("pickup", suggestion)}
                >
                  <span className="trip-form-suggestion-main">{suggestion.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </label>
        <label className="trip-form-field">
          <span className="trip-form-label">Dropoff Location</span>
          <input
            type="text"
            className="trip-form-input"
            placeholder="e.g. Los Angeles, CA"
            value={dropoffLocation}
            onFocus={() => setActiveField("dropoff")}
            onBlur={() => window.setTimeout(() => setActiveField(null), 150)}
            onChange={(e) => setDropoffLocation(e.target.value)}
            required
          />
          {activeField === "dropoff" && (
            <div className="trip-form-suggestions" role="listbox">
              {isSearching && <div className="trip-form-suggestion-empty">Searching locations...</div>}
              {!isSearching && dropoffLocation.trim().length >= 2 && suggestions.dropoff.length === 0 && (
                <div className="trip-form-suggestion-empty">No matching places found. Try a city, state, or ZIP code.</div>
              )}
              {!isSearching && suggestions.dropoff.map((suggestion, index) => (
                <button
                  key={`${suggestion.display_name}-${index}`}
                  type="button"
                  className="trip-form-suggestion"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectSuggestion("dropoff", suggestion)}
                >
                  <span className="trip-form-suggestion-main">{suggestion.display_name}</span>
                </button>
              ))}
            </div>
          )}
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
