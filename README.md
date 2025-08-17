# AgentHub

**AI Agent Orchestration Platform** - A centralized backend system for managing, storing, and deploying n8n-designed automation agents with advanced vector storage and analytics capabilities.

## 🎯 Purpose

AgentHub serves as the **central orchestration hub** for AI automation agents designed in n8n. Rather than being a customer-facing application, it's an internal platform that:

- **Imports & Stores** agents designed in n8n workflows
- **Provides API access** for other applications to call agents
- **Manages agent lifecycle** with analytics, monitoring, and control
- **Enhances agent capabilities** using Supabase vector storage and Langfuse observability
- **Enables future master agent** coordination and task distribution

## 🏗️ Core Architecture

### **Agent Flow:**
```
n8n Design → AgentHub Import → Vector Storage → API Calls → External Apps
```

### **Primary Components:**
- **Agent Storage**: Supabase with pgvector for intelligent agent storage
- **API Layer**: Express.js providing agent execution endpoints  
- **Analytics Engine**: Real-time monitoring of agent performance
- **Vector Intelligence**: Enhanced agent capabilities via embeddings
- **Master Agent Future**: Central coordinator for multi-agent workflows

## 🤖 Agent Roadmap

### **Phase 1: Foundation Agents (MVP)**
1. **Conversational Agent** - Customer interaction and qualification
2. **Appointment Scheduling Agent** - Meeting coordination and booking
3. **Form-Filling Agent** - Automated client intake based on conversation summaries
4. **Research Agent** - Client analysis and preparation for consultations

### **Phase 2: Production Agents**
- **Content Creation Agent** - Blog posts, social media, video/images
- **Analysis Agent** - Business impact reporting for clients
- **Master Agent** - Intelligent task distribution and coordination
- **Additional specialized agents** as business needs evolve

## 🛠️ Technology Stack

### **Core Platform:**
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Next.js 14 + React + TypeScript (Internal team interface)
- **Database**: Supabase (PostgreSQL + pgvector for embeddings)
- **Authentication**: Supabase Auth

### **AI & Agent Technologies:**
- **Workflow Design**: n8n (primary agent development)
- **Vector Storage**: Supabase pgvector for intelligent agent storage
- **LLM Observability**: Langfuse for monitoring and optimization
- **Future Consideration**: LangGraph for advanced agent coordination

### **Integration & Monitoring:**
- **API Layer**: RESTful endpoints for external application integration
- **Real-time Updates**: Supabase Realtime for live monitoring
- **Analytics**: Custom performance tracking and success metrics
- **Logging**: Pino for structured application logging

## 🎯 Key Features

### **For Internal Team:**
- 📊 **Agent Performance Dashboard** - Success rates, run counts, status monitoring
- ⚡ **Agent Control Panel** - Pause/resume, configuration, testing
- 🔍 **Agent Analytics** - Detailed performance metrics and insights
- 🧪 **Agent Testing** - Safe environment for agent validation

### **For External Applications:**
- 🚀 **Agent API** - Programmatic access to deploy agents
- 📡 **Real-time Callbacks** - Status updates and completion notifications
- 🔗 **Seamless Integration** - Easy integration with websites and applications
- ⚖️ **Load Balancing** - Efficient agent distribution and scaling

## 🔄 Integration Points

### **Inbound:**
- **n8n Workflows** → Import/sync agent definitions
- **External Apps** → API calls to execute agents
- **Team Interface** → Manual agent management and monitoring

### **Outbound:**
- **Supabase** → Data persistence and vector storage
- **Langfuse** → LLM monitoring and optimization
- **External APIs** → Agent execution and data collection
- **Callback URLs** → Status updates to calling applications

## 🚀 Getting Started

### **Prerequisites:**
- Node.js 20+
- npm 10+
- Supabase account with pgvector enabled
- n8n instance for agent design

### **Quick Start:**
```bash
# Clone and install
git clone <repository-url>
cd AgentHub && npm install

# Environment health check
npm run doctor

# Configure environment
cp env.template apps/portal/.env.local
cp env.template services/agent-hub/.env
# Add your Supabase, n8n, and security credentials

# Database setup
# Run setup-project.sql in Supabase SQL editor

# Start development
npm run dev
```

**Endpoints:**
- **Internal Dashboard**: http://localhost:3001 (Team access only)
- **Agent API**: http://localhost:5000 (External application access)

## 🚢 Deploy Playbook

### **Environment Variables**

| Variable | Frontend | Backend | Required | Description |
|----------|----------|---------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | ✅ | ✅ | Service role key (server-only) |
| `HMAC_WEBHOOK_SECRET` | ❌ | ✅ | ✅ | 32+ char webhook secret |
| `N8N_BASE_URL` | ❌ | ✅ | ⚠️ | n8n instance URL |
| `DEFAULT_TENANT_ID` | ❌ | ✅ | ⚠️ | Default org UUID |

### **Pre-Deploy Checklist**

```bash
# 1. Environment validation
npm run doctor

# 2. Type checking
npm run typecheck

# 3. Build verification
npm run build

# 4. Security check
grep -r "SUPABASE_SERVICE_ROLE_KEY" apps/portal/src/ || echo "✅ No service key in client"
```

### **Deployment Steps**

1. **Database Migration**
   - Run `setup-project.sql` in Supabase
   - Verify RLS policies are active
   - Test with limited user account

2. **Environment Setup**
   - Set all required environment variables
   - Generate secure `HMAC_WEBHOOK_SECRET` (32+ chars)
   - Verify CORS domains match your deployment URLs

3. **Deploy & Monitor**
   - Deploy backend service first
   - Test health endpoints: `/api/health` and `/api/v1/health`
   - Deploy frontend
   - Monitor error rates for first 24h

### **Rollback Procedure**

```bash
# 1. Identify last working version
git log --oneline -10

# 2. Revert deployment
git checkout <last-working-commit>

# 3. Redeploy
npm run build && deploy
```

## 📁 Project Structure

```
AgentHub/
├── apps/portal/              # Internal team dashboard (Next.js)
├── services/agent-hub/       # Agent API and orchestration (Express)
├── packages/shared/          # Common types and utilities
└── docs/                     # Architecture and integration docs
```

## 🎯 Usage Scenarios

### **Typical Workflow:**
1. **Design agent** in n8n with specific business logic
2. **Import/sync** agent definition to AgentHub
3. **Test agent** using internal dashboard
4. **Deploy agent** via API to customer websites/applications
5. **Monitor performance** and optimize based on analytics

### **API Integration Example:**
```javascript
// External app calls AgentHub
const response = await fetch('http://agenthub-api/agents/conversational/run', {
  method: 'POST',
  body: JSON.stringify({ 
    context: customerData,
    callback_url: 'https://myapp.com/agent-complete'
  })
});
```

## 🔮 Future Vision

- **Master Agent Coordination**: Single interface to orchestrate multiple specialized agents
- **Automatic Integration**: Master agent can automatically deploy agents to customer systems
- **Advanced Analytics**: Predictive insights and optimization recommendations
- **Scalable Infrastructure**: Multi-tenant support for different client environments

---

**Note**: This is an internal platform designed for team use and external API integration. Customer-facing interfaces will be separate applications that call AgentHub's services.

## License

Private - Ethos Horizon's Internal Use