import logging
from google import genai
from google.genai import errors, types
from app.core.config import settings
from app.schemas.study_guide import StudyGuide

logger = logging.getLogger(__name__)

class GeminiServiceError(Exception):
    pass
class GeminiInputError(Exception):
    pass

client = genai.Client(
    api_key=settings.gemini_api_key,
    http_options=types.HttpOptions(
        retry_options=types.HttpRetryOptions(
            attempts=3,
            initial_delay=1.0,
            max_delay=2.0,
            exp_base=2.0,
            jitter=0.0,
            http_status_codes=[429, 503],
        )
    ),
)

def generate_study_guide(transcript: str) -> StudyGuide:
    if not transcript.strip():
        raise GeminiInputError("Transcript is empty")
    if len(transcript) > settings.max_transcript_chars:
        raise GeminiInputError(
            "Transcript is too large to process"
        )

    prompt = f"""
You are an expert educational note-taking assistant.

Convert the provided video transcript into a clear, well-structured study guide.

Rules:
- The transcript may be in any language.
- The final study guide must be entirely in English.
- Use only information present in the transcript.
- Do not invent facts or add unsupported information.
- Remove unnecessary conversational filler.
- Organize the material logically for studying and revision.
- Explain important concepts clearly.
- Include important definitions, concepts, formulas, facts, and examples
  when they are present in the transcript.
- Keep the content focused on what is actually taught in the transcript.
- Create sections in a logical learning order.
- Put the most important revision points in key_takeaways.

Transcript:
{transcript}
"""
    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": StudyGuide,
            },
        )
        if response.parsed is None:
            raise GeminiServiceError(
                "Gemini returned an empty or invalid structured response"
            )
        return response.parsed
    except errors.APIError as e:
        logger.warning(
            "Gemini API request failed with status %s",
            e.code,
        )
        raise GeminiServiceError(
            "Gemini API request failed"
        ) from e