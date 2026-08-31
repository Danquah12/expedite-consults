from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models import User, Message, Thread
from app.schemas.mail import SendMessageRequest, MessageOut, SaveDraftRequest
from app.api.deps import get_current_user
from app.services.mail_service import mail_service
from app.services.s3_service import s3_service

router = APIRouter()

@router.post("/send", response_model=MessageOut)
async def send_email_message(
    payload: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not payload.to_addresses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Recipient 'to_addresses' is required")

    try:
        msg = await mail_service.send_message(
            db=db,
            user=current_user,
            to_addresses=payload.to_addresses,
            subject=payload.subject,
            body_html=payload.body_html,
            body_plain=payload.body_plain,
            cc_addresses=payload.cc_addresses,
            bcc_addresses=payload.bcc_addresses,
            in_reply_to=payload.in_reply_to,
            thread_id=payload.thread_id,
            attachment_ids=payload.attachment_ids
        )
        return msg
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to dispatch email: {str(e)}"
        )

@router.post("/ingest-raw")
async def ingest_raw_email(
    recipient: str,
    raw_payload: str = Body(..., media_type="text/plain"),
    db: AsyncSession = Depends(get_db)
):
    """
    Webhook / LMTP pipe handler to ingest incoming raw RFC 822 email payload.
    """
    msg = await mail_service.ingest_incoming_email(
        db=db,
        recipient_email=recipient,
        raw_email_bytes=raw_payload.encode("utf-8")
    )
    if not msg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipient {recipient} not found or inactive"
        )
    return {"status": "ingested", "message_id": msg.message_id, "thread_id": str(msg.thread_id)}
