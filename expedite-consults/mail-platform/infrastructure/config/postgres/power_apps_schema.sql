-- ==============================================================================
-- Axiom Power Apps & Power Automate Schema Extensions
-- ==============================================================================

-- 1. Custom Low-Code Business Applications (Power Apps Canvas / Model-Driven)
CREATE TABLE IF NOT EXISTS power_apps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(64) DEFAULT 'LayoutGrid',
    color VARCHAR(20) DEFAULT '#3B82F6',
    category VARCHAR(100) DEFAULT 'Operations',
    app_type VARCHAR(50) DEFAULT 'canvas', -- 'canvas', 'model_driven', 'portal'
    schema_definition JSONB NOT NULL DEFAULT '[]'::jsonb, -- Form fields, validation rules
    ui_layout JSONB NOT NULL DEFAULT '{}'::jsonb,        -- Layout components, views
    created_by UUID REFERENCES users(id),
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Custom Tables & Dataverse Entities
CREATE TABLE IF NOT EXISTS custom_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID NOT NULL REFERENCES power_apps(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    columns_definition JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS custom_table_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id UUID NOT NULL REFERENCES custom_tables(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Automated Workflows (Power Automate Flow Engine)
CREATE TABLE IF NOT EXISTS automated_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    trigger_type VARCHAR(100) NOT NULL, -- 'on_new_email', 'on_teams_message', 'on_form_submitted', 'on_security_alert'
    trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    actions_pipeline JSONB NOT NULL DEFAULT '[]'::jsonb, -- [ {action: 'send_teams_card'}, {action: 'create_calendar_event'} ]
    created_by UUID REFERENCES users(id),
    total_runs INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_run_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES automated_workflows(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'running'
    execution_time_ms INT DEFAULT 0,
    logs JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Template Apps & Flows
INSERT INTO power_apps (domain_id, name, description, icon, color, category, schema_definition)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Cyber Incident Response Triage', 'Form and approval flow for real-time security alerts and SOC escalation', 'ShieldAlert', '#EF4444', 'Security & SOC', '[{"name": "incident_title", "type": "text", "label": "Incident Title"}, {"name": "severity", "type": "select", "options": ["Critical", "High", "Medium", "Low"]}, {"name": "affected_system", "type": "text", "label": "Affected Host / Network"}]'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'Change Request (CR) ServiceNow Flow', 'Submit, review, and approve infrastructure change requests directly in Teams', 'GitPullRequest', '#8B5CF6', 'IT & DevOps', '[{"name": "cr_number", "type": "text", "label": "CR Number"}, {"name": "target_env", "type": "select", "options": ["Production", "Staging", "DR"]}, {"name": "risk_level", "type": "select", "options": ["High", "Standard", "Emergency"]}]'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO automated_workflows (domain_id, name, description, trigger_type, trigger_config, actions_pipeline)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Auto-Escalate Critical Emails to Teams', 'When an email marked Urgent or Security Alert arrives, post an adaptive approval card into Teams #cyber-defense-loops', 'on_new_email', '{"filter_category": "urgent"}'::jsonb, '[{"action": "post_teams_card", "channel": "cyber-defense-loops"}, {"action": "create_calendar_sync"}]'::jsonb)
ON CONFLICT DO NOTHING;
