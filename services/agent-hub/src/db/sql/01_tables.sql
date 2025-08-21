-- AgentHub Database Schema
-- Run these commands in your Supabase SQL editor

-- Organizations table
CREATE TABLE IF NOT EXISTS public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table  
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'presence' CHECK (plan IN ('presence', 'growth', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Runs table - core execution tracking
CREATE TABLE IF NOT EXISTS public.runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  agent TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'error')),
  input JSONB NOT NULL,
  output JSONB,
  cost_usd NUMERIC(10,4) DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  -- legacy: n8n_execution_id removed with local AI execution
  error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Run artifacts - files, outputs, etc.
CREATE TABLE IF NOT EXISTS public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.runs(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT,
  url TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector extension for memory storage
CREATE EXTENSION IF NOT EXISTS vector;

-- Memory/context storage with embeddings
CREATE TABLE IF NOT EXISTS public.memory (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  doc_id TEXT,
  content TEXT,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_runs_project_id ON public.runs(project_id);
CREATE INDEX IF NOT EXISTS idx_runs_status ON public.runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_agent ON public.runs(agent);
CREATE INDEX IF NOT EXISTS idx_runs_created_at ON public.runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artifacts_run_id ON public.artifacts(run_id);
CREATE INDEX IF NOT EXISTS idx_memory_project_id ON public.memory(project_id);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON public.orgs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_runs_updated_at BEFORE UPDATE ON public.runs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
