from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from typing import Dict, Any

from app.database import supabase
from app.dependencies.auth import get_current_user, bearer_scheme
from app.services.conversation_service import _get_authed_client

router = APIRouter(
    prefix="/rewards",
    tags=["Rewards"],
)

PROTOTYPE_REWARDS = [
    {
        "id": "r_theme",
        "title": "Cosmic Aura Focus",
        "description": "Custom focus wallpaper & aura styling for your dashboard (Demo Reward)",
        "cost": 50,
        "icon": "🎨",
    },
    {
        "id": "r_badge",
        "title": "Twin Pioneer Badge",
        "description": "Pioneer achievement badge displayed on your ATHENA profile (Demo Reward)",
        "cost": 100,
        "icon": "🎖️",
    },
    {
        "id": "r_memory",
        "title": "Extended Memory Slot",
        "description": "Priority context window for complex twin conversations (Demo Reward)",
        "cost": 150,
        "icon": "⚡",
    },
    {
        "id": "r_sound",
        "title": "Ambient Binaural Beats",
        "description": "Built-in atmospheric focus sound pack (Demo Reward)",
        "cost": 200,
        "icon": "🎧",
    },
]


@router.get("")
def get_user_rewards(
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    Returns rewards, points, streak, and history for the authenticated user.
    Calculated dynamically from real completed tasks in Supabase.
    """
    token = credentials.credentials if credentials else None
    client = _get_authed_client(token) if token else supabase

    completed_count = 0
    history = []

    try:
        task_res = (
            client.table("tasks")
            .select("id, title, status, created_at")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .order("created_at", desc=True)
            .execute()
        )
        completed_tasks = task_res.data or []
        completed_count = len(completed_tasks)

        for task in completed_tasks[:10]:
            history.append({
                "action": f"Completed task: {task.get('title', 'Task')}",
                "points": 10,
                "date": task.get("created_at"),
            })
    except Exception as e:
        print(f"Error reading user task stats for rewards: {e}")

    total_points = completed_count * 10
    streak = 1 if completed_count > 0 else 0

    achievements = []
    if completed_count >= 1:
        achievements.append({
            "id": "ach_first_task",
            "title": "First Step",
            "description": "Completed your first task with ATHENA",
            "icon": "🚀",
        })
    if completed_count >= 5:
        achievements.append({
            "id": "ach_five_tasks",
            "title": "Momentum Builder",
            "description": "Completed 5 productivity tasks",
            "icon": "🔥",
        })
    if completed_count >= 10:
        achievements.append({
            "id": "ach_master",
            "title": "Twin Aligned",
            "description": "Completed 10 tasks in synchronization",
            "icon": "👑",
        })

    return {
        "points": total_points,
        "streak": streak,
        "tasksCompleted": completed_count,
        "achievements": achievements,
        "available": PROTOTYPE_REWARDS,
        "history": history,
    }


@router.post("/{reward_id}/redeem")
def redeem_reward(
    reward_id: str,
    user=Depends(get_current_user),
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    Redeems a prototype reward for the authenticated user.
    """
    found = next((r for r in PROTOTYPE_REWARDS if r["id"] == reward_id), None)
    if not found:
        raise HTTPException(status_code=404, detail="Reward not found.")

    return {
        "success": True,
        "message": f"Successfully unlocked {found['title']}! (Demo Reward Prototype)",
        "reward_id": reward_id,
    }
