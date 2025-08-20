# Supabase Integration Guide

## Overview

This guide covers integrating Agent Hub with Supabase for authentication, database, and real-time features.

## Database Setup

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Note your project URL and API keys

### 2. Run Migrations
Execute the SQL migrations in order:
```sql
-- Run these in your Supabase SQL Editor
-- 1. Initial tables (already exists)
-- 2. RLS policies (already exists)  
-- 3. Agent registry tables (new)
-- Copy contents of: services/agent-hub/src/db/sql/03_agent_registry.sql
```

### 3. Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Authentication

### 1. Enable Auth Providers
In Supabase Dashboard > Authentication > Providers:
- **Email**: Enable
- **Google**: Configure OAuth credentials
- **GitHub**: Optional

### 2. Configure RLS Policies
The migration automatically creates RLS policies for:
- **agent_versions**: Users can manage versions of their agents
- **agent_bindings**: Users can manage n8n bindings for their agents
- **destinations**: Users can manage their own destinations
- **agent_executions**: Service role can manage executions

## n8n Cloud Integration

### 1. n8n Cloud Setup
- **URL**: Your n8n.cloud instance (e.g., `https://cmchorizions.app.n8n.cloud`)
- **API Key**: Required for workflow management (enterprise plan)
- **Webhooks**: Available in all plans

### 2. Environment Variables
```bash
N8N_BASE_URL=https://your-instance.app.n8n.cloud
N8N_API_KEY=your_n8n_api_key
```

## Real-time Features

### 1. Enable Realtime
In Supabase Dashboard > Database > Replication:
- Enable realtime for tables you want to sync

### 2. Subscribe to Changes
```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Subscribe to agent executions
const subscription = supabase
  .channel('agent_executions')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'agent_executions' },
    (payload) => {
      console.log('Execution updated:', payload);
    }
  )
  .subscribe();
```

## Testing

### 1. Database Connection
```bash
npm run dev
# Navigate to /agents to see existing agents
# Navigate to /agents/import/n8n to test import flow
```

### 2. Authentication Flow
```bash
# Test login/logout
# Test protected routes
# Test user-specific data access
```

## Troubleshooting

### Common Issues
1. **RLS Policy Errors**: Check if policies exist in Supabase Dashboard
2. **Authentication Failures**: Verify OAuth configuration
3. **Database Connection**: Check environment variables

### Debug Steps
1. Check Supabase logs
2. Verify RLS policies
3. Test with service role key
4. Check browser console for errors
