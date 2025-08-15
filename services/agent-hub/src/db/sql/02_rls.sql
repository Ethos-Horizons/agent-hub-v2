-- Row Level Security (RLS) Policies
-- Run these commands in your Supabase SQL editor after 01_tables.sql

-- Enable RLS on all tables
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their org" ON public.orgs
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT user_id FROM org_members WHERE org_id = id
    )
  );

CREATE POLICY "Service role can manage orgs" ON public.orgs
  FOR ALL USING (auth.role() = 'service_role');

-- Projects policies  
CREATE POLICY "Users can view their projects" ON public.projects
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT user_id FROM org_members WHERE org_id = projects.org_id
    )
  );

CREATE POLICY "Service role can manage projects" ON public.projects
  FOR ALL USING (auth.role() = 'service_role');

-- Runs policies
CREATE POLICY "Users can view their runs" ON public.runs
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Service role can manage runs" ON public.runs
  FOR ALL USING (auth.role() = 'service_role');

-- Artifacts policies
CREATE POLICY "Users can view their artifacts" ON public.artifacts
  FOR SELECT USING (
    run_id IN (
      SELECT r.id FROM runs r
      JOIN projects p ON p.id = r.project_id
      JOIN org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Service role can manage artifacts" ON public.artifacts
  FOR ALL USING (auth.role() = 'service_role');

-- Memory policies
CREATE POLICY "Users can view their memory" ON public.memory
  FOR SELECT USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN org_members om ON om.org_id = p.org_id
      WHERE om.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Service role can manage memory" ON public.memory
  FOR ALL USING (auth.role() = 'service_role');

-- Optional: Create org_members table for user-org relationships
CREATE TABLE IF NOT EXISTS public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Supabase auth.users.id
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_org_members_unique ON public.org_members(org_id, user_id);

-- Enable RLS on org_members
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their memberships" ON public.org_members
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Service role can manage memberships" ON public.org_members
  FOR ALL USING (auth.role() = 'service_role');
