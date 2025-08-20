-- Agent Registry & Task Routing Migration
-- This migration adds new tables for AI-powered agent creation and management
-- 
-- NEW DIRECTION: AI-Powered Agent Creation
-- Instead of n8n workflow integration, this system now supports:
-- - Natural language agent creation through AI
-- - AI-generated agent code and configuration
-- - Multi-agent workflows and collaboration
-- - Conversational testing and refinement
--
-- The agent_bindings table is now used for AI model configurations
-- and external service integrations rather than n8n workflows.

-- Create ENUM types for new functionality
DO $$ BEGIN
    CREATE TYPE agent_kind AS ENUM ('local', 'n8n');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE agent_version_status AS ENUM ('draft', 'active', 'deprecated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE auth_kind AS ENUM ('apiKey', 'basic', 'oauth');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE destination_kind AS ENUM ('webhook', 'supabase-func', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE execution_status AS ENUM ('queued', 'running', 'succeeded', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Agent versions table (for versioning existing agents)
CREATE TABLE IF NOT EXISTS agent_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    system_prompt TEXT,
    default_params JSONB DEFAULT '{}',
    status agent_version_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, version)
);

-- Agent bindings table (for n8n workflows)
CREATE TABLE IF NOT EXISTS agent_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    n8n_base_url TEXT NOT NULL,
    workflow_id VARCHAR(255) NOT NULL,
    auth_kind auth_kind NOT NULL,
    credentials_ref TEXT, -- Reference to encrypted credentials in secrets
    input_schema JSONB DEFAULT '{}',
    output_schema JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, workflow_id)
);

-- Destinations table (external apps/sites for task routing)
CREATE TABLE IF NOT EXISTS destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID, -- Will be set by RLS
    name VARCHAR(255) NOT NULL,
    kind destination_kind NOT NULL,
    endpoint_url TEXT NOT NULL,
    headers JSONB DEFAULT '{}',
    auth_config JSONB DEFAULT '{}', -- For HMAC secrets, API keys, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent executions table (audit + history)
CREATE TABLE IF NOT EXISTS agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID, -- Will be set by RLS
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    agent_version_id UUID REFERENCES agent_versions(id) ON DELETE SET NULL,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    input JSONB DEFAULT '{}',
    output JSONB DEFAULT '{}',
    status execution_status DEFAULT 'queued',
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    error_text TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_versions_agent_id ON agent_versions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_versions_status ON agent_versions(status);
CREATE INDEX IF NOT EXISTS idx_agent_bindings_agent_id ON agent_bindings(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_bindings_workflow_id ON agent_bindings(workflow_id);
CREATE INDEX IF NOT EXISTS idx_destinations_tenant_id ON destinations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_tenant_id ON agent_executions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent_id ON agent_executions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_status ON agent_executions(status);
CREATE INDEX IF NOT EXISTS idx_agent_executions_created_at ON agent_executions(created_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_agent_versions_updated_at 
    BEFORE UPDATE ON agent_versions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_bindings_updated_at 
    BEFORE UPDATE ON agent_bindings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at 
    BEFORE UPDATE ON destinations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_executions_updated_at 
    BEFORE UPDATE ON agent_executions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

-- Agent versions policies
CREATE POLICY "Users can view their own agent versions" ON agent_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_agents 
            WHERE user_agents.user_id = auth.uid() 
            AND user_agents.agent_id = agent_versions.agent_id
        )
    );

CREATE POLICY "Users can insert their own agent versions" ON agent_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_agents 
            WHERE user_agents.user_id = auth.uid() 
            AND user_agents.agent_id = agent_versions.agent_id
        )
    );

CREATE POLICY "Users can update their own agent versions" ON agent_versions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_agents 
            WHERE user_agents.user_id = auth.uid() 
            AND user_agents.agent_id = agent_versions.agent_id
        )
    );

CREATE POLICY "Users can delete their own agent versions" ON agent_versions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_agents 
            WHERE user_agents.user_id = auth.uid() 
            AND user_agents.agent_id = agent_versions.agent_id
        )
    );

-- Agent bindings policies
CREATE POLICY "Users can view their own agent bindings" ON agent_bindings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_agents 
            WHERE user_agents.user_id = auth.uid() 
            AND user_agents.agent_id = agent_bindings.agent_id
        )
    );

CREATE POLICY "Users can insert their own agent bindings" ON agent_bindings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_agents 
            WHERE user_agents.user_id = auth.uid() 
            AND user_agents.agent_id = agent_bindings.agent_id
        )
    );

CREATE POLICY "Users can update their own agent bindings" ON agent_bindings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_agents 
            WHERE user_agents.user_id = auth.uid() 
            AND user_agents.agent_id = agent_bindings.agent_id
        )
    );

CREATE POLICY "Users can delete their own agent bindings" ON agent_bindings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_agents 
            WHERE user_agents.user_id = auth.uid() 
            AND user_agents.agent_id = agent_bindings.agent_id
        )
    );

-- Destinations policies
CREATE POLICY "Users can view their own destinations" ON destinations
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Users can insert their own destinations" ON destinations
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update their own destinations" ON destinations
    FOR UPDATE USING (tenant_id = auth.uid());

CREATE POLICY "Users can delete their own destinations" ON destinations
    FOR DELETE USING (tenant_id = auth.uid());

-- Agent executions policies
CREATE POLICY "Users can view their own executions" ON agent_executions
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Service role can manage executions" ON agent_executions
    FOR ALL USING (auth.role() = 'service_role');

-- Insert trigger to set tenant_id automatically
CREATE OR REPLACE FUNCTION set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.tenant_id IS NULL THEN
        NEW.tenant_id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_destinations_tenant_id
    BEFORE INSERT ON destinations
    FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

CREATE TRIGGER set_agent_executions_tenant_id
    BEFORE INSERT ON agent_executions
    FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

-- Add some helpful comments
COMMENT ON TABLE agent_versions IS 'Stores different versions of agents with their prompts and parameters';
COMMENT ON TABLE agent_bindings IS 'Links agents to n8n workflows with authentication and schema info';
COMMENT ON TABLE destinations IS 'External endpoints where tasks can be sent for execution';
COMMENT ON TABLE agent_executions IS 'Audit trail of all agent executions and their results';
