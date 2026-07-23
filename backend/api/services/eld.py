import math

MAX_DRIVE_HOURS = 11
MAX_ON_DUTY_HOURS = 14
MIN_REST_HOURS = 10
BREAK_AFTER_HOURS = 8
BREAK_DURATION = 0.5
FUEL_INTERVAL_MILES = 1000
FUEL_DURATION = 0.5
PICKUP_DURATION = 1
DROPOFF_DURATION = 1
AVG_SPEED_MPH = 55

STATUS_OFF = "OFF"
STATUS_SB = "SB"
STATUS_D = "D"
STATUS_ON = "ON"

def plan_trip(total_distance_miles, cycle_used_hours, pickup_distance_miles=0):
    total_drive_hours = total_distance_miles / AVG_SPEED_MPH
    remaining_cycle_hours = 70 - cycle_used_hours
    max_drive_for_trip = min(total_drive_hours, remaining_cycle_hours)
    days = []
    remaining_drive = max_drive_for_trip
    day_index = 0
    trip_miles_so_far = 0

    while remaining_drive > 0.01:
        day_plan = _plan_day(remaining_drive, trip_miles_so_far, total_distance_miles, pickup_distance_miles)
        days.append({
            "day": day_index + 1,
            "segments": day_plan["segments"],
            "total_drive_hours": round(day_plan["drive_today"], 2),
            "total_on_duty_hours": round(day_plan["on_duty_today"], 2),
            "total_distance_miles": round(day_plan["distance_today"], 1),
            "carrier": "Ena-Spotter Logistics",
            "driver": "Driver",
            "truck_number": "UNIT-001",
        })
        remaining_drive -= day_plan["drive_today"]
        trip_miles_so_far += day_plan["distance_today"]
        day_index += 1
    return days

def _needs_fuel(miles_covered_before, miles_after, total_miles):
    if miles_after <= 0:
        return False
    for checkpoint in range(FUEL_INTERVAL_MILES, int(total_miles) + FUEL_INTERVAL_MILES, FUEL_INTERVAL_MILES):
        if miles_covered_before < checkpoint <= miles_after:
            return checkpoint
    return False

