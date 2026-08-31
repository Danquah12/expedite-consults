from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, update, delete
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.db.models import User, Thread, Message, Mailbox, message_mailboxes, Attachment
from app.schemas.mail import ThreadOut, ThreadDetailOut
from app.api.deps import get_current_user
from app.services.mail_service import mail_service

router = APIRouter()

@router.get("", response_model=List[ThreadOut])
async def list_threads(
    mailbox_role: Optional[str] = Query("inbox", description="Role: inbox, starred, sent, drafts, trash, spam, archive"),
    category: Optional[str] = Query(None, description="AI category filter: primary, updates, promotions, urgent"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Thread).where(Thread.user_id == current_user.id)

    if mailbox_role == "starred":
        query = query.where(Thread.is_starred == True)
    elif mailbox_role:
        mb = await mail_service.get_mailbox_by_role(db, current_user.id, mailbox_role)
        if mb:
            # Join through messages and message_mailboxes
            msg_subquery = (
                select(Message.thread_id)
                .join(message_mailboxes, message_mailboxes.c.message_id == Message.id)
                .where(and_(Message.user_id == current_user.id, message_mailboxes.c.mailbox_id == mb.id))
            )
            query = query.where(Thread.id.in_(msg_subquery))

    if category:
        query = query.where(Thread.ai_category == category)

    query = query.order_by(Thread.last_message_at.desc()).limit(limit).offset(offset)
    res = await db.execute(query)
    return list(res.scalars().all())

@router.get("/{thread_id}", response_model=ThreadDetailOut)
async def get_thread_detail(
    thread_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Thread)
        .options(
            selectinload(Thread.messages).selectinload(Message.attachments)
        )
        .where(and_(Thread.id == thread_id, Thread.user_id == current_user.id))
    )
    res = await db.execute(query)
    thread = res.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")

    # Mark thread and its messages as read
    if not thread.is_read:
        thread.is_read = True
        await db.execute(
            update(Message).where(Message.thread_id == thread.id).values(is_read=True)
        )
        await db.commit()

    return thread

@router.post("/{thread_id}/star")
async def toggle_star(
    thread_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Thread).where(and_(Thread.id == thread_id, Thread.user_id == current_user.id))
    )
    thread = res.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")

    thread.is_starred = not thread.is_starred
    await db.execute(
        update(Message).where(Message.thread_id == thread.id).values(is_starred=thread.is_starred)
    )
    await db.commit()
    return {"thread_id": str(thread_id), "is_starred": thread.is_starred}

@router.delete("/{thread_id}")
async def delete_thread(
    thread_id: uuid.UUID,
    permanent: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Thread).where(and_(Thread.id == thread_id, Thread.user_id == current_user.id))
    )
    thread = res.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")

    if permanent:
        await db.delete(thread)
        await db.commit()
        return {"status": "permanently_deleted"}
    else:
        # Move messages to Trash
        trash_mb = await mail_service.get_mailbox_by_role(db, current_user.id, "trash")
        if trash_mb:
            msg_res = await db.execute(select(Message).where(Message.thread_id == thread_id))
            for m in msg_res.scalars().all():
                # Remove other associations and add to trash
                await db.execute(
                    delete(message_mailboxes).where(message_mailboxes.c.message_id == m.id)
                )
                await db.execute(
                    message_mailboxes.insert().values(message_id=m.id, mailbox_id=trash_mb.id)
                )
            await db.commit()
        return {"status": "moved_to_trash"}
