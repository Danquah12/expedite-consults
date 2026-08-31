from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime

class AttachmentOut(BaseModel):
    id: UUID
    filename: str
    content_type: str
    size_bytes: int
    s3_key: str
    is_inline: bool

    class Config:
        from_attributes = True

class MessageOut(BaseModel):
    id: UUID
    thread_id: UUID
    message_id: str
    in_reply_to: Optional[str] = None
    from_address: str
    from_name: Optional[str] = None
    to_addresses: List[Any]
    cc_addresses: List[Any]
    bcc_addresses: List[Any]
    subject: str
    body_plain: Optional[str] = None
    body_html: Optional[str] = None
    snippet: Optional[str] = None
    is_read: bool
    is_starred: bool
    is_draft: bool
    has_attachments: bool
    ai_summary: Optional[str] = None
    sent_at: Optional[datetime] = None
    received_at: datetime
    attachments: List[AttachmentOut] = []

    class Config:
        from_attributes = True

class ThreadOut(BaseModel):
    id: UUID
    subject: str
    snippet: Optional[str] = None
    last_message_at: datetime
    message_count: int
    is_read: bool
    is_starred: bool
    has_attachments: bool
    ai_summary: Optional[str] = None
    ai_category: str
    created_at: datetime

    class Config:
        from_attributes = True

class ThreadDetailOut(ThreadOut):
    messages: List[MessageOut] = []

class MailboxOut(BaseModel):
    id: UUID
    name: str
    role: str
    color: Optional[str] = "#6B7280"
    total_messages: int
    unread_messages: int

    class Config:
        from_attributes = True

class SendMessageRequest(BaseModel):
    to_addresses: List[str]
    cc_addresses: Optional[List[str]] = []
    bcc_addresses: Optional[List[str]] = []
    subject: str
    body_html: str
    body_plain: Optional[str] = None
    in_reply_to: Optional[str] = None
    thread_id: Optional[UUID] = None
    attachment_ids: Optional[List[UUID]] = []

class SaveDraftRequest(BaseModel):
    draft_id: Optional[UUID] = None
    thread_id: Optional[UUID] = None
    to_addresses: Optional[List[str]] = []
    cc_addresses: Optional[List[str]] = []
    bcc_addresses: Optional[List[str]] = []
    subject: Optional[str] = ""
    body_html: Optional[str] = ""
    body_plain: Optional[str] = ""
