-- ==============================================================================
-- Axiom Connect: Complete Database Initialization Schema
-- (Outlook-Style Mail + Teams Channels + Calendar + WebRTC Meetings + Drive)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Virtual Domains & Multi-Tenant Orgs
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    dkim_selector VARCHAR(64) DEFAULT 'default',
    dkim_private_key TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Presence Tracking
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    avatar_url VARCHAR(512),
    department VARCHAR(100),
    title VARCHAR(100),
    presence VARCHAR(30) DEFAULT 'available', -- 'available', 'busy', 'in_meeting', 'away', 'offline'
    presence_status_text VARCHAR(255),
    quota_bytes BIGINT DEFAULT 10737418240, -- 10 GB
    used_bytes BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Virtual Aliases
CREATE TABLE IF NOT EXISTS aliases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Mailboxes (Outlook folders: Focused, Other, Sent, Drafts, Trash, etc.)
CREATE TABLE IF NOT EXISTS mailboxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT '#6B7280',
    total_messages INT DEFAULT 0,
    unread_messages INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_mailbox UNIQUE (user_id, role, name)
);

-- 5. Email Threads & Messages
CREATE TABLE IF NOT EXISTS threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(998) NOT NULL,
    normalized_subject VARCHAR(998) NOT NULL,
    snippet TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    message_count INT DEFAULT 1,
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    has_attachments BOOLEAN DEFAULT FALSE,
    is_focused BOOLEAN DEFAULT TRUE, -- Outlook Focused vs Other
    meeting_link VARCHAR(512),       -- Attached Axiom Meeting Link if present
    ai_summary TEXT,
    ai_category VARCHAR(50) DEFAULT 'primary',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id VARCHAR(998) NOT NULL,
    in_reply_to VARCHAR(998),
    references_header TEXT,
    from_address VARCHAR(255) NOT NULL,
    from_name VARCHAR(255),
    to_addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
    cc_addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
    bcc_addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
    subject VARCHAR(998) NOT NULL,
    body_plain TEXT,
    body_html TEXT,
    snippet TEXT,
    meeting_link VARCHAR(512),
    raw_s3_key VARCHAR(512),
    size_bytes BIGINT DEFAULT 0,
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT FALSE,
    is_focused BOOLEAN DEFAULT TRUE,
    has_attachments BOOLEAN DEFAULT FALSE,
    ai_summary TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS message_mailboxes (
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    mailbox_id UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (message_id, mailbox_id)
);

CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(128) NOT NULL,
    size_bytes BIGINT NOT NULL,
    s3_key VARCHAR(512) NOT NULL,
    content_id VARCHAR(255),
    is_inline BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Calendar Events & Invitations
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    meeting_id VARCHAR(64),          -- e.g. 'AXM-492-831'
    meeting_link VARCHAR(512),        -- 'https://meet.axiom.com/AXM-492-831'
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_all_day BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule VARCHAR(255),
    attendees JSONB DEFAULT '[]'::jsonb, -- [{email, name, status: 'accepted'|'tentative'|'declined'}]
    color VARCHAR(20) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Axiom Video Meetings (WebRTC Rooms & AI Transcripts)
CREATE TABLE IF NOT EXISTS meetings (
    id VARCHAR(64) PRIMARY KEY,      -- 'AXM-492-831'
    host_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    scheduled_start TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT FALSE,
    passcode VARCHAR(64),
    waiting_room_enabled BOOLEAN DEFAULT FALSE,
    recording_s3_key VARCHAR(512),
    ai_summary TEXT,
    ai_decisions JSONB DEFAULT '[]'::jsonb,
    ai_action_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meeting_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id VARCHAR(64) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    speaker_name VARCHAR(255) NOT NULL,
    speaker_email VARCHAR(255),
    timestamp_offset_sec INT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Teams Channels & Direct Chat
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    topic VARCHAR(255),
    is_private BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Set if 1-on-1 DM
    parent_message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE, -- Threaded replies
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    reactions JSONB DEFAULT '{}'::jsonb,
    meeting_card JSONB, -- Embedded meeting invite card
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Axiom Drive (Cloud Files & Docs)
CREATE TABLE IF NOT EXISTS drive_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    content_type VARCHAR(128) NOT NULL,
    size_bytes BIGINT NOT NULL,
    s3_key VARCHAR(512) NOT NULL,
    folder_path VARCHAR(512) DEFAULT '/',
    is_starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Domain & Seed
INSERT INTO domains (id, name, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'yourdomain.com', TRUE)
ON CONFLICT (name) DO NOTHING;
