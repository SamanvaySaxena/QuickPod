from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.supabase_service import supabase_client

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        response = supabase_client.auth.get_claims(token)
        if response is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token"
            )
        return response["claims"]
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

async def get_access_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    return credentials.credentials