def _plan_day(remaining_drive, trip_miles_so_far, total_miles, pickup_distance):
    segments = []
    drive_today = 0
    on_duty_today = 0
    distance_today = 0
    current_hour = 0.0
    drive_streak = 0.0
    day_mile_marker = trip_miles_so_far
    pickup_done = trip_miles_so_far >= pickup_distance - 0.01

    if on_duty_today + 0.5 <= MAX_ON_DUTY_HOURS:
        segments.append({"type": STATUS_ON, "start_hour": round(current_hour, 2), "end_hour": round(current_hour + 0.5, 2), "hours": 0.5, "mile_marker": day_mile_marker})
        current_hour += 0.5
        on_duty_today += 0.5

    while drive_today < remaining_drive - 0.01 and on_duty_today < MAX_ON_DUTY_HOURS - 0.01:
        start_miles = trip_miles_so_far + distance_today

        if not pickup_done and start_miles >= pickup_distance - 0.01:
            if on_duty_today + PICKUP_DURATION <= MAX_ON_DUTY_HOURS:
                segments.append({
                    "type": STATUS_ON,
                    "start_hour": round(current_hour, 2),
                    "end_hour": round(current_hour + PICKUP_DURATION, 2),
                    "hours": PICKUP_DURATION,
                    "remark": "Pickup",
                    "mile_marker": round(start_miles, 1),
                })
                current_hour += PICKUP_DURATION
                on_duty_today += PICKUP_DURATION
                drive_streak = 0
                pickup_done = True
                continue
            break

        max_seg = min(
            remaining_drive - drive_today,
            MAX_DRIVE_HOURS - drive_today,
            MAX_ON_DUTY_HOURS - on_duty_today,
        )
        if drive_streak < BREAK_AFTER_HOURS:
            max_seg = min(max_seg, BREAK_AFTER_HOURS - drive_streak)
        max_seg = max(0, max_seg)
        if max_seg < 0.1:
            break

        drive_miles = max_seg * AVG_SPEED_MPH
        end_miles = start_miles + drive_miles
        fuel_checkpoint = _needs_fuel(start_miles, end_miles, total_miles)
        pickup_checkpoint = None
        if not pickup_done and start_miles + 0.01 < pickup_distance <= end_miles + 0.01:
            pickup_checkpoint = pickup_distance

        if pickup_checkpoint and (not fuel_checkpoint or pickup_checkpoint <= fuel_checkpoint):
            miles_to_pickup = pickup_checkpoint - start_miles
            drive_hours_to_pickup = miles_to_pickup / AVG_SPEED_MPH
            if drive_hours_to_pickup > 0.01:
                seg_miles = start_miles
                segments.append({
                    "type": STATUS_D,
                    "start_hour": round(current_hour, 2),
                    "end_hour": round(current_hour + drive_hours_to_pickup, 2),
                    "hours": round(drive_hours_to_pickup, 2),
                    "mile_marker": round(seg_miles, 1),
                })
                current_hour += drive_hours_to_pickup
                drive_today += drive_hours_to_pickup
                distance_today += miles_to_pickup
                on_duty_today += drive_hours_to_pickup
                drive_streak += drive_hours_to_pickup

            if on_duty_today + PICKUP_DURATION <= MAX_ON_DUTY_HOURS:
                seg_miles = trip_miles_so_far + distance_today
                segments.append({
                    "type": STATUS_ON,
                    "start_hour": round(current_hour, 2),
                    "end_hour": round(current_hour + PICKUP_DURATION, 2),
                    "hours": PICKUP_DURATION,
                    "remark": "Pickup",
                    "mile_marker": round(seg_miles, 1),
                })
                current_hour += PICKUP_DURATION
                on_duty_today += PICKUP_DURATION
                drive_streak = 0
                pickup_done = True
                continue
            break

        if fuel_checkpoint:
            miles_to_fuel = fuel_checkpoint - start_miles
            drive_hours_to_fuel = miles_to_fuel / AVG_SPEED_MPH
            if drive_hours_to_fuel > 0.01:
                seg_miles = start_miles
                segments.append({"type": STATUS_D, "start_hour": round(current_hour, 2), "end_hour": round(current_hour + drive_hours_to_fuel, 2), "hours": round(drive_hours_to_fuel, 2), "mile_marker": round(seg_miles, 1)})
                current_hour += drive_hours_to_fuel
                drive_today += drive_hours_to_fuel
                distance_today += miles_to_fuel
                on_duty_today += drive_hours_to_fuel
                drive_streak += drive_hours_to_fuel

            if on_duty_today + FUEL_DURATION <= MAX_ON_DUTY_HOURS:
                seg_miles = trip_miles_so_far + distance_today
                segments.append({"type": STATUS_ON, "start_hour": round(current_hour, 2), "end_hour": round(current_hour + FUEL_DURATION, 2), "hours": FUEL_DURATION, "remark": "Fueling", "mile_marker": round(seg_miles, 1)})
                current_hour += FUEL_DURATION
                on_duty_today += FUEL_DURATION
                continue
            break

        drive_hours = max_seg
        drive_miles = drive_hours * AVG_SPEED_MPH
        seg_miles = start_miles
        segments.append({"type": STATUS_D, "start_hour": round(current_hour, 2), "end_hour": round(current_hour + drive_hours, 2), "hours": round(drive_hours, 2), "mile_marker": round(seg_miles, 1)})
        current_hour += drive_hours
        drive_today += drive_hours
        distance_today += drive_miles
        on_duty_today += drive_hours
        drive_streak += drive_hours

        if drive_streak >= BREAK_AFTER_HOURS - 0.01 and drive_today < remaining_drive - 0.01:
            if on_duty_today + BREAK_DURATION <= MAX_ON_DUTY_HOURS:
                seg_miles = trip_miles_so_far + distance_today
                segments.append({"type": STATUS_ON, "start_hour": round(current_hour, 2), "end_hour": round(current_hour + BREAK_DURATION, 2), "hours": BREAK_DURATION, "remark": "30-min Break", "mile_marker": round(seg_miles, 1)})
                current_hour += BREAK_DURATION
                on_duty_today += BREAK_DURATION
                drive_streak = 0

    reached_destination = drive_today >= remaining_drive - 0.1
    if reached_destination:
        if on_duty_today + DROPOFF_DURATION <= MAX_ON_DUTY_HOURS:
            seg_miles = trip_miles_so_far + distance_today
            segments.append({"type": STATUS_ON, "start_hour": round(current_hour, 2), "end_hour": round(current_hour + DROPOFF_DURATION, 2), "hours": DROPOFF_DURATION, "remark": "Drop-off", "mile_marker": round(seg_miles, 1)})
            current_hour += DROPOFF_DURATION
            on_duty_today += DROPOFF_DURATION

    remaining_day_hours = 24 - current_hour
    if remaining_day_hours > 0:
        sleep_hours = min(MIN_REST_HOURS, remaining_day_hours)
        segments.append({"type": STATUS_OFF, "start_hour": round(current_hour, 2), "end_hour": round(current_hour + sleep_hours, 2), "hours": round(sleep_hours, 2), "remark": "Off-duty/sleep", "mile_marker": round(trip_miles_so_far + distance_today, 1)})
        current_hour += sleep_hours

    remaining = 24 - current_hour
    if remaining > 0.01:
        segments.append({"type": STATUS_OFF, "start_hour": round(current_hour, 2), "end_hour": 24, "hours": round(remaining, 2), "mile_marker": round(trip_miles_so_far + distance_today, 1)})

    return {
        "segments": segments,
        "drive_today": drive_today,
        "on_duty_today": on_duty_today,
        "distance_today": distance_today,
    }

def get_eld_grid(day_segments):
    grid = ["" for _ in range(24)]
    for seg in day_segments:
        seg_type = seg["type"]
        start = seg["start_hour"]
        end = seg["end_hour"]
        start_h = int(start)
        end_h = min(24, int(end) + 1)
        for h in range(max(0, start_h), min(24, end_h)):
            seg_start_in_hour = max(start, h)
            seg_end_in_hour = min(end, h + 1)
            overlap = seg_end_in_hour - seg_start_in_hour
            if overlap > 0:
                grid[h] = seg_type
    return grid

def generate_daily_logs(trip_plan):
    logs = []
    for day in trip_plan:
        grid = get_eld_grid(day["segments"])
        logs.append({
            "day": day["day"],
            "date": f"Day {day['day']}",
            "driver": day["driver"],
            "carrier": day["carrier"],
            "truck_number": day["truck_number"],
            "total_miles": day["total_distance_miles"],
            "total_drive_hours": day["total_drive_hours"],
            "total_on_duty_hours": day["total_on_duty_hours"],
            "grid": grid,
            "segments": day["segments"],
        })
    return logs
