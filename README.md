# 🚀 Agent Hub - Agentic Platform

A modern, scalable platform for managing AI agents, n8n workflows, and task routing with enterprise-grade security and multi-tenant architecture.

## ✨ Features

### 🤖 Agent Registry
- **CRUD Operations**: Create, read, update, and delete AI agents
- **Version Management**: Track agent versions with system prompts and parameters
- **Type Support**: Local AI agents and n8n workflow agents
- **Parameter Configuration**: JSON-based parameter management with validation

### 🔄 n8n Integration
- **No-Code Import**: Import n8n workflows via UI with automatic schema detection
- **Workflow Discovery**: Browse and select workflows from your n8n instance
- **Credential Management**: Secure storage of n8n authentication credentials
- **Test & Validate**: Test workflow bindings before deployment

### 🎯 Task Routing
- **Multi-Destination Support**: Send tasks to webhooks, Supabase functions, or custom APIs
- **Override Capabilities**: Override system prompts and parameters per execution
- **HMAC Verification**: Secure communication with shared secrets
- **Rate Limiting**: Configurable rate limits per destination

### 🏗️ Architecture
- **Multi-Tenant**: Row-level security with Supabase RLS
- **Feature-Based Structure**: Organized codebase for scalability
- **Type Safety**: End-to-end TypeScript with generated database types
- **Theme Consistency**: Matches Ethos Digital website design system

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first CSS with custom design tokens
- **Lucide React**: Beautiful, customizable icons

### Backend
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Row-Level Security**: Multi-tenant data isolation
- **Edge Functions**: Serverless compute for webhooks

### Development
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project

### 1. Clone and Install
```bash
git clone <repository-url>
cd AgentHub
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.template .env.local

# Fill in your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Setup
```bash
# Run the migration in your Supabase dashboard
# Copy contents of services/agent-hub/src/db/sql/03_agent_registry.sql
```

### 4. Start Development
```bash
npm run dev
```

Visit `http://localhost:3001` to see the application.

## 📁 Project Structure

```
AgentHub/
├── apps/
│   └── portal/                 # Next.js frontend application
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   ├── components/     # Reusable UI components
│       │   ├── features/       # Feature-based organization
│       │   │   ├── agents/     # Agent management
│       │   │   ├── n8n/        # n8n integration
│       │   │   └── destinations/ # Task routing
│       │   ├── lib/            # Utilities and configurations
│       │   └── config/         # Environment and app config
│       └── public/             # Static assets
├── services/
│   └── agent-hub/             # Backend services
│       ├── src/
│       │   ├── db/            # Database schema and types
│       │   ├── routes/        # API endpoints
│       │   └── lib/           # Backend utilities
│       └── package.json
└── packages/
    └── shared/                # Shared types and utilities
```

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run dev:check        # Lint + type check
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:migrate      # Run database migrations
npm run db:reset        # Reset database (Supabase dashboard)

# Code Quality
npm run lint            # ESLint check
npm run typecheck       # TypeScript check
npm run clean           # Clean build artifacts
```

## 🎨 Design System

Agent Hub uses a consistent design system that matches the Ethos Digital website:

- **Colors**: Dark theme with cyan accents (#22d3ee)
- **Typography**: Inter font family with clear hierarchy
- **Components**: Consistent card layouts, buttons, and form elements
- **Animations**: Smooth transitions and micro-interactions

### Design Tokens
```typescript
// Available in src/lib/design-tokens.ts
import { designTokens } from '@/lib/design-tokens';

// Colors, spacing, typography, and more
console.log(designTokens.colors.primary[400]); // #22d3ee
```

## 🔐 Security Features

### Multi-Tenant Architecture
- **Row-Level Security**: Data isolation between tenants
- **JWT Authentication**: Secure user authentication
- **Role-Based Access**: Admin vs. member permissions

### Credential Management
- **Encrypted Storage**: AES-256-GCM encryption for sensitive data
- **Secure APIs**: HMAC verification for webhook communications
- **Environment Variables**: Secure configuration management

## 📊 Database Schema

### Core Tables
- **agents**: Agent definitions and metadata
- **agent_versions**: Versioned agent configurations
- **agent_bindings**: n8n workflow bindings
- **destinations**: External API endpoints
- **agent_executions**: Execution history and audit logs

### Relationships
```
agents (1) ←→ (many) agent_versions
agents (1) ←→ (many) agent_bindings
agents (1) ←→ (many) agent_executions
destinations (1) ←→ (many) agent_executions
```

## 🔌 API Endpoints

### Agent Management
```http
GET    /api/v1/agents          # List agents
POST   /api/v1/agents          # Create agent
GET    /api/v1/agents/:id      # Get agent details
PUT    /api/v1/agents/:id      # Update agent
DELETE /api/v1/agents/:id      # Delete agent
```

### Agent Execution
```http
POST   /api/v1/agents/:id/invoke     # Execute agent locally
POST   /api/v1/agents/:id/send       # Send to destination
GET    /api/v1/executions/:id        # Get execution details
```

### n8n Integration
```http
POST   /api/v1/n8n/discover          # Discover workflows
POST   /api/v1/n8n/import            # Import workflow
POST   /api/v1/n8n/test              # Test workflow binding
```

## 🧪 Testing

### Current Status
- **Unit Tests**: Not yet implemented
- **Integration Tests**: Not yet implemented
- **E2E Tests**: Not yet implemented

### Planned Testing Strategy
```bash
# Unit tests with Jest
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests with Playwright
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
```bash
# Required for production
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
ENCRYPTION_KEY=

# Optional
N8N_DEFAULT_URL=
NODE_ENV=production
```

### Deployment Platforms
- **Vercel**: Recommended for Next.js apps
- **Railway**: Full-stack with database
- **Render**: Full-stack with PostgreSQL
- **Netlify**: Frontend only (requires separate backend)

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent formatting
- **Conventional Commits**: Standard commit message format

## 📚 Documentation

### Additional Resources
- [Architecture Guide](./ARCHITECTURE.md)
- [Environment Setup](./ENVIRONMENT_GUIDE.md)
- [Supabase Integration](./SUPABASE_INTEGRATION.md)
- [n8n Webhook Setup](./N8N_WEBHOOK_SETUP.md)
- [Production Readiness](./ETHOS_WEBSITE_PRODUCTION_GUIDE.md)

### API Documentation
- [OpenAPI Spec](./docs/api/openapi.yaml)
- [Postman Collection](./docs/api/postman.json)

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🆘 Support

### Getting Help
- **Documentation**: Check the docs folder
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions for questions

### Common Issues
- **Database Connection**: Verify Supabase credentials
- **Build Errors**: Check Node.js version and dependencies
- **Type Errors**: Run `npm run typecheck` for details

---

Built with ❤️ by the Ethos Digital team