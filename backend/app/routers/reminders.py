from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.dependencies.auth import get_current_user, bearer_scheme
from app.services.reminder_service import (
    create_reminder,
    get_reminders,
    update_reminder,
    delete_reminder,
)

router = APIRouter(
    prefix="/reminders",
    tags=["Reminders"],
)


@router.post("")
def add_reminder(
    data: dict,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    title = data.get("title")
    if not title or not str(title).strip():
        raise HTTPException(
            status_code=422,
            detail="Title is required.",
        )

    remind_at = data.get("remind_at")
    if not remind_at:
        date_part = data.get("date")
        time_part = data.get("time") or "09:00"
        if date_part:
            remind_at = f"{date_part}T{time_part}:00"
        else:
            from datetime import datetime, timezone
            remind_at = datetime.now(timezone.utc).isoformat()

    description = data.get("description") or data.get("type") or "custom"

    return create_reminder(
        user_id=user.id,
        title=str(title).strip(),
        remind_at=remind_at,
        description=description,
        token=credentials.credentials,
    )


@router.get("")
def list_reminders(
    include_completed: bool = True,
    limit: int = 50,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    return get_reminders(
        user_id=user.id,
        token=credentials.credentials,
        limit=limit,
        include_completed=include_completed,
    )


@router.patch("/{reminder_id}")
def edit_reminder(
    reminder_id: str,
    data: dict,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    completed = data.get("completed")
    if completed is None and "status" in data:
        completed = (data.get("status") == "completed")

    return update_reminder(
        reminder_id=reminder_id,
        user_id=user.id,
        token=credentials.credentials,
        title=data.get("title"),
        description=data.get("description") or data.get("type"),
        remind_at=data.get("remind_at"),
        completed=completed,
    )


@router.delete("/{reminder_id}")
def remove_reminder(
    reminder_id: str,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    return delete_reminder(
        reminder_id=reminder_id,
        user_id=user.id,
        token=credentials.credentials,
    )
