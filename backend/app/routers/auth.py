from fastapi import APIRouter, HTTPException
from supabase_auth.errors import AuthApiError
from app.database import supabase
from app.schemas.auth import RegisterRequest, LoginRequest

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(data: RegisterRequest):
    try:
        response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password
        })
    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if response.user is None:
        raise HTTPException(
            status_code=400,
            detail="Registration failed"
        )

    return {
        "message": "Registration successful",
        "user_id": response.user.id,
        "access_token": response.session.access_token if response.session else None,
        "refresh_token": response.session.refresh_token if response.session else None
    }


@router.post("/login")
def login(data: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })
    except AuthApiError as e:
        raise HTTPException(status_code=401, detail=str(e))

    if response.user is None or response.session is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "user_id": response.user.id
    }
