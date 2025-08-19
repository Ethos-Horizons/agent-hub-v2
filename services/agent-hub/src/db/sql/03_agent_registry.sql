-- Agent Registry Tables Migration
-- This migration adds the core tables for agent management while preserving existing RLS

-- Create ENUM types
CREATE TYPE agent_kind AS ENUM ('local', 'n8n');
CREATE TYPE agent_version_status AS ENUM ('draft', 'active', 'deprecated');
CREATE TYPE auth_kind AS ENUM ('apiKey', 'basic', 'oauth');
CREATE TYPE destination_kind AS ENUM ('webhook', 'supabase-func', 'custom');
CREATE TYPE execution_status AS ENUM ('queued', 'running', 'succeeded', 'failed');

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    kind agent_kind NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent versions table
CREATE TABLE IF NOT EXISTS agent_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    default_params JSONB DEFAULT '{}',
    status agent_version_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, version)
);

-- Agent bindings table (for n8n workflows)
CREATE TABLE IF NOT EXISTS agent_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    n8n_base_url TEXT NOT NULL,
    workflow_id TEXT NOT NULL,
    auth_kind auth_kind NOT NULL,
    credentials_ref TEXT NOT NULL, -- Reference to encrypted credentials
    input_schema JSONB DEFAULT '{}',
    output_schema JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations table (external apps/sites for task routing)
CREATE TABLE IF NOT EXISTS destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    kind destination_kind NOT NULL,
    endpoint_url TEXT NOT NULL,
    headers JSONB DEFAULT '{}',
    shared_secret TEXT, -- For HMAC verification
    rate_limit JSONB DEFAULT '{"requests_per_minute": 60, "burst_size": 10}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent executions table (audit + history)
CREATE TABLE IF NOT EXISTS agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    agent_version_id UUID NOT NULL REFERENCES agent_versions(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    input JSONB NOT NULL,
    output JSONB,
    status execution_status DEFAULT 'queued',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    error_text TEXT,
    execution_time_ms INTEGER -- Execution time in milliseconds
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);
CREATE INDEX IF NOT EXISTS idx_agent_versions_agent_id ON agent_versions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_versions_status ON agent_versions(status);
CREATE INDEX IF NOT EXISTS idx_agent_bindings_agent_id ON agent_bindings(agent_id);
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
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_bindings_updated_at BEFORE UPDATE ON agent_bindings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON destinations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

-- Agents policies
CREATE POLICY "Users can view their own agents" ON agents
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Users can insert their own agents" ON agents
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can update their own agents" ON agents
    FOR UPDATE USING (tenant_id = auth.uid());

CREATE POLICY "Users can delete their own agents" ON agents
    FOR DELETE USING (tenant_id = auth.uid());

-- Agent versions policies
CREATE POLICY "Users can view versions of their agents" ON agent_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agents WHERE agents.id = agent_versions.agent_id AND agents.tenant_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert versions for their agents" ON agent_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM agents WHERE agents.id = agent_versions.agent_id AND agents.tenant_id = auth.uid()
        )
    );

CREATE POLICY "Users can update versions of their agents" ON agent_versions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM agents WHERE agents.id = agent_versions.agent_id AND agents.tenant_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete versions of their agents" ON agent_versions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM agents WHERE agents.id = agent_versions.agent_id AND agents.tenant_id = auth.uid()
        )
    );

-- Agent bindings policies
CREATE POLICY "Users can view bindings of their agents" ON agent_bindings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agents WHERE agents.id = agent_bindings.agent_id AND agents.tenant_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert bindings for their agents" ON agent_bindings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM agents WHERE agents.id = agent_bindings.agent_id AND agents.tenant_id = auth.uid()
        )
    );

CREATE POLICY "Users can update bindings of their agents" ON agent_bindings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM agents WHERE agents.id = agent_bindings.agent_id AND agents.tenant_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete bindings of their agents" ON agent_bindings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM agents WHERE agents.id = agent_bindings.agent_id AND agents.tenant_id = auth.uid()
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
-- Users can view their own executions
CREATE POLICY "Users can view their own executions" ON agent_executions
    FOR SELECT USING (tenant_id = auth.uid());

-- Service role can insert/update executions (for webhook callbacks)
CREATE POLICY "Service role can manage executions" ON agent_executions
    FOR ALL USING (auth.role() = 'service_role');

-- Users can insert executions for their agents
CREATE POLICY "Users can insert executions for their agents" ON agent_executions
    FOR INSERT WITH CHECK (
        tenant_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM agents WHERE agents.id = agent_executions.agent_id AND agents.tenant_id = auth.uid()
        )
    );

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions to service role for webhook operations
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
