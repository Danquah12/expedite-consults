-- ==============================================================================
-- Microsoft Exchange-Like Schema Extensions for Axiom Connect
-- ==============================================================================

-- 1. Shared Mailboxes & Resource Mailboxes (Rooms / Equipment)
CREATE TABLE IF NOT EXISTS shared_mailboxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ONDELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    mailbox_type VARCHAR(50) DEFAULT 'shared', -- 'shared', 'room', 'equipment'
    capacity INT DEFAULT 0, -- For rooms
    location VARCHAR(255),
    auto_accept_bookings BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Mailbox Permissions & Delegation (Full Access, Send As, Send on Behalf)
CREATE TABLE IF NOT EXISTS mailbox_delegates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mailbox_id UUID NOT NULL REFERENCES shared_mailboxes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_type VARCHAR(50) NOT NULL, -- 'full_access', 'send_as', 'send_on_behalf', 'read_only'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_delegate_perm UNIQUE (mailbox_id, user_id, permission_type)
);

-- 3. Distribution Groups & Security Lists
CREATE TABLE IF NOT EXISTS distribution_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    require_sender_auth BOOLEAN DEFAULT TRUE, -- Internal only vs Public
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS distribution_group_members (
    group_id UUID NOT NULL REFERENCES distribution_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);

-- 4. Out-of-Office / Automatic Replies (OOF Assistant)
CREATE TABLE IF NOT EXISTS out_of_office_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    is_enabled BOOLEAN DEFAULT FALSE,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    internal_message TEXT,
    external_message TEXT,
    send_to_external BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Exchange Mail Flow & Transport Rules (DLP, Disclaimers, Retention)
CREATE TABLE IF NOT EXISTS mail_flow_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    priority INT DEFAULT 1,
    is_enabled BOOLEAN DEFAULT TRUE,
    condition_type VARCHAR(100) NOT NULL, -- 'contains_sensitive_data', 'recipient_is_external', 'sender_is'
    action_type VARCHAR(100) NOT NULL,    -- 'append_disclaimer', 'block_with_dlp_alert', 'bcc_compliance', 'quarantine'
    rule_parameters JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Legal Hold & Compliance Retention
CREATE TABLE IF NOT EXISTS legal_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_name VARCHAR(255) NOT NULL,
    case_reference VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Shared Mailboxes & Distribution Groups
INSERT INTO shared_mailboxes (domain_id, email, display_name, mailbox_type, location, capacity)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'security-ops@yourdomain.com', 'Security Operations Center (SOC)', 'shared', 'Building A', 0),
  ('00000000-0000-0000-0000-000000000001', 'conf-room-402@yourdomain.com', 'Executive Boardroom (Room 402)', 'room', 'Floor 4, East Wing', 18)
ON CONFLICT (email) DO NOTHING;

INSERT INTO distribution_groups (domain_id, email, display_name, description)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'all-engineers@yourdomain.com', 'All Engineering Staff', 'Company-wide engineering broadcast list')
ON CONFLICT (email) DO NOTHING;
