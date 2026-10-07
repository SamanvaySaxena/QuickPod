# QuickPod

> Turn YouTube lectures into structured study guides.

QuickPod is a full-stack learning application that takes a YouTube lecture, extracts its transcript, sends the educational content to Gemini, and turns it into a structured study guide.

Generated guides are stored securely per user, allowing them to be viewed later from their history.

---

## Features

* Google authentication through Supabase Auth
* Secure FastAPI backend with JWT verification
* YouTube video URL validation
* YouTube transcript extraction with language fallback
* Automatic English study-guide generation
* Structured Gemini output using a Pydantic schema
* Gemini retry/backoff for transient `429` and `503` failures
* Persistent study-guide storage in Supabase PostgreSQL
* Row Level Security (RLS) for per-user data isolation
* Study-guide history
* Open previously generated study guides
* Delete saved study guides
* Frontend route protection
* Request validation and size limits
* Generation rate limiting
* Restricted CORS
* Safe backend error handling and logging
* Dark, minimal, academic UI

---

## How QuickPod Works

```text
                    ┌─────────────────────┐
                    │      Next.js        │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                       Supabase Auth
                               │
                               ▼
                    ┌─────────────────────┐
                    │       FastAPI       │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
               ┌───────────────┼────────────────┐
               │               │                │
               ▼               ▼                ▼
        YouTube API      Gemini API        Supabase
        Transcript       Study Guide       PostgreSQL
                                          + RLS
```

### Generation flow

```text
User logs in with Google
        ↓
User submits YouTube URL
        ↓
FastAPI verifies the Supabase JWT
        ↓
YouTube URL is validated
        ↓
Transcript is extracted
        ↓
Transcript is validated and size-limited
        ↓
Gemini generates structured study guide
        ↓
Study guide is stored in Supabase
        ↓
Guide is returned to the frontend
        ↓
User can read, save, revisit, or delete it
```

---

# Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase SSR
* Supabase browser client

## Backend

* Python
* FastAPI
* Uvicorn
* Pydantic
* Pydantic Settings
* Supabase Python SDK
* YouTube Transcript API
* Google GenAI SDK

## Infrastructure / Services

* Supabase Auth
* Supabase PostgreSQL
* Google Gemini
* YouTube transcript service

---

# Project Structure

```text
QuickPod/
│
├── Backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── rate_limit.py
│   │   │
│   │   ├── api/
│   │   │   ├── dependencies.py
│   │   │   └── routes/
│   │   │       ├── health.py
│   │   │       └── study_guides.py
│   │   │
│   │   ├── schemas/
│   │   │   └── study_guide.py
│   │   │
│   │   └── services/
│   │       ├── gemini.py
│   │       ├── supabase_service.py
│   │       └── youtube.py
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   └── requirements.txt
│
├── Frontend/
│   ├── app/
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   │
│   │   ├── history/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ErrorMessage.tsx
│   │   ├── Generator.tsx
│   │   ├── KeyTakeaways.tsx
│   │   ├── LoadingState.tsx
│   │   ├── Navbar.tsx
│   │   ├── StudyGuide.tsx
│   │   └── StudyGuideSection.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   └── supabase/
│   │       ├── client.ts
│   │       ├── proxy.ts
│   │       └── server.ts
│   │
│   ├── types/
│   │   └── study-guide.ts
│   │
│   ├── .env.local
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

---

# Prerequisites

Before running QuickPod locally, install:

* Python 3.11+
* Node.js 20+
* npm
* Git
* A Supabase project
* A Google OAuth configuration through Supabase
* A Gemini API key

You also need a working internet connection because QuickPod communicates with Supabase, YouTube transcript services, and Gemini.

---

# 1. Clone the Repository

Replace the placeholder with the actual GitHub repository URL.

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd QuickPod
```

---

# 2. Configure Supabase

Create a project at Supabase and configure Google authentication.

## Authentication

In the Supabase dashboard:

1. Open **Authentication**.
2. Configure the **Google** provider.
3. Add your Google OAuth credentials.
4. Configure the local redirect URL.

For local development, the callback route is:

```text
http://localhost:3000/auth/callback
```

The application uses:

```text
Frontend
    ↓
Supabase Google OAuth
    ↓
/auth/callback
    ↓
Supabase session
```

Make sure the URL is also configured in the appropriate Supabase authentication URL settings.

---

# 3. Create the Database Table

QuickPod stores generated guides in:

```text
public.study_guides
```

The table contains:

| Column        | Type          | Description                        |
| ------------- | ------------- | ---------------------------------- |
| `id`          | `uuid`        | Unique study-guide ID              |
| `user_id`     | `uuid`        | Owner, referencing `auth.users.id` |
| `video_id`    | `text`        | YouTube video ID                   |
| `youtube_url` | `text`        | Original YouTube URL               |
| `title`       | `text`        | Study-guide title                  |
| `study_guide` | `jsonb`       | Complete structured study guide    |
| `created_at`  | `timestamptz` | Creation timestamp                 |

Run the following in the Supabase SQL Editor:

