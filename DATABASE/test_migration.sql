-- Test script to verify the migration works correctly
-- Run this after applying the migration to check everything is working

-- 1. Check if new tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('agent_versions', 'agent_bindings', 'destinations', 'agent_executions') 
        THEN 'NEW TABLE' 
        ELSE 'EXISTING TABLE' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('agents', 'agent_versions', 'agent_bindings', 'destinations', 'agent_executions')
ORDER BY table_name;

-- 2. Check if ENUM types exist
SELECT 
    typname as enum_name,
    enumlabel as enum_value
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname IN ('agent_kind', 'agent_version_status', 'auth_kind', 'destination_kind', 'execution_status')
ORDER BY typname, enumsortorder;

-- 3. Check if indexes exist
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('agent_versions', 'agent_bindings', 'destinations', 'agent_executions')
ORDER BY tablename, indexname;

-- 4. Check if triggers exist
SELECT 
    trigger_name,
    event_object_table as table_name,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('agent_versions', 'agent_bindings', 'destinations', 'agent_executions')
ORDER BY event_object_table, trigger_name;

-- 5. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('agent_versions', 'agent_bindings', 'destinations', 'agent_executions')
ORDER BY tablename;

-- 6. Check if policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('agent_versions', 'agent_bindings', 'destinations', 'agent_executions')
ORDER BY tablename, policyname;

-- 7. Test inserting a sample agent version (this will fail if RLS is too restrictive)
-- Note: This requires authentication, so it's just for reference
/*
INSERT INTO agent_versions (agent_id, version, system_prompt, status)
VALUES (
    (SELECT id FROM agents LIMIT 1), 
    '2.0.0', 
    'Updated system prompt for testing', 
    'draft'
);
*/

-- 8. Check existing agents to see what we're working with
SELECT 
    id,
    name,
    type,
    status,
    version,
    created_at
FROM agents 
ORDER BY created_at DESC 
LIMIT 5;

-- 9. Check if the user_agents junction table has data
SELECT 
    COUNT(*) as total_user_agent_relationships,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT agent_id) as unique_agents
FROM user_agents;

-- 10. Summary of what should be working
SELECT 
    'Migration Status Check' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_versions') 
        THEN '✅ agent_versions table exists'
        ELSE '❌ agent_versions table missing'
    END as agent_versions_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_bindings') 
        THEN '✅ agent_bindings table exists'
        ELSE '❌ agent_bindings table missing'
    END as agent_bindings_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'destinations') 
        THEN '✅ destinations table exists'
        ELSE '❌ destinations table missing'
    END as destinations_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_executions') 
        THEN '✅ agent_executions table exists'
        ELSE '❌ agent_executions table missing'
    END as agent_executions_status;
