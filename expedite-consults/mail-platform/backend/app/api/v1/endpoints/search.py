from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models import User
from app.schemas.mail import ThreadOut
from app.api.deps import get_current_user
from app.services.search_service import search_engine

router = APIRouter()

@router.get("", response_model=List[ThreadOut])
async def search_mailbox(
    q: str = Query(..., min_length=1, description="Gmail-style search query: from:, to:, subject:, has:attachment, etc."),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    threads = await search_engine.search_threads(
        db=db,
        user_id=current_user.id,
        raw_query=q,
        limit=limit,
        offset=offset
    )
    return threads