```sql
create table public.study_guides (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    video_id text not null,

    youtube_url text not null,

    title text not null,

    study_guide jsonb not null,

    created_at timestamptz not null default now()
);

create index study_guides_user_id_idx
on public.study_guides(user_id);
```

---

# 4. Enable Row Level Security

QuickPod uses Supabase RLS so users can only access their own study guides.

Run:

```sql
alter table public.study_guides
enable row level security;
```

Then configure the required privileges:

```sql
revoke all
on table public.study_guides
from anon, authenticated;

grant select, insert, delete
on table public.study_guides
to authenticated;
```

Create the policies:

```sql
create policy "Users can view their own study guides"
on public.study_guides
for select
to authenticated
using (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
);

create policy "Users can create their own study guides"
on public.study_guides
for insert
to authenticated
with check (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
);

create policy "Users can delete their own study guides"
on public.study_guides
for delete
to authenticated
using (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
);
```

There is intentionally no public database access and no update operation exposed by the current application.

---

# 5. Backend Setup

Open a terminal inside:

```text
QuickPod/Backend
```

## Create a virtual environment

Windows:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.venv\Scripts\activate
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## Install dependencies

```bash
pip install -r requirements.txt
```

---

# 6. Backend Environment Variables

Create:

```text
Backend/.env
```

Use your actual credentials:

```env
APP_NAME=QuickPod

SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_JWKS_URL=

GEMINI_API_KEY=

CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

MAX_REQUEST_BODY_BYTES=16384
MAX_TRANSCRIPT_CHARS=100000

GENERATION_REQUESTS_PER_USER_PER_MINUTE=5
GENERATION_REQUESTS_PER_IP_PER_MINUTE=20
```

Do **not** commit the real `.env` file.

Use `Backend/.env.example` as the public template.

---

# 7. Run the Backend

From:

```text
QuickPod/Backend
```

run:

```bash
uvicorn app.main:app --reload --port 8000
```

The backend will be available at:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/health
```

Swagger documentation:

```text
http://localhost:8000/docs
```

---

# 8. Frontend Setup

Open a second terminal inside:

```text
QuickPod/Frontend
```

Install dependencies:

```bash
npm install
```

---

# 9. Frontend Environment Variables

Create:

```text
Frontend/.env.local
```

Add your real project values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The `NEXT_PUBLIC_` variables are intentionally available to the browser.

Do not put the Gemini API key or any Supabase secret/service-role credential in the frontend.

---

# 10. Run the Frontend

From:

```text
QuickPod/Frontend
```

run:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:3000
```

Open it in your browser.

---

# 11. Using QuickPod

## Step 1 — Sign in

Click:

```text
Login / Sign Up
```

and authenticate with Google.

## Step 2 — Generate a guide

Paste a normal YouTube video URL.

Example format:

```text
https://www.youtube.com/watch?v=VIDEO_ID
```

QuickPod validates the URL and rejects unsupported YouTube formats such as Shorts.

## Step 3 — Wait for generation

QuickPod:

```text
Validates the video
        ↓
Fetches the transcript
        ↓
Processes the transcript
        ↓
Generates the structured guide with Gemini
        ↓
Stores the result in Supabase
```

## Step 4 — Study

The generated guide contains:

* Title
* Overview
* Sections
* Explanations
* Key points
* Examples
* Key takeaways

## Step 5 — History

Open:

```text
History
```

Previously generated guides are stored per authenticated user.

From History you can:

* Open a guide
* Open the original YouTube video
* Delete a guide

---

# API Reference

The FastAPI backend currently exposes the following study-guide endpoints.

## Health

```http
GET /health
```

Returns the backend health status.

---

## Generate and save a study guide

```http
POST /study-guides
```

Request:

```json
{
  "yt_url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

Requires:

```http
Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
```

Successful response:

```json
{
  "user_id": "...",
  "video_id": "...",
  "study_guide": {
    "title": "...",
    "overview": "...",
    "sections": [],
    "key_takeaways": []
  }
}
```

---

## Get study-guide history

```http
GET /study-guides
```

Returns the authenticated user's saved guides.

Requires:

```http
Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
```

---

## Get one study guide

```http
GET /study-guides/{study_guide_id}
```

The ID must be a valid UUID.

Only the authenticated user's own guide can be returned.

---

## Delete one study guide

```http
DELETE /study-guides/{study_guide_id}
```

Only the authenticated user's own guide can be deleted.

Successful response:

```text
204 No Content
```

---

# Authentication Architecture

QuickPod uses Supabase for authentication and FastAPI as the application security boundary.

```text
Google
   ↓
Supabase Auth
   ↓
Supabase session
   ↓
Next.js access token
   ↓
Authorization: Bearer <token>
   ↓
FastAPI
   ↓
JWT verification
   ↓
Application logic
```

The frontend does not send Gemini credentials to the browser.

---

# Database Security

QuickPod uses Row Level Security.

A user's database identity is determined by:

```text
auth.uid()
```

and compared to:

```text
study_guides.user_id
```

Conceptually:

```text
User A
  ↓
