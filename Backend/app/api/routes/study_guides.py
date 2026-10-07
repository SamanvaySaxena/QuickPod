from uuid import UUID
from fastapi import (APIRouter,Depends,HTTPException,Request)
from app.api.dependencies import (get_access_token,get_current_user)
from app.core.rate_limit import (enforce_generation_rate_limit)
from app.schemas.study_guide import StudyGuideRequest
from app.services.gemini import (GeminiInputError,GeminiServiceError, generate_study_guide)
from app.services.supabase_service import (SupabaseServiceError,delete_study_guide,get_study_guide,get_study_guides,save_study_guide)
from app.services.youtube import (TranscriptServiceError,TranscriptUnavailableError,VideoUnavailableError,get_transcript,validate_youtube_url)

router = APIRouter()

@router.post("/study-guides")
async def study_guides(
    request: StudyGuideRequest,
    http_request: Request,
    current_user=Depends(get_current_user),
    access_token=Depends(get_access_token),
):
    enforce_generation_rate_limit(
        user_id=current_user["sub"],
        client_ip=(
            http_request.client.host
            if http_request.client
            else "unknown"
        ),
    )
    try:
        video_id = validate_youtube_url(
            request.yt_url
        )
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL",
        )
    try:
        transcript = get_transcript(video_id)
    except TranscriptUnavailableError as e:
        raise HTTPException(
            status_code=422,
            detail=str(e),
        )
    except VideoUnavailableError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
    except TranscriptServiceError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e),
        )
    try:
        study_guide = generate_study_guide(
            transcript
        )
    except GeminiInputError as e:
        raise HTTPException(
            status_code=413,
            detail=str(e),
        )
    except GeminiServiceError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e),
        )
    try:
        save_study_guide(
            access_token=access_token,
            user_id=current_user["sub"],
            video_id=video_id,
            youtube_url=request.yt_url,
            study_guide=study_guide,
        )
    except SupabaseServiceError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e),
        )
    return {
        "user_id": current_user["sub"],
        "video_id": video_id,
        "study_guide": study_guide,
    }

@router.get("/study-guides")
async def get_all_study_guides(
    current_user=Depends(get_current_user),
    access_token=Depends(get_access_token),
):
    try:
        study_guides = get_study_guides(
            access_token
        )
    except SupabaseServiceError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e),
        )
    return {
        "study_guides": study_guides
    }

@router.get("/study-guides/{study_guide_id}")
async def get_single_study_guide(
    study_guide_id: UUID,
    current_user=Depends(get_current_user),
    access_token=Depends(get_access_token),
):
    try:
        study_guide = get_study_guide(
            access_token=access_token,
            study_guide_id=str(study_guide_id),
        )
    except SupabaseServiceError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e),
        )
    if study_guide is None:
        raise HTTPException(
            status_code=404,
            detail="Study guide not found",
        )
    return study_guide

@router.delete(
    "/study-guides/{study_guide_id}",
    status_code=204,
)
async def delete_single_study_guide(
    study_guide_id: UUID,
    current_user=Depends(get_current_user),
    access_token=Depends(get_access_token),
):
    try:
        deleted = delete_study_guide(
            access_token=access_token,
            study_guide_id=str(study_guide_id),
        )
    except SupabaseServiceError as e:
        raise HTTPException(
            status_code=503,
            detail=str(e),
        )
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Study guide not found",
        )
    return None