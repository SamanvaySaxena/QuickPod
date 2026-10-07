from fastapi import FastAPI, Request
import uvicorn
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.study_guides import router as study_guides_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings

app = FastAPI()

cors_origins = [
    origin.strip()
    for origin in settings.cors_origins.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

MAX_REQUEST_BODY_BYTES = settings.max_request_body_bytes

@app.middleware("http")
async def limit_request_body(
    request: Request,
    call_next,
):
    if (
        request.method == "POST"
        and request.url.path == "/study-guides"
    ):
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                body_size = int(content_length)
            except ValueError:
                return JSONResponse(
                    status_code=400,
                    content={
                        "detail": "Invalid Content-Length header"
                    },
                )
            if body_size > MAX_REQUEST_BODY_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={
                        "detail": "Request body is too large"
                    },
                )
    return await call_next(request)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(study_guides_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)