import uuid
import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, update, delete
from sqlalchemy.orm import selectinload

from app.db.models import Domain, User, Mailbox, Thread, Message, Attachment, message_mailboxes
from app.services.s3_service import s3_service
from app.services.smtp_service import smtp_dispatcher
from app.services.threading_service import threading_service
from app.services.ai_service import ai_service
from app.services.mime_parser import MimeEmailParser

DEFAULT_MAILBOXES = [
    {"name": "Inbox", "role": "inbox", "color": "#3B82F6"},
    {"name": "Starred", "role": "starred", "color": "#F59E0B"},
    {"name": "Sent", "role": "sent", "color": "#10B981"},
    {"name": "Drafts", "role": "drafts", "color": "#8B5CF6"},
    {"name": "Spam", "role": "spam", "color": "#EF4444"},
    {"name": "Trash", "role": "trash", "color": "#6B7280"},
    {"name": "Archive", "role": "archive", "color": "#06B6D4"}
]

class MailService:
    @staticmethod
    async def initialize_user_mailboxes(db: AsyncSession, user_id: uuid.UUID):
        for mb in DEFAULT_MAILBOXES:
            res = await db.execute(
                select(Mailbox).where(and_(Mailbox.user_id == user_id, Mailbox.role == mb["role"]))
            )
            if not res.scalar_one_or_none():
                new_mb = Mailbox(
                    user_id=user_id,
                    name=mb["name"],
                    role=mb["role"],
                    color=mb["color"],
                    total_messages=0,
                    unread_messages=0
                )
                db.add(new_mb)
        await db.commit()

    @staticmethod
    async def get_mailbox_by_role(db: AsyncSession, user_id: uuid.UUID, role: str) -> Optional[Mailbox]:
        res = await db.execute(
            select(Mailbox).where(and_(Mailbox.user_id == user_id, Mailbox.role == role))
        )
        return res.scalar_one_or_none()

    @staticmethod
    async def send_message(
        db: AsyncSession,
        user: User,
        to_addresses: List[str],
        subject: str,
        body_html: str,
        body_plain: Optional[str] = None,
        cc_addresses: Optional[List[str]] = None,
        bcc_addresses: Optional[List[str]] = None,
        in_reply_to: Optional[str] = None,
        thread_id: Optional[uuid.UUID] = None,
        attachment_ids: Optional[List[uuid.UUID]] = None
    ) -> Message:
        # 1. Resolve attachments if any
        loaded_attachments = []
        has_attachments = False
        if attachment_ids:
            att_res = await db.execute(
                select(Attachment).where(Attachment.id.in_(attachment_ids))
            )
            for att in att_res.scalars().all():
                file_bytes = s3_service.download_file_bytes(att.s3_key)
                loaded_attachments.append({
                    "filename": att.filename,
                    "data": file_bytes,
                    "content_type": att.content_type
                })
            has_attachments = len(loaded_attachments) > 0

        # 2. Dispatch email via SMTP
        message_id_header = await smtp_dispatcher.send_email(
            from_address=user.email,
            to_addresses=to_addresses,
            subject=subject,
            body_html=body_html,
            body_plain=body_plain or "",
            cc_addresses=cc_addresses,
            bcc_addresses=bcc_addresses,
            in_reply_to=in_reply_to,
            attachments=loaded_attachments
        )
        if not message_id_header:
            message_id_header = f"<{uuid.uuid4()}@{user.email.split('@')[-1]}>"

        # 3. Resolve or create Thread
        thread = await threading_service.resolve_or_create_thread(
            db=db,
            user_id=user.id,
            subject=subject,
            in_reply_to=in_reply_to,
            explicit_thread_id=thread_id
        )

        # 4. Save Message Record
        msg = Message(
            thread_id=thread.id,
            user_id=user.id,
            message_id=message_id_header,
            in_reply_to=in_reply_to,
            from_address=user.email,
            from_name=user.display_name or user.email,
            to_addresses=to_addresses,
            cc_addresses=cc_addresses or [],
            bcc_addresses=bcc_addresses or [],
            subject=subject,
            body_plain=body_plain or "",
            body_html=body_html,
            snippet=body_plain[:120] if body_plain else "",
            is_read=True,
            is_starred=False,
            is_draft=False,
            has_attachments=has_attachments,
            sent_at=datetime.datetime.now(datetime.timezone.utc),
            received_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(msg)
        await db.flush()

        # 5. Link to 'Sent' Mailbox
        sent_mailbox = await MailService.get_mailbox_by_role(db, user.id, "sent")
        if sent_mailbox:
            await db.execute(
                message_mailboxes.insert().values(message_id=msg.id, mailbox_id=sent_mailbox.id)
            )
            sent_mailbox.total_messages += 1

        # 6. Update Thread metadata
        thread.last_message_at = msg.received_at
        thread.snippet = msg.snippet
        thread.message_count += 1
        if has_attachments:
            thread.has_attachments = True

        await db.commit()
        return msg

    @staticmethod
    async def ingest_incoming_email(
        db: AsyncSession,
        recipient_email: str,
        raw_email_bytes: bytes
    ) -> Optional[Message]:
        # 1. Lookup recipient user
        user_res = await db.execute(
            select(User).where(and_(User.email == recipient_email, User.is_active == True))
        )
        user = user_res.scalar_one_or_none()
        if not user:
            # Check aliases
            alias_res = await db.execute(
                select(User).join(Domain).join(User.domain).where(User.email == recipient_email)
            )
            user = alias_res.scalar_one_or_none()
            if not user:
                return None

        # 2. Parse MIME structure
        parsed = MimeEmailParser.parse_raw_email(raw_email_bytes)

        # 3. Store raw MIME payload in MinIO / S3
        raw_s3_key = f"raw_emails/{user.id}/{uuid.uuid4().hex}.eml"
        s3_service.upload_file_bytes(raw_s3_key, raw_email_bytes, "message/rfc822")

        # 4. Resolve Thread
        thread = await threading_service.resolve_or_create_thread(
            db=db,
            user_id=user.id,
            subject=parsed["subject"],
            in_reply_to=parsed["in_reply_to"],
            references=parsed["references"]
        )

        # 5. Triage categorization
        triage = ai_service.classify_email(
            parsed["subject"],
            parsed["body_plain"] or "",
            parsed["from_address"]
        )

        # 6. Create Message record
        msg = Message(
            thread_id=thread.id,
            user_id=user.id,
            message_id=parsed["message_id"],
            in_reply_to=parsed["in_reply_to"],
            references_header=parsed["references"],
            from_address=parsed["from_address"],
            from_name=parsed["from_name"],
            to_addresses=parsed["to_addresses"],
            cc_addresses=parsed["cc_addresses"],
            bcc_addresses=parsed["bcc_addresses"],
            subject=parsed["subject"],
            body_plain=parsed["body_plain"],
            body_html=parsed["body_html"],
            snippet=parsed["snippet"],
            raw_s3_key=raw_s3_key,
            size_bytes=parsed["size_bytes"],
            is_read=False,
            is_starred=False,
            is_draft=False,
            has_attachments=len(parsed["attachments"]) > 0,
            received_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(msg)
        await db.flush()

        # 7. Upload and link attachments to MinIO
        for att in parsed["attachments"]:
            s3_key = f"attachments/{user.id}/{msg.id}/{att['filename']}"
            s3_service.upload_file_bytes(s3_key, att["data"], att["content_type"])
            attachment_record = Attachment(
                message_id=msg.id,
                filename=att["filename"],
                content_type=att["content_type"],
                size_bytes=att["size_bytes"],
                s3_key=s3_key,
                content_id=att["content_id"],
                is_inline=att["is_inline"]
            )
            db.add(attachment_record)

        # 8. Associate with Inbox (or Spam if classified)
        target_role = "spam" if triage["category"] == "promotions_spam" else "inbox"
        inbox_mailbox = await MailService.get_mailbox_by_role(db, user.id, target_role)
        if inbox_mailbox:
            await db.execute(
                message_mailboxes.insert().values(message_id=msg.id, mailbox_id=inbox_mailbox.id)
            )
            inbox_mailbox.total_messages += 1
            inbox_mailbox.unread_messages += 1

        # 9. Update Thread
        thread.last_message_at = msg.received_at
        thread.snippet = msg.snippet
        thread.message_count += 1
        thread.is_read = False
        thread.ai_category = triage["category"]
        if len(parsed["attachments"]) > 0:
            thread.has_attachments = True

        await db.commit()
        return msg

mail_service = MailService()
