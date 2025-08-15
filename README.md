# AgentHub v2

**Centralized platform for managing AI-powered business automation agents**

AgentHub serves as a middleware layer between your business applications and automation workflows, specifically designed to work with n8n workflow automation platform.

## Architecture

- **Frontend Portal**: Next.js + TypeScript + Tailwind CSS (Port 3000)
- **Backend API**: Express + TypeScript (Port 5000)
- **Database**: Supabase (PostgreSQL with real-time features)
- **Orchestration**: n8n workflow integration
- **Package Management**: pnpm workspaces (monorepo)

## Current Features

### Agent Management
- Predefined agent catalog including:
  - `gbp_post`: Google Business Profile post creation
  - `listings_sync`: NAP (Name, Address, Phone) directory synchronization
  - `review_request`: SMS/email review solicitation
  - `weekly_report`: Analytics digest (GA/GBP/Ads)

### Workflow Orchestration
- **n8n Integration**: Direct API calls to n8n workflows
- **Run Management**: Complete lifecycle tracking (queued → running → success/error)
- **Real-time Updates**: Supabase real-time subscriptions for live status updates
- **Cost & Performance Tracking**: Monitors execution costs and latency

### Multi-tenant Architecture
- **Organizations**: Top-level tenant isolation
- **Projects**: Sub-organization groupings with different plans
- **Clients**: Individual client management within projects

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase account
- n8n instance

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repo-url>
   cd agent-hub-v2
   pnpm install
   ```

2. **Environment Configuration:**
   Copy `.env.example` to `.env.local` and configure:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   N8N_BASE=your_n8n_base_url
   OPENAI_API_KEY=your_openai_api_key
   LANGFUSE_SECRET_KEY=your_langfuse_key (optional)
   ```

3. **Database Setup:**
   ```bash
   # Run database migrations
   cd services/agent-hub
   # Execute SQL files in src/db/sql/ in your Supabase dashboard
   ```

4. **Development:**
   ```bash
   pnpm dev
   ```

### Project Structure

```
agent-hub-v2/
├── apps/
│   └── portal/              # Next.js frontend application
├── services/
│   └── agent-hub/           # Express API service
├── packages/
│   └── shared/              # Shared types and utilities
├── package.json             # Root package configuration
└── pnpm-workspace.yaml      # Workspace configuration
```

## Integration Pattern

```
AgentHub → n8n Workflow → Callback → AgentHub
```

1. **Trigger**: User initiates agent execution via Command Center
2. **API Call**: AgentHub calls n8n webhook with `{runId, projectId, input}`
3. **Execution**: n8n processes the workflow
4. **Callback**: n8n posts results back to AgentHub's `/callbacks/n8n` endpoint
5. **Real-time Updates**: Status broadcasted to frontend via Supabase

## Deployment

- **Frontend**: Vercel/Netlify (static export)
- **Backend**: Railway/Render/Docker
- **Database**: Supabase (managed PostgreSQL)
- **Workflows**: n8n Cloud or self-hosted

## Contributing

1. Create feature branch
2. Follow TypeScript conventions
3. Add tests for new features
4. Ensure all linting passes
5. Submit pull request

## License

Private - EthosDigital Internal Use
