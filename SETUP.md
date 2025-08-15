# AgentHub v2 Setup Guide

## 🎯 Quick Start

Your AgentHub project is now set up and configured to work with your existing Supabase database! Here's how to get it running:

### 1. Environment Configuration

Copy the environment template and add your Supabase credentials:

```bash
cp env.local.example .env.local
```

Then edit `.env.local` with your actual values:

```bash
# Supabase Configuration (your existing project)
SUPABASE_URL=https://grjnfymehgayddlwevae.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key_here

# n8n Integration
N8N_BASE=https://your-n8n-instance.com/webhook

# Optional: OpenAI for AI features
OPENAI_API_KEY=your_openai_api_key
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Build Shared Package

```bash
pnpm run build -w @agent-hub/shared
```

### 4. Start Development Servers

```bash
# Start all services (recommended)
pnpm dev

# Or start individually:
# Backend API (port 5000)
pnpm run dev -w @agent-hub/agent-hub

# Frontend Portal (port 3000)  
pnpm run dev -w @agent-hub/portal
```

## 🏗️ Architecture Overview

Your AgentHub leverages your existing Supabase schema:

### Frontend (Port 3000)
- **Next.js 14** with TypeScript
- **Tailwind CSS** for styling
- **Real-time subscriptions** via Supabase
- **Agent catalog** and command center

### Backend (Port 5000)
- **Express API** with TypeScript
- **n8n integration** for workflow execution
- **Vector search** using your existing functions
- **Real-time updates** via Supabase broadcasting

### Database (Supabase)
Your existing tables are fully supported:
- `agents` - AI agent definitions
- `runs` - Execution tracking
- `conversations` - Chat interactions
- `knowledge_base` - Vector knowledge storage
- `agent_memories` - Agent memory with embeddings
- Plus all your other tables!

## 🔌 API Endpoints

### Runs (Workflow Execution)
- `POST /runs` - Execute agent workflow
- `GET /runs/:id` - Get run details
- `GET /runs?projectId=...` - List project runs

### Agents
- `GET /agents` - List all agents
- `GET /agents/:id` - Get agent with skills/memories
- `POST /agents/:id/search` - Search knowledge base
- `POST /agents/:id/memories/search` - Search memories

### Conversations
- `GET /conversations` - List conversations
- `POST /conversations` - Create conversation
- `POST /conversations/:id/messages` - Add message

### Callbacks
- `POST /callbacks/n8n` - n8n webhook endpoint

## 🎯 Usage Examples

### Execute an Agent
```typescript
import { startRun } from '@/lib/api'

const result = await startRun({
  projectId: 'your-project-id',
  agent: 'gbp_post',
  input: { message: 'Create a post about our new service' },
  simulate: false
})
```

### Real-time Updates
```typescript
import { subscribeToRunUpdates } from '@/lib/supabase'

const channel = subscribeToRunUpdates(runId, (payload) => {
  console.log('Run update:', payload.payload)
})
```

### Vector Search
```typescript
const results = await searchKnowledgeBase(agentId, query, embedding)
```

## 🔧 n8n Integration

Your workflows should call back to:
```
POST /callbacks/n8n
{
  "runId": "uuid",
  "status": "success",
  "output": {...},
  "artifacts": [...],
  "costUsd": 0.05,
  "latencyMs": 2500
}
```

## 🌟 What's Included

✅ **Monorepo Structure** - Clean workspace organization  
✅ **TypeScript Throughout** - Type safety across frontend/backend  
✅ **Real-time Updates** - Live status via Supabase  
✅ **Vector Search** - Uses your existing search functions  
✅ **Agent Management** - Full CRUD for agents  
✅ **Conversation Handling** - Chat interface support  
✅ **n8n Integration** - Workflow execution platform  
✅ **Observability Ready** - Langfuse integration  
✅ **Production Ready** - Error handling, logging, validation  

## 🚀 Next Steps

1. **Set up environment variables** in `.env.local`
2. **Run `pnpm dev`** to start both frontend and backend
3. **Visit `http://localhost:3000`** to see the portal
4. **Test API** at `http://localhost:5000/health`
5. **Configure n8n** to call your callback endpoint
6. **Add your specific agents** to the catalog

## 🆘 Troubleshooting

- **Port conflicts**: Modify ports in package.json scripts
- **Supabase connection**: Verify your environment variables
- **Build errors**: Run `pnpm run build -w @agent-hub/shared` first
- **n8n integration**: Check N8N_BASE environment variable

You're all set! Your AgentHub is ready to orchestrate AI workflows. 🎉
