from supabase import create_client
from app.core.config import settings
from app.schemas.study_guide import StudyGuide

supabase_client = create_client(
    settings.supabase_url,
    settings.supabase_publishable_key
)

class SupabaseServiceError(Exception):
    pass


def get_authenticated_client(access_token: str):
    client = create_client(
        settings.supabase_url,
        settings.supabase_publishable_key
    )

    client.postgrest.auth(access_token)

    return client


def save_study_guide(
    access_token: str,
    user_id: str,
    video_id: str,
    youtube_url: str,
    study_guide: StudyGuide
):
    client = get_authenticated_client(access_token)

    try:
        response = (
            client
            .table("study_guides")
            .insert({
                "user_id": user_id,
                "video_id": video_id,
                "youtube_url": youtube_url,
                "title": study_guide.title,
                "study_guide": study_guide.model_dump(mode="json")
            })
            .select("*")
            .execute()
        )

        if not response.data:
            raise SupabaseServiceError(
                "Study guide was not saved"
            )

        return response.data[0]

    except Exception as e:
        raise SupabaseServiceError(
            "Failed to save study guide"
        ) from e

def get_study_guides(access_token: str):
    client = get_authenticated_client(access_token)
    try:
        response = (
            client
            .table("study_guides")
            .select(
                "id, video_id, youtube_url, title, study_guide, created_at"
            )
            .order("created_at", desc=True)
            .execute()
        )
        return response.data
    except Exception as e:
        raise SupabaseServiceError(
            "Failed to fetch study guides"
        ) from e

def get_study_guide(access_token: str,study_guide_id: str):
    client = get_authenticated_client(access_token)
    try:
        response = (
            client
            .table("study_guides")
            .select(
                "id, video_id, youtube_url, title, study_guide, created_at"
            )
            .eq("id", study_guide_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            return None
        return response.data[0]
    except Exception as e:
        raise SupabaseServiceError(
            "Failed to fetch study guide"
        ) from e

def delete_study_guide(access_token: str,study_guide_id: str):
    client = get_authenticated_client(access_token)
    try:
        response = (
            client
            .table("study_guides")
            .delete()
            .eq("id", study_guide_id)
            .select("id")
            .execute()
        )
        if not response.data:
            return False
        return True
    except Exception as e:
        raise SupabaseServiceError(
            "Failed to delete study guide"
        ) from e