import requests
import time
from urllib.parse import quote

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search?q={q}&format=json&limit=1&countrycodes=us"
NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
OSRM_URL = "https://router.project-osrm.org/route/v1/driving/{coords}?overview=full&geometries=geojson&steps=false&alternatives=false"

HEADERS = {"User-Agent": "EnaSpotter/1.0"}

def geocode(address):
    url = NOMINATIM_URL.format(q=quote(address))
    resp = requests.get(url, headers=HEADERS, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    if not data:
        raise ValueError(f"Could not find location: '{address}'. Try a different address format (e.g. 'Chicago, IL').")
    return float(data[0]["lat"]), float(data[0]["lon"])

def _osrm_route(a, b):
    coords = f"{a[1]},{a[0]};{b[1]},{b[0]}"
    url = OSRM_URL.format(coords=coords)

    for attempt in range(3):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=30)
            if resp.status_code == 429:
                time.sleep(2)
                continue
            if resp.status_code != 200:
                if attempt < 2:
                    time.sleep(1)
                    continue
                raise ValueError(f"Cannot route between these locations — they may be unreachable by road.")
            data = resp.json()
            if data["code"] != "Ok":
                if attempt < 2:
                    time.sleep(1)
                    continue
                raise ValueError(f"Cannot route between these locations — they may be unreachable by road.")
            return data["routes"][0]
        except requests.Timeout:
            if attempt < 2:
                time.sleep(1)
                continue
            raise ValueError(f"Routing timed out. Try again or use simpler location names.")

def search_locations(query):
    params = {
        "q": query,
        "format": "jsonv2",
        "limit": 5,
        "addressdetails": 1,
        "countrycodes": "us",
    }
    resp = requests.get(NOMINATIM_SEARCH_URL, params=params, headers=HEADERS, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    suggestions = []
    for item in data:
        display_name = item.get("display_name", "").strip()
        if not display_name:
            continue
        suggestions.append({
            "display_name": display_name,
            "lat": float(item.get("lat", 0)) if item.get("lat") is not None else None,
            "lon": float(item.get("lon", 0)) if item.get("lon") is not None else None,
            "type": item.get("type", "place"),
        })
    return suggestions


def get_route(waypoints):
    total_dist = 0
    total_dur = 0
    merged_coords = []

    legs_data = []
    for i in range(len(waypoints) - 1):
        leg = _osrm_route(waypoints[i], waypoints[i + 1])
        total_dist += leg["distance"]
        total_dur += leg["duration"]
        coords = leg["geometry"]["coordinates"]
        if i > 0 and merged_coords:
            merged_coords.extend(coords[1:])
        else:
            merged_coords.extend(coords)

        legs_data.append({
            "distance_miles": round(leg["distance"] * 0.000621371, 1),
            "duration_hours": round(leg["duration"] / 3600, 2),
        })

    return {
        "distance_miles": round(total_dist * 0.000621371, 1),
        "duration_hours": round(total_dur / 3600, 2),
        "geometry": {"type": "LineString", "coordinates": merged_coords},
        "legs": legs_data,
    }
