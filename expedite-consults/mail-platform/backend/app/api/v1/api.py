from fastapi import APIRouter
from app.api.v1.endpoints import auth, mailboxes, threads, messages, attachments, search, ai

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(mailboxes.router, prefix="/mailboxes", tags=["Mailboxes"])
api_router.include_router(threads.router, prefix="/threads", tags=["Threads"])
api_router.include_router(messages.router, prefix="/messages", tags=["Messages"])
api_router.include_router(attachments.router, prefix="/attachments", tags=["Attachments"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Copilot"])
