from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.dependencies.auth import get_current_user, bearer_scheme
from app.services.wellness_service import (
    get_user_wellness_profile,
    update_user_wellness_profile,
    create_wellness_log,
    get_wellness_logs,
    update_wellness_log,
    delete_wellness_log,
)

router = APIRouter(
    prefix="/wellness",
    tags=["Wellness"],
)


@router.get("")
def get_wellness(
    category: str = None,
    limit: int = 50,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token = credentials.credentials if credentials else None
    if category:
        return get_wellness_logs(
            user_id=user.id,
            limit=limit,
            category=category,
            token=token,
        )
    return get_user_wellness_profile(user_id=user.id, token=token)


@router.put("")
@router.patch("")
def update_wellness(
    data: dict,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token = credentials.credentials if credentials else None
    return update_user_wellness_profile(user_id=user.id, updates=data, token=token)


@router.get("/logs")
def list_logs(
    category: str = None,
    limit: int = 50,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token = credentials.credentials if credentials else None
    return get_wellness_logs(
        user_id=user.id,
        limit=limit,
        category=category,
        token=token,
    )


@router.post("")
def add_wellness_log(
    data: dict,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token = credentials.credentials if credentials else None
    category = data.get("category")
    if not category:
        # If payload doesn't specify a log category, treat as a wellness profile update
        return update_user_wellness_profile(user_id=user.id, updates=data, token=token)

    return create_wellness_log(
        user_id=user.id,
        category=category,
        value=data.get("value"),
        unit=data.get("unit"),
        notes=data.get("notes"),
        token=token,
    )


@router.patch("/{log_id}")
def edit_wellness_log(
    log_id: str,
    data: dict,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    return update_wellness_log(
        log_id=log_id,
        user_id=user.id,
        updates=data,
        token=credentials.credentials if credentials else None,
    )


@router.delete("/{log_id}")
def remove_wellness_log(
    log_id: str,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    return delete_wellness_log(
        log_id=log_id,
        user_id=user.id,
        token=credentials.credentials if credentials else None,
    )
