# Agent Registry Migration Guide

## Overview

This migration adds new functionality to your existing Agent Hub database **without modifying any existing tables**. It creates new tables for:

- **Agent Versioning**: Store different versions of agents with prompts and parameters
- **N8N Bindings**: Link agents to n8n workflows with authentication
- **Destinations**: External endpoints for task routing
- **Agent Executions**: Audit trail of all agent runs

## What This Migration Does

✅ **Adds new tables** alongside your existing ones
✅ **Preserves all existing data** and relationships
✅ **Maintains existing RLS policies** for current tables
✅ **Adds new RLS policies** for new tables
✅ **Creates proper indexes** for performance
✅ **Sets up triggers** for automatic timestamp updates

## What This Migration Does NOT Do

❌ **Doesn't modify** your existing `agents` table
❌ **Doesn't change** existing foreign key relationships
❌ **Doesn't break** your current RLS setup
❌ **Doesn't require** data migration

## Running the Migration

### Step 1: Apply the Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of: services/agent-hub/src/db/sql/03_agent_registry.sql
```

### Step 2: Verify the Migration

Run the test script to check everything is working:

```sql
-- Copy and paste the contents of: DATABASE/test_migration.sql
```

### Step 3: Check the Results

You should see:
- 4 new tables created
- 5 new ENUM types created
- Proper indexes and triggers
- RLS policies enabled
- All existing data intact

## New Tables Created

### 1. `agent_versions`
- Links to existing `agents` table via `agent_id`
- Stores different versions of agent prompts and parameters
- Status: draft, active, deprecated

### 2. `agent_bindings`
- Links agents to n8n workflows
- Stores authentication info and I/O schemas
- One binding per agent-workflow combination

### 3. `destinations`
- External endpoints for task routing
- Supports webhooks, Supabase functions, custom endpoints
- Stores authentication configuration

### 4. `agent_executions`
- Audit trail of all agent runs
- Links to agents, versions, and destinations
- Tracks status, timing, and results

## RLS Policies

The migration creates RLS policies that:

- **Respect existing user-agent relationships** via `user_agents` table
- **Allow users to manage their own agent versions and bindings**
- **Restrict destinations to tenant scope**
- **Allow service role to manage executions** (for webhooks)

## Testing the Migration

### Quick Test: Create a Version

After migration, try creating a version for an existing agent:

```sql
-- This should work if you have an existing agent
INSERT INTO agent_versions (agent_id, version, system_prompt, status)
VALUES (
    (SELECT id FROM agents LIMIT 1), 
    '2.0.0', 
    'Updated system prompt for testing', 
    'draft'
);
```

### Quick Test: Check RLS

Verify RLS is working by checking if policies exist:

```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('agent_versions', 'agent_bindings', 'destinations', 'agent_executions');
```

## Troubleshooting

### Common Issues

1. **"ENUM already exists" errors**
   - These are harmless - the migration handles duplicates gracefully
   - The `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$` blocks prevent errors

2. **"Table already exists" errors**
   - The `CREATE TABLE IF NOT EXISTS` prevents this
   - If you get this, the table was already created

3. **RLS policy conflicts**
   - The migration uses unique policy names
   - If conflicts occur, drop the conflicting policies first

### If Something Goes Wrong

1. **Check the logs** in Supabase dashboard
2. **Run the test script** to see what's missing
3. **Drop the new tables** and retry:
   ```sql
   DROP TABLE IF EXISTS agent_executions, destinations, agent_bindings, agent_versions CASCADE;
   ```

## Next Steps

After successful migration:

1. **Test the UI** - the new pages should work with the database
2. **Create some test data** - add versions to existing agents
3. **Test n8n integration** - try importing a workflow
4. **Test destinations** - create a test webhook endpoint

## Support

If you encounter issues:

1. Check the Supabase logs for detailed error messages
2. Verify your user has the necessary permissions
3. Ensure you're running the migration as a database owner/service role

## Migration Status

- [ ] Migration applied
- [ ] Test script run successfully
- [ ] New tables visible in dashboard
- [ ] UI working with new tables
- [ ] Test data created successfully
