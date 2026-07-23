import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createColoredIcon(color, label) {
  const size = label ? 28 : 24;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 12}" viewBox="0 0 ${size} ${size + 12}"><path d="M${size / 2} 0C${size * 0.225} 0 0 ${size * 0.225} 0 ${size / 2}c0 ${size * 0.375} ${size / 2} ${size} ${size / 2} ${size}s${size / 2} -${size * 0.625} ${size / 2} -${size}C${size} ${size * 0.225} ${size * 0.775} 0 ${size / 2} 0z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.22}" fill="#fff"/></svg>`;
  return L.divIcon({
    html: svg,
    className: "custom-marker",
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 12],
    popupAnchor: [0, -(size + 6)],
  });
}

const MARKER_COLORS = {
  current: "#fcd535",
  pickup: "#3b82f6",
  dropoff: "#0ecb81",
};

const STOP_COLORS = {
  Fueling: "#f59e0b",
  "30-min Break": "#3b82f6",
  "Off-duty/sleep": "#6b7280",
  "Drop-off": "#0ecb81",
};

function MapView({ routeData, waypoints, stops }) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const routeLayer = useRef(null);
  const markersLayer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;
    mapInstance.current = L.map(mapContainer.current, {
      center: [39.8283, -98.5795],
      zoom: 4,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(mapInstance.current);

    markersLayer.current = L.layerGroup().addTo(mapInstance.current);
    routeLayer.current = L.layerGroup().addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    routeLayer.current.clearLayers();
    markersLayer.current.clearLayers();

    if (routeData?.coordinates && routeData.coordinates.length > 0) {
      const coords = routeData.coordinates.map(([lng, lat]) => [lat, lng]);
      const polyline = L.polyline(coords, {
        color: "#fcd535",
        weight: 4,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round",
      });
      routeLayer.current.addLayer(polyline);
      mapInstance.current.fitBounds(polyline.getBounds().pad(0.15));
    }

    if (waypoints) {
      const { current, pickup, dropoff } = waypoints;
      if (current) {
        const m = L.marker([current.lat, current.lng], { icon: createColoredIcon(MARKER_COLORS.current) })
          .bindPopup(`<strong>Start</strong><br>${current.address}`);
        markersLayer.current.addLayer(m);
      }
      if (pickup) {
        const m = L.marker([pickup.lat, pickup.lng], { icon: createColoredIcon(MARKER_COLORS.pickup) })
          .bindPopup(`<strong>Pickup</strong><br>${pickup.address}`);
        markersLayer.current.addLayer(m);
      }
      if (dropoff) {
        const m = L.marker([dropoff.lat, dropoff.lng], { icon: createColoredIcon(MARKER_COLORS.dropoff) })
          .bindPopup(`<strong>Dropoff</strong><br>${dropoff.address}`);
        markersLayer.current.addLayer(m);
      }
    }

    if (stops && stops.length > 0) {
      const seen = new Set();
      stops.forEach((stop) => {
        if (!stop.lat || !stop.lng) return;
        const key = `${stop.lat},${stop.lng}`;
        if (seen.has(key)) return;
        seen.add(key);

        const color = STOP_COLORS[stop.remark] || "#8b5cf6";
        const dayLabel = `Day ${stop.day}`;
        const popup = `<strong>${stop.remark}</strong><br>${dayLabel} &middot; ${stop.duration_hours}h`;

        const m = L.marker([stop.lat, stop.lng], { icon: createColoredIcon(color, true) }).bindPopup(popup);
        markersLayer.current.addLayer(m);
      });
    }
  }, [routeData, waypoints, stops]);

  return <div ref={mapContainer} className="map-container" />;
}

export default MapView;
