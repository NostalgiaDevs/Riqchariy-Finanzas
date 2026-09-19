from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.modules.auth.router import router as auth_router
from app.modules.chatbot.router import router as chatbot_router
from app.modules.game.router import router as game_router
from app.modules.pacha.router import router as pacha_router

VERSION = "0.1.0"

settings = get_settings()

app = FastAPI(title="Riqchariy API", version=VERSION, debug=settings.app_debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(pacha_router, prefix="/api/v1/pacha", tags=["pacha"])
app.include_router(game_router, prefix="/api/v1/games", tags=["game"])
app.include_router(chatbot_router, prefix="/api/v1/chatbot", tags=["chatbot"])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "version": VERSION}
