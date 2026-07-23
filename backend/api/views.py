import json
import time
import math
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from .services import routing
from .services import eld

def _interpolate_point(route_coords, total_miles, mile_marker):
    if not route_coords or total_miles <= 0 or mile_marker <= 0:
        return None
    fraction = min(1.0, mile_marker / total_miles)
    idx = fraction * (len(route_coords) - 1)
    i = int(idx)
    if i >= len(route_coords) - 1:
        lng, lat = route_coords[-1]
        return {"lat": lat, "lng": lng}
    t = idx - i
    lng1, lat1 = route_coords[i]
    lng2, lat2 = route_coords[i + 1]
    return {"lat": round(lat1 + t * (lat2 - lat1), 6), "lng": round(lng1 + t * (lng2 - lng1), 6)}

@csrf_exempt
@require_GET
def suggest_locations(request):
    query = request.GET.get("q", "").strip()
    if len(query) < 2:
        return JsonResponse({"suggestions": []})

    try:
        suggestions = routing.search_locations(query)
    except Exception:
        return JsonResponse({"suggestions": []})

    return JsonResponse({"suggestions": suggestions})


@csrf_exempt
@require_POST
def plan_trip(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    current = body.get("current_location", "").strip()
    pickup = body.get("pickup_location", "").strip()
    dropoff = body.get("dropoff_location", "").strip()
    cycle_used = float(body.get("cycle_used_hours", 0))

    if not all([current, pickup, dropoff]):
        return JsonResponse({"error": "All three locations are required"}, status=400)

    try:
        cur_coords = routing.geocode(current)
        time.sleep(1.1)
        pk_coords = routing.geocode(pickup)
        time.sleep(1.1)
        do_coords = routing.geocode(dropoff)
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)

    waypoints = [cur_coords, pk_coords, do_coords]

    try:
        route_data = routing.get_route(waypoints)
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=502)

    total_miles = route_data["distance_miles"]
    route_coords = route_data["geometry"]["coordinates"]
    route_geojson = [[lng, lat] for lng, lat in route_coords]

    legs = route_data.get("legs", [])
    pickup_distance = legs[0]["distance_miles"] if len(legs) >= 1 else 0
    dropoff_distance = legs[1]["distance_miles"] if len(legs) >= 2 else 0
    route_instructions = [
        {"title": "Start", "description": f"Start from current location: {current}."},
        {"title": "Drive to pickup", "description": f"Drive {pickup_distance:.1f} miles to pickup location."},
        {"title": "Pickup", "description": "Pickup stop at the pickup location (1 hour)."},
        {"title": "Drive to dropoff", "description": f"Drive {dropoff_distance:.1f} miles to dropoff location."},
        {"title": "Drop-off", "description": "Drop-off at destination (1 hour)."},
    ]

    trip_plan = eld.plan_trip(total_miles, cycle_used, pickup_distance)
    daily_logs = eld.generate_daily_logs(trip_plan)

    stops = []
    for day in trip_plan:
        for seg in day["segments"]:
            if seg.get("remark"):
                pos = _interpolate_point(route_coords, total_miles, seg.get("mile_marker", 0))
                stops.append({
                    "day": day["day"],
                    "type": seg["type"],
                    "remark": seg["remark"],
                    "duration_hours": seg["hours"],
                    "mile_marker": seg.get("mile_marker", 0),
                    "lat": pos["lat"] if pos else None,
                    "lng": pos["lng"] if pos else None,
                })

    return JsonResponse({
        "route": {
            "total_miles": round(total_miles, 1),
            "total_drive_hours": round(route_data["duration_hours"], 2),
            "total_days": len(trip_plan),
            "coordinates": route_geojson,
            "instructions": route_instructions,
            "legs": route_data.get("legs", []),
        },
        "waypoints": {
            "current": {"lat": cur_coords[0], "lng": cur_coords[1], "address": current},
            "pickup": {"lat": pk_coords[0], "lng": pk_coords[1], "address": pickup},
            "dropoff": {"lat": do_coords[0], "lng": do_coords[1], "address": dropoff},
        },
        "stops": stops,
        "daily_logs": daily_logs,
    })
