from typing import List, Dict, Any
from app.database import supabase
from app.services.conversation_service import _get_authed_client


# ---------------------------------------------------------
# EMERGENCY CONTACTS
# ---------------------------------------------------------

def create_emergency_contact(
    user_id: str,
    name: str,
    phone: str,
    relationship: str = None,
    priority: int = 1,
    token: str = None,
):
    client = _get_authed_client(token) if token else supabase
    contact_item = {
        "id": None,
        "user_id": user_id,
        "name": name,
        "phone": phone,
        "relationship": relationship or "Friend",
        "priority": priority,
    }

    # Try inserting into emergency_contacts table
    try:
        response = client.table("emergency_contacts").insert({
            "user_id": user_id,
            "name": name,
            "phone": phone,
            "relationship": relationship or "Friend",
            "priority": priority,
        }).execute()
        if response.data and len(response.data) > 0:
            contact_item = response.data[0]
    except Exception as e:
        print(f"Error inserting into emergency_contacts table: {e}")

    # Also sync into profiles.preferences.safety.emergencyContacts
    try:
        prof = client.table("profiles").select("preferences").eq("id", user_id).maybe_single().execute()
        prefs = (prof.data or {}).get("preferences") or {}
        safety_data = prefs.get("safety") or {}
        contacts = safety_data.get("emergencyContacts") or []
        contact_dict = {
            "id": contact_item.get("id") or str(len(contacts) + 1),
            "name": name,
            "phone": phone,
            "relationship": relationship or "Friend",
            "priority": priority,
        }
        contacts.append(contact_dict)
        safety_data["emergencyContacts"] = contacts
        prefs["safety"] = safety_data
        client.table("profiles").upsert({"id": user_id, "preferences": prefs}).execute()
    except Exception as e:
        print(f"Error updating profiles safety contacts: {e}")

    return contact_item


def get_emergency_contacts(
    user_id: str,
    token: str = None,
) -> List[Dict[str, Any]]:
    client = _get_authed_client(token) if token else supabase
    contacts: List[Dict[str, Any]] = []

    # 1. Try querying emergency_contacts table
    try:
        response = (
            client
            .table("emergency_contacts")
            .select("*")
            .eq("user_id", user_id)
            .order("priority", desc=False)
            .execute()
        )
        if response.data:
            contacts = response.data
    except Exception as e:
        print(f"Error querying emergency_contacts table: {e}")

    # 2. Fallback to profiles.preferences.safety.emergencyContacts if table is empty
    if not contacts:
        try:
            prof = client.table("profiles").select("preferences").eq("id", user_id).maybe_single().execute()
            prefs = (prof.data or {}).get("preferences") or {}
            safety_data = prefs.get("safety") or {}
            saved_contacts = safety_data.get("emergencyContacts") or []
            if isinstance(saved_contacts, list):
                contacts = saved_contacts
        except Exception as e:
            print(f"Error reading safety emergencyContacts from profiles: {e}")

    # Normalize returned items to ensure id, name, phone, relationship
    normalized = []
    for idx, c in enumerate(contacts):
        if isinstance(c, dict) and c.get("name"):
            normalized.append({
                "id": c.get("id") or (idx + 1),
                "name": c.get("name"),
                "phone": c.get("phone", ""),
                "relationship": c.get("relationship", "Friend"),
                "priority": c.get("priority", idx + 1),
            })
    return normalized


def update_emergency_contacts_bulk(
    user_id: str,
    contacts_list: List[Dict[str, Any]],
    token: str = None,
) -> Dict[str, Any]:
    """
    Saves a full list of emergency contacts, persisting to profiles.preferences.safety
    and syncing the emergency_contacts table.
    """
    client = _get_authed_client(token) if token else supabase

    clean_contacts = []
    for idx, c in enumerate(contacts_list):
        if isinstance(c, dict) and c.get("name"):
            clean_contacts.append({
                "id": c.get("id") or (idx + 1),
                "name": str(c.get("name")).strip(),
                "phone": str(c.get("phone", "")).strip(),
                "relationship": str(c.get("relationship", "Friend")).strip(),
                "priority": c.get("priority") or (idx + 1),
            })

    # 1. Save in profiles.preferences.safety.emergencyContacts
    try:
        prof = client.table("profiles").select("preferences").eq("id", user_id).maybe_single().execute()
        prefs = (prof.data or {}).get("preferences") or {}
        safety_data = prefs.get("safety") or {}
        safety_data["emergencyContacts"] = clean_contacts
        prefs["safety"] = safety_data
        client.table("profiles").upsert({"id": user_id, "preferences": prefs}).execute()
    except Exception as e:
        print(f"Error persisting emergency contacts to profiles: {e}")

    # 2. Sync to emergency_contacts table
    try:
        client.table("emergency_contacts").delete().eq("user_id", user_id).execute()
        for c in clean_contacts:
            client.table("emergency_contacts").insert({
                "user_id": user_id,
                "name": c["name"],
                "phone": c["phone"],
                "relationship": c["relationship"],
                "priority": c["priority"],
            }).execute()
    except Exception as e:
        print(f"Error syncing emergency_contacts table: {e}")

    return {"status": "success", "contacts": clean_contacts}


