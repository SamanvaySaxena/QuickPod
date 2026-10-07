from urllib.parse import urlsplit, parse_qs
from youtube_transcript_api import (
    YouTubeTranscriptApi,
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
    AgeRestricted,
    RequestBlocked,
    IpBlocked,
    CouldNotRetrieveTranscript,
    YouTubeRequestFailed,
    PoTokenRequired,
)
import re

class TranscriptUnavailableError(Exception):
    pass
class VideoUnavailableError(Exception):
    pass
class TranscriptServiceError(Exception):
    pass


def validate_youtube_url(url: str) -> str:
    parsed_url = urlsplit(url)

    # 1. Only HTTPS URLs are allowed
    if parsed_url.scheme.lower() != "https":
        raise ValueError("Only HTTPS URLs are allowed")

    # 2. Get the hostname
    hostname = parsed_url.hostname

    if hostname is None:
        raise ValueError("Invalid URL")

    hostname = hostname.lower()

    # 3. Normal youtube.com/watch?v=... URL
    if hostname in {"youtube.com", "www.youtube.com"}:
        if parsed_url.path != "/watch":
            raise ValueError("Only YouTube video URLs are allowed")

        query_params = parse_qs(parsed_url.query)
        video_ids = query_params.get("v")

        if not video_ids:
            raise ValueError("Missing YouTube video ID")

        video_id = video_ids[0]

    # 4. Short youtu.be/<video_id> URL
    elif hostname == "youtu.be":
        path_parts = parsed_url.path.strip("/").split("/")

        if len(path_parts) != 1 or not path_parts[0]:
            raise ValueError("Invalid YouTube video URL")

        video_id = path_parts[0]

    else:
        raise ValueError("Invalid YouTube domain")

    # 5. Validate the actual YouTube video ID format
    if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
        raise ValueError("Invalid YouTube video ID")

    return video_id

def get_transcript(video_id: str) -> str:
    ytt_api = YouTubeTranscriptApi()
    try:
        transcript_list = ytt_api.list(video_id)
        try:
            transcript = transcript_list.find_transcript(["en"])
        except NoTranscriptFound:
            transcript = next(iter(transcript_list), None)
            if transcript is None:
                raise TranscriptUnavailableError(
                    "No transcript is available for this video"
                )
        fetched_transcript = transcript.fetch()
        return " ".join(
            snippet.text for snippet in fetched_transcript
        )
    except (
        TranscriptsDisabled,
        NoTranscriptFound,
    ) as e:
        raise TranscriptUnavailableError(
            "No transcript is available for this video"
        ) from e
    except (
        VideoUnavailable,
        AgeRestricted,
    ) as e:
        raise VideoUnavailableError(
            "This YouTube video is unavailable"
        ) from e
    except (
        RequestBlocked,
        IpBlocked,
        CouldNotRetrieveTranscript,
        YouTubeRequestFailed,
        PoTokenRequired,
    ) as e:
        raise TranscriptServiceError(
            "Unable to retrieve the transcript from YouTube"
        ) from e


    
if __name__ == "__main__":
    video_id = input("Enter video ID: ")
    ytt_api = YouTubeTranscriptApi()
    transcript = get_transcript(video_id)
    print(transcript)