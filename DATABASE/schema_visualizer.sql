-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.agent_memories (
  tenant_id uuid,
  agent_id uuid,
  content text NOT NULL,
  embedding USER-DEFINED,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  metadata jsonb DEFAULT '{}'::jsonb,
  importance_score double precision DEFAULT 0.5,
  memory_type character varying DEFAULT 'conversation'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  last_accessed timestamp with time zone DEFAULT now(),
  access_count integer DEFAULT 0,
  CONSTRAINT agent_memories_pkey PRIMARY KEY (id),
  CONSTRAINT agent_memories_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id)
);
CREATE TABLE public.agent_skills (
  tenant_id uuid,
  agent_id uuid,
  skill_name character varying NOT NULL,
  skill_description text,
  embedding USER-DEFINED,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  examples jsonb DEFAULT '[]'::jsonb,
  usage_count integer DEFAULT 0,
  success_rate double precision DEFAULT 0.0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT agent_skills_pkey PRIMARY KEY (id),
  CONSTRAINT agent_skills_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id)
);
CREATE TABLE public.agents (
  name character varying NOT NULL,
  type character varying NOT NULL,
  description text,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status character varying DEFAULT 'inactive'::character varying,
  version character varying DEFAULT '1.0.0'::character varying,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  tenant_id uuid,
  CONSTRAINT agents_pkey PRIMARY KEY (id)
);
CREATE TABLE public.api_keys (
  tenant_id uuid,
  updated_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  is_active boolean DEFAULT true,
  provider character varying NOT NULL,
  key_name character varying NOT NULL,
  encrypted_key text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT api_keys_pkey PRIMARY KEY (id)
);
CREATE TABLE public.artifacts (
  run_id uuid,
  kind text NOT NULL,
  title text,
  url text,
  content text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT artifacts_pkey PRIMARY KEY (id),
  CONSTRAINT artifacts_run_id_fkey FOREIGN KEY (run_id) REFERENCES public.runs(id)
);
CREATE TABLE public.conversation_context (
  tenant_id uuid,
  updated_at timestamp with time zone DEFAULT now(),
  conversation_id uuid,
  agent_id uuid,
  context_window text NOT NULL,
  embedding USER-DEFINED,
  turn_count integer NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversation_context_pkey PRIMARY KEY (id),
  CONSTRAINT conversation_context_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT conversation_context_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id)
);
CREATE TABLE public.conversations (
  visitor_id character varying NOT NULL,
  session_id uuid NOT NULL,
  end_time timestamp with time zone,
  intent character varying,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  start_time timestamp with time zone DEFAULT now(),
  status character varying DEFAULT 'active'::character varying,
  lead_qualified boolean DEFAULT false,
  tenant_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.knowledge_base (
  tenant_id uuid,
  agent_id uuid,
  title character varying NOT NULL,
  content text NOT NULL,
  embedding USER-DEFINED,
  source_url text,
  parent_document_id uuid,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  source_type character varying DEFAULT 'document'::character varying,
  metadata jsonb DEFAULT '{}'::jsonb,
  chunk_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT knowledge_base_pkey PRIMARY KEY (id),
  CONSTRAINT knowledge_base_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id)
);
CREATE TABLE public.leads (
  conversation_id uuid,
  visitor_info jsonb NOT NULL,
  qualification_data jsonb NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  status character varying DEFAULT 'new'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  tenant_id uuid,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT leads_pkey PRIMARY KEY (id),
  CONSTRAINT leads_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.memory (
  project_id uuid,
  doc_id text,
  content text,
  embedding USER-DEFINED,
  id bigint NOT NULL DEFAULT nextval('memory_id_seq'::regclass),
  CONSTRAINT memory_pkey PRIMARY KEY (id),
  CONSTRAINT memory_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.messages (
  conversation_id uuid,
  message_type character varying NOT NULL CHECK (message_type::text = ANY (ARRAY['user'::character varying::text, 'bot'::character varying::text])),
  content text NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  timestamp timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  tenant_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id)
);
CREATE TABLE public.org_members (
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT org_members_pkey PRIMARY KEY (org_id, user_id),
  CONSTRAINT org_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT org_members_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.orgs(id)
);
CREATE TABLE public.organizations (
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.orgs (
  slug text UNIQUE,
  settings jsonb DEFAULT '{}'::jsonb,
  name text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orgs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.projects (
  org_id uuid,
  name text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan text DEFAULT 'presence'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.orgs(id)
);
CREATE TABLE public.runs (
  project_id uuid,
  agent text NOT NULL,
  input jsonb NOT NULL,
  output jsonb,
  n8n_execution_id text,
  error text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'queued'::text,
  cost_usd numeric DEFAULT 0,
  latency_ms integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT runs_pkey PRIMARY KEY (id),
  CONSTRAINT runs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.system_settings (
  setting_key character varying NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_agents (
  user_id uuid NOT NULL,
  agent_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_agents_pkey PRIMARY KEY (user_id, agent_id),
  CONSTRAINT user_agents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_agents_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(id)
);
CREATE TABLE public.user_roles (
  user_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);