import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, BigInteger, Integer, DateTime, Text,
    ForeignKey, Table, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

# Association table for Message <-> Mailbox (multi-folder/label)
message_mailboxes = Table(
    "message_mailboxes",
    Base.metadata,
    Column("message_id", UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), primary_key=True),
    Column("mailbox_id", UUID(as_uuid=True), ForeignKey("mailboxes.id", ondelete="CASCADE"), primary_key=True),
    Column("created_at", DateTime(timezone=True), server_default=func.now())
)

class Domain(Base):
    __tablename__ = "domains"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    dkim_selector = Column(String(64), default="default")
    dkim_private_key = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    users = relationship("User", back_populates="domain", cascade="all, delete-orphan")
    aliases = relationship("Alias", back_populates="domain", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain_id = Column(UUID(as_uuid=True), ForeignKey("domains.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(255), nullable=True)
    recovery_email = Column(String(255), nullable=True)
    quota_bytes = Column(BigInteger, default=10737418240)  # 10 GB
    used_bytes = Column(BigInteger, default=0)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    mfa_secret = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    domain = relationship("Domain", back_populates="users")
    mailboxes = relationship("Mailbox", back_populates="user", cascade="all, delete-orphan")
    threads = relationship("Thread", back_populates="user", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="user", cascade="all, delete-orphan")

class Alias(Base):
    __tablename__ = "aliases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    domain_id = Column(UUID(as_uuid=True), ForeignKey("domains.id", ondelete="CASCADE"), nullable=False)
    source = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    domain = relationship("Domain", back_populates="aliases")

class Mailbox(Base):
    __tablename__ = "mailboxes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)  # 'inbox', 'sent', 'drafts', 'trash', 'spam', 'starred', 'archive', 'custom'
    color = Column(String(20), default="#6B7280")
    total_messages = Column(Integer, default=0)
    unread_messages = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="mailboxes")
    messages = relationship("Message", secondary=message_mailboxes, back_populates="mailboxes")

class Thread(Base):
    __tablename__ = "threads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject = Column(String(998), nullable=False)
    normalized_subject = Column(String(998), nullable=False)
    snippet = Column(Text, nullable=True)
    last_message_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    message_count = Column(Integer, default=1)
    is_read = Column(Boolean, default=False)
    is_starred = Column(Boolean, default=False)
    has_attachments = Column(Boolean, default=False)
    ai_summary = Column(Text, nullable=True)
    ai_category = Column(String(50), default="primary")  # 'primary', 'updates', 'promotions', 'urgent'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="threads")
    messages = relationship("Message", back_populates="thread", cascade="all, delete-orphan", order_by="Message.received_at")

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("threads.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message_id = Column(String(998), nullable=False, index=True)
    in_reply_to = Column(String(998), nullable=True)
    references_header = Column(Text, nullable=True)
    from_address = Column(String(255), nullable=False)
    from_name = Column(String(255), nullable=True)
    to_addresses = Column(JSONB, nullable=False, default=list)
    cc_addresses = Column(JSONB, nullable=False, default=list)
    bcc_addresses = Column(JSONB, nullable=False, default=list)
    reply_to = Column(String(255), nullable=True)
    subject = Column(String(998), nullable=False)
    body_plain = Column(Text, nullable=True)
    body_html = Column(Text, nullable=True)
    snippet = Column(Text, nullable=True)
    raw_s3_key = Column(String(512), nullable=True)
    size_bytes = Column(BigInteger, default=0)
    is_read = Column(Boolean, default=False)
    is_starred = Column(Boolean, default=False)
    is_draft = Column(Boolean, default=False)
    has_attachments = Column(Boolean, default=False)
    ai_summary = Column(Text, nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    received_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    thread = relationship("Thread", back_populates="messages")
    user = relationship("User", back_populates="messages")
    mailboxes = relationship("Mailbox", secondary=message_mailboxes, back_populates="messages")
    attachments = relationship("Attachment", back_populates="message", cascade="all, delete-orphan")

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(128), nullable=False)
    size_bytes = Column(BigInteger, nullable=False)
    s3_key = Column(String(512), nullable=False)
    content_id = Column(String(255), nullable=True)
    is_inline = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    message = relationship("Message", back_populates="attachments")
