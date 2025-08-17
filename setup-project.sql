-- AgentHub Database Setup
-- Run this FIRST in your Supabase SQL Editor

-- Step 1: Create tables (if they don't exist)
CREATE TABLE IF NOT EXISTS public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'presence' CHECK (plan IN ('presence', 'growth', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  agent TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'error')),
  input JSONB NOT NULL,
  output JSONB,
  cost_usd NUMERIC(10,4) DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  n8n_execution_id TEXT,
  error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable vector extension for conversation memory
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.memory (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  doc_id TEXT,
  content TEXT,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create your organization
INSERT INTO public.orgs (name, slug, settings) 
VALUES ('Ethos Horizons', 'ethos-horizons', '{"website": "YOUR_DOMAIN_HERE"}') 
RETURNING id, name, slug, created_at;

-- Step 3: After running above, copy the org ID and use it here
-- Replace YOUR_ORG_ID_HERE with the actual UUID from Step 2
/*
INSERT INTO public.projects (org_id, name, plan, settings) 
VALUES ('YOUR_ORG_ID_HERE', 'Main Website', 'growth', '{"domain": "YOUR_DOMAIN_HERE"}') 
RETURNING id, name, plan, created_at;
*/

-- IMPORTANT: Copy the project ID from Step 3 and use it as DEFAULT_PROJECT_ID in your .env file
-- Example:
-- DEFAULT_PROJECT_ID=550e8400-e29b-41d4-a716-446655440000
