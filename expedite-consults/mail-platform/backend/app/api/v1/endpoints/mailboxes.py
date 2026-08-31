from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models import User, Mailbox
from app.schemas.mail import MailboxOut
from app.api.deps import get_current_user
from app.services.mail_service import mail_service

router = APIRouter()

@router.get("", response_model=List[MailboxOut])
async def list_mailboxes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Ensure default mailboxes exist
    await mail_service.initialize_user_mailboxes(db, current_user.id)
    
    res = await db.execute(
        select(Mailbox).where(Mailbox.user_id == current_user.id).order_by(Mailbox.created_at.asc())
    )
    return list(res.scalars().all())
