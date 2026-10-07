export interface StudyGuideRequest {
  yt_url: string;
}

export interface StudyGuideSection {
  heading: string;
  explanation: string;
  key_points: string[];
  examples: string[];
}

export interface StudyGuide {
  title: string;
  overview: string;
  sections: StudyGuideSection[];
  key_takeaways: string[];
}

export interface GenerateStudyGuideResponse {
  user_id: string;
  video_id: string;
  study_guide: StudyGuide;
}