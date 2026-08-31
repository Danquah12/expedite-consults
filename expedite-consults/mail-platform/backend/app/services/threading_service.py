import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.db.models import Thread, Message
from app.services.mime_parser import normalize_subject

class ThreadingService:
    @staticmethod
    async def resolve_or_create_thread(
        db: AsyncSession,
        user_id: uuid.UUID,
        subject: str,
        in_reply_to: Optional[str] = None,
        references: Optional[str] = None,
        explicit_thread_id: Optional[uuid.UUID] = None
    ) -> Thread:
        # 1. Explicit thread ID passed by client
        if explicit_thread_id:
            res = await db.execute(
                select(Thread).where(and_(Thread.id == explicit_thread_id, Thread.user_id == user_id))
            )
            thread = res.scalar_one_or_none()
            if thread:
                return thread

        # 2. Match by In-Reply-To header
        if in_reply_to:
            res = await db.execute(
                select(Message).where(and_(Message.message_id == in_reply_to, Message.user_id == user_id))
            )
            matched_parent_msg = res.scalar_one_or_none()
            if matched_parent_msg:
                thread_res = await db.execute(
                    select(Thread).where(Thread.id == matched_parent_msg.thread_id)
                )
                thread = thread_res.scalar_one_or_none()
                if thread:
                    return thread

        # 3. Match by References header (split tokens)
        if references:
            ref_tokens = [tok.strip() for tok in references.split() if tok.strip()]
            if ref_tokens:
                res = await db.execute(
                    select(Message).where(and_(Message.message_id.in_(ref_tokens), Message.user_id == user_id))
                )
                matched_ref_msg = res.scalars().first()
                if matched_ref_msg:
                    thread_res = await db.execute(
                        select(Thread).where(Thread.id == matched_ref_msg.thread_id)
                    )
                    thread = thread_res.scalar_one_or_none()
                    if thread:
                        return thread

        # 4. Fallback: Match by normalized subject within the same user's mailbox
        norm_subj = normalize_subject(subject)
        if norm_subj:
            res = await db.execute(
                select(Thread).where(
                    and_(
                        Thread.user_id == user_id,
                        Thread.normalized_subject == norm_subj
                    )
                ).order_by(Thread.last_message_at.desc())
            )
            existing_thread = res.scalars().first()
            if existing_thread:
                return existing_thread

        # 5. Create a new thread
        new_thread = Thread(
            user_id=user_id,
            subject=subject or "(No Subject)",
            normalized_subject=norm_subj or "(No Subject)",
            message_count=0,
            is_read=False,
            is_starred=False,
            has_attachments=False,
            ai_category="primary"
        )
        db.add(new_thread)
        await db.flush()
        return new_thread

threading_service = ThreadingService()