def update_emergency_contact(
    contact_id: str,
    user_id: str,
    updates: dict,
    token: str = None,
):
    safe_updates = {
        k: v for k, v in updates.items()
        if k not in ["id", "user_id", "created_at"]
    }

    client = _get_authed_client(token) if token else supabase
    response = None
    try:
        response = (
            client
            .table("emergency_contacts")
            .update(safe_updates)
            .eq("id", contact_id)
            .eq("user_id", user_id)
            .execute()
        )
    except Exception as e:
        print(f"Error updating emergency_contacts table: {e}")

    # Also update in profiles.preferences
    try:
        prof = client.table("profiles").select("preferences").eq("id", user_id).maybe_single().execute()
        prefs = (prof.data or {}).get("preferences") or {}
        safety_data = prefs.get("safety") or {}
        contacts = safety_data.get("emergencyContacts") or []
        for c in contacts:
            if str(c.get("id")) == str(contact_id):
                c.update(safe_updates)
        safety_data["emergencyContacts"] = contacts
        prefs["safety"] = safety_data
        client.table("profiles").upsert({"id": user_id, "preferences": prefs}).execute()
    except Exception as e:
        print(f"Error updating emergency contacts in profiles: {e}")

    return response.data if response else safe_updates


def delete_emergency_contact(
    contact_id: str,
    user_id: str,
    token: str = None,
):
    client = _get_authed_client(token) if token else supabase
    response = None
    try:
        response = (
            client
            .table("emergency_contacts")
            .delete()
            .eq("id", contact_id)
            .eq("user_id", user_id)
            .execute()
        )
    except Exception as e:
        print(f"Error deleting from emergency_contacts table: {e}")

    # Also remove from profiles.preferences
    try:
        prof = client.table("profiles").select("preferences").eq("id", user_id).maybe_single().execute()
        prefs = (prof.data or {}).get("preferences") or {}
        safety_data = prefs.get("safety") or {}
        contacts = safety_data.get("emergencyContacts") or []
        contacts = [c for c in contacts if str(c.get("id")) != str(contact_id)]
        safety_data["emergencyContacts"] = contacts
        prefs["safety"] = safety_data
        client.table("profiles").upsert({"id": user_id, "preferences": prefs}).execute()
    except Exception as e:
        print(f"Error deleting contact from profiles: {e}")

    return response.data if response else {"success": True}


# ---------------------------------------------------------
# SAFETY CONFIGURATION
# ---------------------------------------------------------

def get_safety_config(
    user_id: str,
    token: str = None,
) -> Dict[str, Any]:
    client = _get_authed_client(token) if token else supabase
    cfg_data = {}
    try:
        response = (
            client
            .table("safety_config")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        cfg_data = response.data or {}
    except Exception as e:
        print(f"Error reading safety_config table: {e}")

    sos_settings = {}
    try:
        prof = client.table("profiles").select("preferences").eq("id", user_id).maybe_single().execute()
        prefs = (prof.data or {}).get("preferences") or {}
        safety_data = prefs.get("safety") or {}
        sos_settings = safety_data.get("sosSettings") or {}
    except Exception as e:
        print(f"Error reading safety sosSettings from profiles: {e}")

    auto_escalation = sos_settings.get("autoEscalation")
    if auto_escalation is None:
        auto_escalation = bool(cfg_data.get("sos_enabled", False))

    return {
        "autoEscalation": bool(auto_escalation),
        "timeout": sos_settings.get("timeout", 60),
        "escalationMethod": sos_settings.get("escalationMethod", "both"),
        "sos_enabled": bool(cfg_data.get("sos_enabled", False)),
        "location_sharing_enabled": bool(cfg_data.get("location_sharing_enabled", False)),
    }


def update_safety_config(
    user_id: str,
    updates: dict,
    token: str = None,
) -> Dict[str, Any]:
    client = _get_authed_client(token) if token else supabase

    # 1. Update in profiles.preferences.safety.sosSettings
    try:
        prof = client.table("profiles").select("preferences").eq("id", user_id).maybe_single().execute()
        prefs = (prof.data or {}).get("preferences") or {}
        safety_data = prefs.get("safety") or {}
        existing_sos = safety_data.get("sosSettings") or {}
        existing_sos.update(updates)
        safety_data["sosSettings"] = existing_sos
        prefs["safety"] = safety_data
        client.table("profiles").upsert({"id": user_id, "preferences": prefs}).execute()
    except Exception as e:
        print(f"Error updating profiles safety sosSettings: {e}")

    # 2. Update safety_config table for known columns
    db_updates = {}
    if "autoEscalation" in updates:
        db_updates["sos_enabled"] = bool(updates["autoEscalation"])
    if "sos_enabled" in updates:
        db_updates["sos_enabled"] = bool(updates["sos_enabled"])
    if "location_sharing_enabled" in updates:
        db_updates["location_sharing_enabled"] = bool(updates["location_sharing_enabled"])

    if db_updates:
        try:
            existing = (
                client
                .table("safety_config")
                .select("id")
                .eq("user_id", user_id)
                .maybe_single()
                .execute()
            )
            if existing.data:
                db_updates["updated_at"] = "now()"
                client.table("safety_config").update(db_updates).eq("user_id", user_id).execute()
            else:
                client.table("safety_config").insert({"user_id": user_id, **db_updates}).execute()
        except Exception as e:
            print(f"Error updating safety_config table: {e}")

    return get_safety_config(user_id, token)
