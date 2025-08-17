# Environment Variables Guide

## 📁 **File Structure**

```
AgentHub/
├── apps/portal/.env.local          # Frontend environment (safe for browser)
├── services/agent-hub/.env         # Backend environment (server secrets)
└── env.template                    # Template for both
```

## 🌐 **Frontend (.env.local)**
**Only variables starting with `NEXT_PUBLIC_`** - these are exposed to the browser:

```bash
# Frontend Environment (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🔒 **Backend (.env)**
**All variables including secrets** - these stay on the server:

```bash
# Backend Environment (.env)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
HMAC_WEBHOOK_SECRET=your-32-byte-hex-secret
N8N_BASE_URL=https://your-n8n-instance.com
DEFAULT_TENANT_ID=your-org-uuid
DEFAULT_PROJECT_ID=your-project-uuid
OPENAI_API_KEY=your-openai-key
LANGFUSE_PUBLIC_KEY=your-langfuse-public-key
LANGFUSE_SECRET_KEY=your-langfuse-secret-key
LANGFUSE_HOST=https://cloud.langfuse.com
NODE_ENV=development
LOG_LEVEL=info
API_BASE_URL=http://localhost:5000
PORT=5000
```

## 🆔 **Getting Your IDs**

1. **Run the SQL script** `setup-project.sql` in Supabase SQL Editor
2. **Copy the returned IDs:**
   - First query returns `ORG_ID` → use as `DEFAULT_TENANT_ID`
   - Second query returns `PROJECT_ID` → use as `DEFAULT_PROJECT_ID`

## ⚠️ **Security Rules**

- ✅ **Frontend**: Only `NEXT_PUBLIC_*` variables
- ❌ **Frontend**: Never add `SUPABASE_SERVICE_ROLE_KEY` or `HMAC_WEBHOOK_SECRET`
- ✅ **Backend**: All variables are safe to use
- ❌ **Git**: Never commit `.env` or `.env.local` files
