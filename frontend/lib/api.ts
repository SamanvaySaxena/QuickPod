import type {
  GenerateStudyGuideResponse,
  StudyGuide,
} from "@/types/study-guide";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface APIErrorResponse {
  detail?: string;
}

export interface StudyGuideHistoryItem {
  id: string;
  video_id: string;
  youtube_url: string;
  title: string;
  study_guide: StudyGuide;
  created_at: string;
}

export interface StudyGuideHistoryResponse {
  study_guides: StudyGuideHistoryItem[];
}

export type StudyGuideDetailResponse = StudyGuideHistoryItem;

function getApiErrorMessage(
  data: unknown,
  status: number
): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data
  ) {
    const errorData = data as APIErrorResponse;

    if (typeof errorData.detail === "string") {
      return errorData.detail;
    }
  }

  return `Request failed with status ${status}.`;
}

async function parseApiResponse(
  response: Response
): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function generateStudyGuide(
  ytUrl: string,
  accessToken: string
): Promise<GenerateStudyGuideResponse> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured."
    );
  }

  const response = await fetch(
    `${API_URL}/study-guides`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        yt_url: ytUrl,
      }),
    }
  );

  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, response.status)
    );
  }

  return data as GenerateStudyGuideResponse;
}

export async function getStudyGuides(
  accessToken: string
): Promise<StudyGuideHistoryResponse> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured."
    );
  }

  const response = await fetch(
    `${API_URL}/study-guides`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, response.status)
    );
  }

  return data as StudyGuideHistoryResponse;
}

export async function getStudyGuide(
  studyGuideId: string,
  accessToken: string
): Promise<StudyGuideDetailResponse> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured."
    );
  }

  const response = await fetch(
    `${API_URL}/study-guides/${studyGuideId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, response.status)
    );
  }

  return data as StudyGuideDetailResponse;
}

export async function deleteStudyGuide(
  studyGuideId: string,
  accessToken: string
): Promise<void> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured."
    );
  }

  const response = await fetch(
    `${API_URL}/study-guides/${studyGuideId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, response.status)
    );
  }
}