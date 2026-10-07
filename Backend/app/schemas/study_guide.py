from pydantic import BaseModel, Field, field_validator

class StudyGuideRequest(BaseModel):
    yt_url: str = Field(
        min_length=1,
        max_length=2048,
        description="YouTube video URL",
    )
    @field_validator("yt_url")
    @classmethod
    def clean_youtube_url(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("YouTube URL cannot be empty")
        return value

class StudyGuideSection(BaseModel):
    heading: str = Field(description="The title of this study-guide section.")
    explanation: str = Field(description="A clear explanation of the concepts covered in this section.")
    key_points: list[str] = Field(description="Important facts, concepts, formulas, or details from the transcript.")
    examples: list[str] = Field(description="Relevant examples mentioned or explained in the transcript.")

class StudyGuide(BaseModel):
    title: str = Field(description="A concise title for the study guide.")
    overview: str = Field(description="A short overview of what the transcript teaches.")
    sections: list[StudyGuideSection] = Field(description="The main sections of the study guide, ordered logically.")
    key_takeaways: list[str] = Field(description="The most important points to remember for revision.")