auth.uid() = A
  ↓
Can access User A's guides
```

while:

```text
User A
  ↓
tries to access User B's guide
  ↓
RLS
  ↓
Access denied / row unavailable
```

This ensures ownership is enforced at the database layer rather than relying only on frontend checks.

---

# Security Controls

QuickPod currently implements several defensive controls.

## Authentication

All study-guide API operations require an authenticated Supabase user.

## CORS

The backend only allows explicitly configured frontend origins.

## Request validation

The YouTube URL is validated before transcript processing.

## Request-size limiting

Large request bodies are rejected before entering the generation pipeline.

## Transcript limits

Excessively large transcripts are rejected before being sent to Gemini.

## Rate limiting

Study-guide generation is rate-limited per user and per IP address.

## UUID validation

Study-guide IDs are validated as UUIDs before reaching database queries.

## Gemini retry handling

Transient Gemini `429` and `503` failures are retried with bounded exponential backoff.

## Secret management

Credentials are stored in environment variables and are not included in the repository.

## RLS

Database access is restricted to the authenticated resource owner.

---

# Error Responses

The backend uses HTTP status codes to distinguish common failures.

| Status | Meaning                                     |
| ------ | ------------------------------------------- |
| `400`  | Invalid request or YouTube URL              |
| `401`  | Missing, invalid, or expired authentication |
| `404`  | Video or study guide not found              |
| `409`  | Resource conflict, if applicable            |
| `413`  | Request/transcript too large                |
| `422`  | Validation/transcript-related error         |
| `429`  | Rate limit exceeded                         |
| `503`  | External service unavailable                |

---

# Gemini

QuickPod currently uses:

```text
gemini-3.5-flash-lite
```

The model receives the transcript and returns a structured response matching the backend's `StudyGuide` Pydantic schema.

The expected structure is:

```json
{
  "title": "string",
  "overview": "string",
  "sections": [
    {
      "heading": "string",
      "explanation": "string",
      "key_points": [],
      "examples": []
    }
  ],
  "key_takeaways": []
}
```

The application instructs Gemini to produce the final study guide entirely in English, regardless of the transcript's language.

---

# Transcript Handling

QuickPod follows this strategy:

1. Validate the YouTube URL.
2. Extract the video ID.
3. Prefer an English transcript.
4. If English is unavailable, use another available transcript.
5. Send the transcript to Gemini.
6. Generate the final study guide in English.

This allows QuickPod to handle lectures whose available transcript is not English.

---

# Environment Files

The repository contains environment templates:

```text
Backend/.env.example
Frontend/.env.example
```

These files contain variable names but no secrets.

Actual local environment files should be:

```text
Backend/.env
Frontend/.env.local
```

They are ignored by Git.

Never commit:

```text
GEMINI_API_KEY
Supabase secret/service-role keys
private OAuth credentials
```

---

# Development Notes

Run the backend and frontend in separate terminals.

### Terminal 1

```bash
cd Backend
```

Activate your virtual environment and run:

```bash
uvicorn app.main:app --reload --port 8000
```

### Terminal 2

```bash
cd Frontend
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# Troubleshooting

## Frontend cannot connect to backend

Check:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

and make sure FastAPI is running.

---

## CORS error

Check:

```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Then restart FastAPI.

The browser origin must exactly match one of the configured origins.

---

## Google login does not work

Check the Supabase Google provider configuration and make sure the OAuth redirect/callback URL is correctly configured.

Local callback:

```text
http://localhost:3000/auth/callback
```

---

## Gemini requests fail

Check:

```env
GEMINI_API_KEY=
```

and verify that the backend can reach Google's Gemini API.

Transient `429` and `503` failures are retried automatically by the configured SDK retry policy.

---

## Study guide is not saved

Check:

* Supabase table exists
* RLS is enabled
* `authenticated` has the required table grants
* Study-guide RLS policies exist
* FastAPI is receiving a valid Supabase access token

---

## History is empty

Check that the current authenticated user has generated at least one study guide.

Because of RLS, the History API only returns guides owned by the authenticated user.

---

# Git Safety

Before pushing the project to GitHub, verify that Git is not tracking:

```text
Backend/.env
Frontend/.env.local
Backend/.venv/
Frontend/node_modules/
Frontend/.next/
```

Useful command:

```bash
git status
```

Never commit secrets just because they are already present in a local file.

---

# Contributing

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Test the complete local flow.
5. Commit your changes.

```bash
git add .
git commit -m "feat: describe your change"
```

6. Push the branch.

```bash
git push origin feature/your-feature
```

7. Open a pull request.

---

# Project Status

QuickPod currently provides a complete authenticated study-guide workflow:

```text
Google Login
     ↓
YouTube URL
     ↓
Transcript Extraction
     ↓
Gemini Study Guide Generation
     ↓
Supabase Persistence
     ↓
History
     ↓
Open / Delete
```

The project is designed as a decoupled full-stack application, with Next.js responsible for the user interface and FastAPI responsible for application logic, validation, third-party processing, and backend security.
