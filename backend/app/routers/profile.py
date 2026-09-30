from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from typing import Optional, Dict, Any

from app.database import supabase
from app.dependencies.auth import get_current_user, bearer_scheme
from app.services.conversation_service import _get_authed_client

router = APIRouter(
    prefix="/user",
    tags=["User Profile & Onboarding"],
)


def safe_int(val: Any) -> Optional[int]:
    if val is None or val == "":
        return None
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return None


def safe_float(val: Any) -> Optional[float]:
    if val is None or val == "":
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


@router.post("/onboarding")
def save_onboarding(
    data: Dict[str, Any],
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    Saves comprehensive user onboarding data into the database.
    Handles type conversions safely (e.g. string age/height/weight into numeric/clean types).
    """
    user_id = user.id
    token = credentials.credentials if credentials else None
    client = _get_authed_client(token) if token else supabase

    name = (
        data.get("fullName")
        or data.get("name")
        or (getattr(user, "email", "").split("@")[0] if getattr(user, "email", None) else "User")
    )
    age = safe_int(data.get("age"))

    # Structured preferences & onboarding payloads
    preferences = {
        "fullName": name,
        "gender": data.get("gender"),
        "currentStatus": data.get("currentStatus"),
        "hobbies": data.get("hobbies", []),
        "lifestyle": {
            "favoriteFoods": data.get("favoriteFoods", []),
            "favoriteCuisines": data.get("favoriteCuisines", []),
            "favoriteSnacks": data.get("favoriteSnacks", []),
            "favoriteDrinks": data.get("favoriteDrinks", []),
            "dislikedFoods": data.get("dislikedFoods", []),
            "dietaryPreference": data.get("dietaryPreference", ""),
            "moodPreferences": data.get("moodPreferences", {}),
            "socialMediaPlatforms": data.get("socialMediaPlatforms", []),
            "socialMediaUsage": data.get("socialMediaUsage", {}),
        },
        "wellness": {
            "hasHealthConditions": bool(data.get("hasHealthConditions", False)),
            "healthConditions": data.get("healthConditions", ""),
            "allergies": data.get("allergies", ""),
            "medicines": data.get("medicines", []),
            "periodTrackingEnabled": bool(data.get("periodTrackingEnabled", False)),
            "periodData": data.get("periodData", {}),
            "height": safe_float(data.get("height")),
            "weight": safe_float(data.get("weight")),
            "doesWorkout": bool(data.get("doesWorkout", False)),
            "workoutType": data.get("workoutType", ""),
            "workoutDaysPerWeek": safe_int(data.get("workoutDaysPerWeek")),
            "workoutPreferredTime": data.get("workoutPreferredTime", ""),
            "workoutGoal": data.get("workoutGoal", ""),
            "bedtime": data.get("bedtime", ""),
            "wakeTime": data.get("wakeTime", ""),
            "sleepQuality": data.get("sleepQuality", ""),
        },
        "safety": {
            "emergencyContacts": data.get("emergencyContacts", []),
            "sosSettings": data.get("sosSettings", {
                "autoEscalation": False,
                "timeout": 60,
                "escalationMethod": "both",
            }),
        },
        "integrations": {
            "spotifyUsername": data.get("spotifyUsername", ""),
            "spotifyConnect": bool(data.get("spotifyConnect", False)),
            "youtubeConnect": bool(data.get("youtubeConnect", False)),
        },
        "permissions": data.get("permissions", {}),
    }

    goals = {
        "dailyGoals": data.get("dailyGoals", []),
        "assignments": data.get("assignments", []),
        "workoutGoal": data.get("workoutGoal", ""),
    }

    routines = {
        "bedtime": data.get("bedtime"),
        "wakeTime": data.get("wakeTime"),
        "workoutType": data.get("workoutType"),
        "workoutDaysPerWeek": safe_int(data.get("workoutDaysPerWeek")),
        "workoutPreferredTime": data.get("workoutPreferredTime"),
    }

    profile_record = {
        "id": user_id,
        "name": name,
        "age": age,
        "preferences": preferences,
        "goals": goals,
        "routines": routines,
    }

    # Resilient upsert into profiles table
    try:
        client.table("profiles").upsert(profile_record).execute()
    except Exception as e:
        # Fallback to minimal schema if goals/routines columns aren't defined in Postgres
        try:
            fallback = {
                "id": user_id,
                "name": name,
                "preferences": {
                    **preferences,
                    "age": age,
                    "goals": goals,
                    "routines": routines,
                },
            }
            client.table("profiles").upsert(fallback).execute()
        except Exception as e2:
            print(f"Fallback upsert also failed: {e2}")

    # Save emergency contacts if present
    emergency_contacts = data.get("emergencyContacts", [])
    if isinstance(emergency_contacts, list) and len(emergency_contacts) > 0:
        for idx, contact in enumerate(emergency_contacts):
            if isinstance(contact, dict) and contact.get("name"):
                try:
                    client.table("emergency_contacts").insert({
                        "user_id": user_id,
                        "name": str(contact.get("name")).strip(),
                        "phone": str(contact.get("phone", "")).strip(),
                        "relationship": str(contact.get("relationship", "Friend")).strip(),
                        "priority": safe_int(contact.get("priority")) or (idx + 1),
                    }).execute()
                except Exception as ex:
                    print(f"Failed to insert emergency contact into table: {ex}")

    # Save safety_config if present
    sos_settings = data.get("sosSettings", {})
    if isinstance(sos_settings, dict):
        try:
            client.table("safety_config").upsert({
                "user_id": user_id,
                "sos_enabled": bool(sos_settings.get("autoEscalation", False)),
            }).execute()
        except Exception as ex:
            print(f"Failed to upsert safety_config: {ex}")

    # Save tasks if present
    initial_tasks = data.get("tasks", [])
    if isinstance(initial_tasks, list):
        for task in initial_tasks:
            if isinstance(task, dict) and task.get("title"):
                try:
                    client.table("tasks").insert({
                        "user_id": user_id,
                        "title": task.get("title"),
                        "description": task.get("description", ""),
                        "due_at": task.get("due_at") or task.get("deadline"),
                        "status": "pending",
                    }).execute()
                except Exception:
                    pass

    return {
        "status": "success",
        "message": "Onboarding profile saved successfully",
        "user_id": user_id,
        "name": name,
    }


@router.post("/onboarding/complete")
def complete_onboarding(
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    Marks the onboarding flow as complete for the authenticated user.
    """
    user_id = user.id
    token = credentials.credentials if credentials else None
    client = _get_authed_client(token) if token else supabase

    try:
        client.table("profiles").upsert({
            "id": user_id,
            "onboarding_complete": True,
        }).execute()
    except Exception as e:
        print(f"Mark onboarding complete error: {e}")

    return {
        "status": "success",
        "message": "Onboarding completed successfully",
        "onboardingComplete": True,
        "user_id": user_id,
    }


@router.get("/profile")
def get_profile(
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    Fetches the profile for the authenticated user.
    """
    user_id = user.id
    token = credentials.credentials if credentials else None
    client = _get_authed_client(token) if token else supabase

    profile_data = None
    try:
        res = client.table("profiles").select("*").eq("id", user_id).maybe_single().execute()
        profile_data = res.data
    except Exception as e:
        print(f"Error fetching profile: {e}")

    email = getattr(user, "email", "")
    name = (profile_data or {}).get("name") or (email.split("@")[0] if email else "User")

    return {
        "id": user_id,
        "email": email,
        "name": name,
        "onboardingComplete": (profile_data or {}).get("onboarding_complete", True),
        "personalInformation": {
            "fullName": name,
            "age": (profile_data or {}).get("age"),
            "gender": ((profile_data or {}).get("preferences") or {}).get("gender"),
            "currentStatus": ((profile_data or {}).get("preferences") or {}).get("currentStatus"),
        },
        "preferences": (profile_data or {}).get("preferences") or {},
        "goals": (profile_data or {}).get("goals") or {},
        "routines": (profile_data or {}).get("routines") or {},
        **(profile_data or {}),
    }


@router.put("/profile")
@router.patch("/profile")
def update_profile(
    data: Dict[str, Any],
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    Updates the profile for the authenticated user.
    """
    user_id = user.id
    token = credentials.credentials if credentials else None
    client = _get_authed_client(token) if token else supabase

    safe_updates = {k: v for k, v in data.items() if k not in ["id", "created_at"]}
    safe_updates["id"] = user_id

    try:
        client.table("profiles").upsert(safe_updates).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update profile: {str(e)}")

    return {
        "status": "success",
        "message": "Profile updated successfully",
        "user": {"id": user_id, **data},
    }


# Standalone alias router for direct /profile endpoints
profile_alias_router = APIRouter(tags=["User Profile & Onboarding"])


@profile_alias_router.get("/profile")
def get_profile_alias(
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    return get_profile(user=user, credentials=credentials)


@profile_alias_router.put("/profile")
@profile_alias_router.patch("/profile")
def update_profile_alias(
    data: Dict[str, Any],
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    return update_profile(data=data, user=user, credentials=credentials)
