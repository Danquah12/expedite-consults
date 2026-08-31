import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.db.models import User, Thread, Message
from app.schemas.ai import SummarizeRequest, SummarizeResponse, GenerateReplyRequest, GenerateReplyResponse
from app.api.deps import get_current_user
from app.services.ai_service import ai_service

router = APIRouter()

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_email_thread(
    payload: SummarizeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Thread)
        .options(selectinload(Thread.messages))
        .where(and_(Thread.id == payload.thread_id, Thread.user_id == current_user.id))
    )
    res = await db.execute(query)
    thread = res.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")

    messages_data = [
        {
            "from_name": m.from_name,
            "from_address": m.from_address,
            "subject": m.subject,
            "body_plain": m.body_plain,
            "snippet": m.snippet,
            "received_at": m.received_at.isoformat() if m.received_at else None
        }
        for m in thread.messages
    ]

    summary_result = await ai_service.summarize_thread(messages_data)
    
    # Cache summary on thread
    thread.ai_summary = summary_result["summary"]
    await db.commit()

    return SummarizeResponse(
        thread_id=thread.id,
        summary=summary_result["summary"],
        key_points=summary_result["key_points"],
        action_items=summary_result["action_items"]
    )

@router.post("/generate-reply", response_model=GenerateReplyResponse)
async def generate_reply_draft(
    payload: GenerateReplyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = (
        select(Thread)
        .options(selectinload(Thread.messages))
        .where(and_(Thread.id == payload.thread_id, Thread.user_id == current_user.id))
    )
    res = await db.execute(query)
    thread = res.scalar_one_or_none()
    if not thread or not thread.messages:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found or empty")

    latest_message = thread.messages[-1]
    sender_name = latest_message.from_name or latest_message.from_address.split("@")[0]

    draft_result = await ai_service.generate_reply_draft(
        thread_subject=thread.subject,
        last_message_body=latest_message.body_plain or latest_message.snippet or "",
        sender_name=sender_name,
        tone=payload.tone or "professional",
        custom_instructions=payload.custom_instructions or ""
    )

    return GenerateReplyResponse(
        subject=draft_result["subject"],
        body_html=draft_result["body_html"],
        body_plain=draft_result["body_plain"],
        suggested_quick_replies=draft_result["suggested_quick_replies"]
    )
