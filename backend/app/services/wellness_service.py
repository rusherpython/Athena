from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from app.database import supabase
from app.services.conversation_service import _get_authed_client


def get_user_wellness_profile(user_id: str, token: str = None) -> Dict[str, Any]:
    """
    Fetches the unified wellness profile for the user by reading from
    profiles.preferences.wellness, profiles.routines, and any recent wellness logs.
    """
    client = _get_authed_client(token) if token else supabase
    profile_data = {}
    try:
        res = client.table("profiles").select("*").eq("id", user_id).maybe_single().execute()
        profile_data = res.data or {}
    except Exception as e:
        print(f"Error fetching profile for wellness: {e}")

    prefs = profile_data.get("preferences") or {}
    wellness_data = prefs.get("wellness") or {}
    routines_data = profile_data.get("routines") or {}
    goals_data = profile_data.get("goals") or {}

    logs: List[Dict[str, Any]] = []
    try:
        logs_res = (
            client.table("wellness_logs")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        logs = logs_res.data or []
    except Exception as e:
        print(f"Error fetching wellness logs: {e}")

    # Build sleep block
    bedtime = wellness_data.get("bedtime") or routines_data.get("bedtime") or ""
    wake_time = wellness_data.get("wakeTime") or routines_data.get("wakeTime") or ""
    sleep_quality = wellness_data.get("sleepQuality") or ""
    has_sleep = bool(bedtime or wake_time or sleep_quality)

    sleep_block = {
        "bedtime": bedtime,
        "wakeTime": wake_time,
        "quality": sleep_quality,
    } if has_sleep else None

    # Build workout block
    workout_type = wellness_data.get("workoutType") or routines_data.get("workoutType") or ""
    workout_days = wellness_data.get("workoutDaysPerWeek") if wellness_data.get("workoutDaysPerWeek") is not None else routines_data.get("workoutDaysPerWeek")
    workout_time = wellness_data.get("workoutPreferredTime") or routines_data.get("workoutPreferredTime") or ""
    workout_goal = wellness_data.get("workoutGoal") or goals_data.get("workoutGoal") or ""
    does_workout = wellness_data.get("doesWorkout")
    if does_workout is None:
        does_workout = bool(workout_type or workout_days or workout_goal)

    has_workout = bool(does_workout or workout_type or workout_days or workout_goal)
    workout_block = {
        "doesWorkout": bool(does_workout),
        "type": workout_type,
        "daysPerWeek": workout_days,
        "preferredTime": workout_time,
        "goal": workout_goal,
    } if has_workout else None

    # BMI calculation
    height = wellness_data.get("height")
    weight = wellness_data.get("weight")
    bmi_val = None
    bmi_cat = None
    if height and weight:
        try:
            h_m = float(height) / 100.0
            w_kg = float(weight)
            if h_m > 0:
                calc_bmi = round(w_kg / (h_m * h_m), 1)
                bmi_val = calc_bmi
                if calc_bmi < 18.5:
                    bmi_cat = "Underweight"
                elif calc_bmi < 25.0:
                    bmi_cat = "Normal weight"
                elif calc_bmi < 30.0:
                    bmi_cat = "Overweight"
                else:
                    bmi_cat = "Obese"
        except (ValueError, TypeError):
            pass

    bmi_block = {
        "height": height,
        "weight": weight,
        "bmi": bmi_val,
        "category": bmi_cat,
    } if (height or weight) else None

    # Period tracking & estimated next period
    period_enabled = bool(wellness_data.get("periodTrackingEnabled", False))
    period_data = wellness_data.get("periodData") or {}
    next_estimated = None
    if period_enabled and period_data.get("lastPeriodDate"):
        try:
            last_dt = datetime.strptime(str(period_data["lastPeriodDate"]).strip(), "%Y-%m-%d")
            cycle = int(period_data.get("averageCycleLength") or 28)
            next_dt = last_dt + timedelta(days=cycle)
            next_estimated = next_dt.strftime("%b %d, %Y")
        except Exception:
            next_estimated = None

    period_block = {
        "enabled": period_enabled,
        "lastPeriodDate": period_data.get("lastPeriodDate", ""),
        "averageCycleLength": period_data.get("averageCycleLength", 28),
        "averagePeriodDuration": period_data.get("averagePeriodDuration", 5),
        "symptoms": period_data.get("symptoms", []),
        "nextEstimated": next_estimated,
    }

    return {
        "sleep": sleep_block,
        "workout": workout_block,
        "bmi": bmi_block,
        "height": height,
        "weight": weight,
        "periodTracking": period_block,
        "healthConditions": wellness_data.get("healthConditions", ""),
        "allergies": wellness_data.get("allergies", ""),
        "medicines": wellness_data.get("medicines", []),
        "hasHealthConditions": bool(wellness_data.get("hasHealthConditions", False)),
        "logs": logs,
    }


def update_user_wellness_profile(user_id: str, updates: dict, token: str = None) -> Dict[str, Any]:
    """
    Updates the user's wellness profile in profiles.preferences.wellness and syncs routines/goals.
    """
    client = _get_authed_client(token) if token else supabase
    profile_data = {}
    try:
        res = client.table("profiles").select("*").eq("id", user_id).maybe_single().execute()
        profile_data = res.data or {}
    except Exception as e:
        print(f"Error fetching profile: {e}")

    prefs = profile_data.get("preferences") or {}
    wellness_data = prefs.get("wellness") or {}
    routines_data = profile_data.get("routines") or {}
    goals_data = profile_data.get("goals") or {}

    # Handle nested sleep updates
    if "sleep" in updates and isinstance(updates["sleep"], dict):
        s = updates["sleep"]
        if "bedtime" in s:
            wellness_data["bedtime"] = s["bedtime"]
            routines_data["bedtime"] = s["bedtime"]
        if "wakeTime" in s:
            wellness_data["wakeTime"] = s["wakeTime"]
            routines_data["wakeTime"] = s["wakeTime"]
        if "quality" in s:
            wellness_data["sleepQuality"] = s["quality"]

    # Handle nested workout updates
    if "workout" in updates and isinstance(updates["workout"], dict):
        w = updates["workout"]
        if "doesWorkout" in w:
            wellness_data["doesWorkout"] = bool(w["doesWorkout"])
        if "type" in w:
            wellness_data["workoutType"] = w["type"]
            routines_data["workoutType"] = w["type"]
        if "daysPerWeek" in w:
            wellness_data["workoutDaysPerWeek"] = w["daysPerWeek"]
            routines_data["workoutDaysPerWeek"] = w["daysPerWeek"]
        if "preferredTime" in w:
            wellness_data["workoutPreferredTime"] = w["preferredTime"]
            routines_data["workoutPreferredTime"] = w["preferredTime"]
        if "goal" in w:
            wellness_data["workoutGoal"] = w["goal"]
            goals_data["workoutGoal"] = w["goal"]

    # Handle nested periodTracking updates
    if "periodTracking" in updates and isinstance(updates["periodTracking"], dict):
        p = updates["periodTracking"]
        if "enabled" in p:
            wellness_data["periodTrackingEnabled"] = bool(p["enabled"])
        p_data = wellness_data.get("periodData") or {}
        for k in ["lastPeriodDate", "averageCycleLength", "averagePeriodDuration", "symptoms"]:
            if k in p:
                p_data[k] = p[k]
        wellness_data["periodData"] = p_data

    # Handle direct top-level fields
    for k in [
        "height", "weight", "healthConditions", "allergies", "medicines",
        "bedtime", "wakeTime", "sleepQuality", "workoutType",
        "workoutDaysPerWeek", "workoutPreferredTime", "workoutGoal",
        "doesWorkout", "periodTrackingEnabled", "periodData"
    ]:
        if k in updates:
            wellness_data[k] = updates[k]

    prefs["wellness"] = wellness_data
    try:
        client.table("profiles").upsert({
            "id": user_id,
            "preferences": prefs,
            "routines": routines_data,
            "goals": goals_data,
        }).execute()
    except Exception as e:
        print(f"Error saving updated wellness: {e}")

    return get_user_wellness_profile(user_id, token)


def create_wellness_log(
    user_id: str,
    category: str,
    value: str = None,
    unit: str = None,
    notes: str = None,
    token: str = None,
):
    data = {
        "user_id": user_id,
        "category": category,
        "value": value,
        "unit": unit,
        "notes": notes,
    }

    client = _get_authed_client(token) if token else supabase
    response = client.table("wellness_logs").insert(data).execute()
    return response.data


def get_wellness_logs(
    user_id: str,
    limit: int = 50,
    category: str = None,
    token: str = None,
):
    client = _get_authed_client(token) if token else supabase
    query = (
        client
        .table("wellness_logs")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
    )

    if category:
        query = query.eq("category", category)

    response = query.execute()
    return response.data or []


def update_wellness_log(
    log_id: str,
    user_id: str,
    updates: dict,
    token: str = None,
):
    safe_updates = {
        k: v for k, v in updates.items()
        if k not in ["id", "user_id", "created_at"]
    }

    client = _get_authed_client(token) if token else supabase
    response = (
        client
        .table("wellness_logs")
        .update(safe_updates)
        .eq("id", log_id)
        .eq("user_id", user_id)
        .execute()
    )
    return response.data


def delete_wellness_log(
    log_id: str,
    user_id: str,
    token: str = None,
):
    client = _get_authed_client(token) if token else supabase
    response = (
        client
        .table("wellness_logs")
        .delete()
        .eq("id", log_id)
        .eq("user_id", user_id)
        .execute()
    )
    return response.data
