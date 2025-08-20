# Agent Hub - AI-Powered Agent Creation Platform

> **Create AI agents through natural language conversations**

Agent Hub is a revolutionary platform that allows you to create, manage, and deploy AI agents using nothing but natural language. Instead of complex drag-and-drop interfaces or manual configuration, simply describe what you need, and our AI will research, plan, and implement your agents automatically.

## ✨ Key Features

- **🤖 Natural Language Agent Creation** - Describe what you need in plain English
- **🧠 AI-Powered Research & Planning** - Master AI agent analyzes requirements and best practices
- **💻 AI-Generated Implementation** - Claude coding agent writes the actual agent code
- **🔄 Conversational Refinement** - Test, iterate, and improve through chat interfaces
- **🔒 Secure & Scalable** - Built on Supabase with enterprise-grade security
- **🚀 Multi-Agent Workflows** - Create complex systems where agents work together

## 🎯 Perfect For

- **Business Owners** - Automate lead generation, customer service, and business processes
- **Developers** - Rapidly prototype AI agents without complex setup
- **Teams** - Collaborate on agent creation through conversational interfaces
- **Enterprises** - Scale AI operations with secure, multi-tenant architecture

## 🏗️ Architecture

```
User Request → Master AI Agent → Research & Planning → Claude Coding Agent → Implementation → Testing & Refinement
```

### Core Components

- **Frontend**: Next.js 14 with React 18 and Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: Supabase (PostgreSQL) with Row-Level Security
- **AI Integration**: OpenAI GPT-4 + Anthropic Claude
- **Authentication**: Supabase Auth with JWT
- **Security**: HMAC signatures, rate limiting, CORS protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Anthropic API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/agent-hub.git
   cd agent-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd apps/portal && npm install
   cd ../../services/agent-hub && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the template
   cp env.template apps/portal/.env.local
   
   # Fill in your values
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   JWT_SECRET=your_jwt_secret
   ENCRYPTION_KEY=your_encryption_key
   ```

4. **Set up the database**
   ```bash
   # Run the migration in Supabase dashboard
   # Copy the SQL from services/agent-hub/src/db/sql/03_agent_registry.sql
   ```

5. **Start the development server**
   ```bash
   cd apps/portal
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000` and start creating agents!

## 🎨 Creating Your First Agent

1. **Navigate to the Agent Registry** (`/agents`)
2. **Click "Create Agent with AI"**
3. **Describe what you need** in natural language:
   ```
   "I need an agent that can schedule appointments and integrate with Google Calendar"
   ```
4. **AI researches and plans** the solution
5. **Claude implements** the agent code
6. **Test and refine** through conversation

## 🏗️ Project Structure

```
AgentHub/
├── apps/
│   └── portal/                 # Next.js frontend application
│       ├── src/
│       │   ├── app/           # App Router pages
│       │   ├── components/    # Reusable UI components
│       │   ├── features/      # Feature-based organization
│       │   │   ├── agents/    # Agent management
│       │   │   ├── n8n/       # Legacy n8n integration (removed)
│       │   │   └── destinations/ # Task routing
│       │   ├── lib/           # Utilities and services
│       │   └── config/        # Configuration files
├── services/
│   └── agent-hub/             # Backend API service
│       ├── src/
│       │   ├── routes/        # API endpoints
│       │   ├── db/            # Database migrations and types
│       │   └── lib/           # Backend utilities
└── packages/
    └── shared/                 # Shared types and utilities
```

## 🔧 Development Commands

```bash
# Frontend development
cd apps/portal
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler

# Backend development
cd services/agent-hub
npm run dev          # Start development server
npm run build        # Build for production

# Database
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database (development only)
```

## 🎯 Example Use Cases

### Lead Generation Workflow
Create a system of 4 agents that work together:
1. **Conversational Agent** - Main website chat interface
2. **Appointment Scheduler** - Google Calendar integration
3. **Research Agent** - Business intelligence gathering
4. **Form Filling Agent** - Background lead qualification

### Business Process Automation
- Customer service automation
- Sales pipeline management
- Data analysis and reporting
- Marketing campaign optimization

## 🔒 Security Features

- **Row-Level Security (RLS)** - Multi-tenant data isolation
- **HMAC Signatures** - Secure webhook communication
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Domain-based access control
- **Encrypted Secrets** - Secure credential storage
- **JWT Authentication** - Stateless user sessions

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:agents
npm run test:ai-creation
npm run test:security
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd apps/portal
npm run build
# Deploy the .next folder
```

### Backend (Railway/Render)
```bash
cd services/agent-hub
npm run build
# Deploy the dist folder
```

### Environment Variables
Ensure all required environment variables are set in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [API Reference](./docs/API.md)
- [Agent Creation Guide](./docs/AGENT_CREATION.md)
- [Security Best Practices](./docs/SECURITY.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/agent-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/agent-hub/discussions)
- **Documentation**: [Wiki](https://github.com/your-username/agent-hub/wiki)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/), [React](https://reactjs.org/), and [Tailwind CSS](https://tailwindcss.com/)
- Powered by [OpenAI](https://openai.com/) and [Anthropic](https://www.anthropic.com/)
- Backend services by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Ready to revolutionize how you create AI agents? Start building with Agent Hub today! 🚀**