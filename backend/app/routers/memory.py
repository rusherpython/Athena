from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from typing import Dict, Any, Optional

from app.database import supabase
from app.dependencies.auth import get_current_user, bearer_scheme
from app.services.conversation_service import _get_authed_client

router = APIRouter(
    prefix="/memory",
    tags=["Memory"],
)


@router.get("")
def get_memories(
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    Returns all memories for the authenticated user from Supabase.
    Returns an empty list if none exist.
    """
    token = credentials.credentials if credentials else None
    client = _get_authed_client(token) if token else supabase

    try:
        response = (
            client.table("memories")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", desc=True)
            .execute()
        )
        raw_items = response.data or []
        normalized = []
        for item in raw_items:
            normalized.append({
                "id": str(item.get("id")),
                "content": item.get("content", ""),
                "type": item.get("memory_type") or "explicit",
                "category": item.get("category") or "preference",
                "timestamp": item.get("created_at"),
            })
        return normalized
    except Exception as e:
        print(f"Error fetching memories for user {user.id}: {e}")
        # Return empty list if query fails or table empty
        return []


@router.post("")
def add_memory(
    data: Dict[str, Any],
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    Inserts a new memory record for the authenticated user.
    """
    token = credentials.credentials if credentials else None
    client = _get_authed_client(token) if token else supabase

    content = data.get("content") or data.get("memory")
    if not content or not str(content).trim() if hasattr(str(content), "trim") else not str(content).strip():
        raise HTTPException(status_code=422, detail="Memory content cannot be empty.")

    memory_type = data.get("type") or data.get("memory_type") or "explicit"
    payload = {
        "user_id": user.id,
        "content": str(content).strip(),
        "memory_type": memory_type,
    }

    try:
        response = client.table("memories").insert(payload).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to save memory to database.")
        saved = response.data[0]
        return {
            "id": str(saved.get("id")),
            "content": saved.get("content"),
            "type": saved.get("memory_type") or memory_type,
            "category": data.get("category") or "preference",
            "timestamp": saved.get("created_at"),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Database error saving memory: {e}")
        raise HTTPException(status_code=500, detail=f"Database error saving memory: {str(e)}")


@router.delete("/{memory_id}")
def delete_memory(
    memory_id: str,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    Deletes a memory record belonging to the authenticated user.
    """
    token = credentials.credentials if credentials else None
    client = _get_authed_client(token) if token else supabase

    try:
        client.table("memories").delete().eq("id", memory_id).eq("user_id", user.id).execute()
        return {"status": "success", "message": "Memory deleted successfully", "id": memory_id}
    except Exception as e:
        print(f"Error deleting memory {memory_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete memory: {str(e)}")
