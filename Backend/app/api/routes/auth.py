from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user

router = APIRouter()

@router.get("/auth/test")
async def auth_test(current_user=Depends(get_current_user)):
    return current_user