# AgentHub + Supabase Multi-Tenant Integration

## 🎯 Overview
AgentHub has been fully updated to integrate with your comprehensive Supabase multi-tenant database structure. This provides robust authentication, organization management, and conversation handling with proper tenant isolation.

## ✅ **What's Been Updated**

### **1. Database Schema Integration**
- ✅ Updated all types in `packages/shared/src/index.ts` to match your Supabase schema
- ✅ Added support for multi-tenant `organizations`, `org_members`, `profiles`
- ✅ Updated `conversations`, `messages`, `agents` with proper `tenant_id` isolation
- ✅ Added `ApiKey` type for API authentication

### **2. Backend API Updates**
- ✅ Enhanced `services/agent-hub/src/lib/supabase.ts` with tenant management helpers
- ✅ Updated conversation routes to use new `conversations` and `messages` tables
- ✅ Added proper tenant validation and access control
- ✅ Integrated with your existing Edge Function for message processing

### **3. Frontend Authentication**
- ✅ Updated `apps/portal/src/lib/supabase.ts` with full Supabase Auth integration
- ✅ Added organization management helpers
- ✅ Prepared for multi-tenant context in the UI

## 🔧 **Environment Variables Needed**

Update your `.env` files with these variables:

```env
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project-reference.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# n8n Configuration (Required)  
N8N_BASE=https://your-instance.app.n8n.cloud

# Organization Configuration (Required)
DEFAULT_TENANT_ID=your-organization-uuid-from-supabase

# Optional
OPENAI_API_KEY=your-openai-api-key
API_BASE_URL=http://localhost:5000
```

## 🚀 **Next Steps for You**

### **1. Get Your Environment Variables**

#### **Find N8N_BASE:**
- **n8n Cloud**: Go to n8n.cloud → Your instance URL
- **Local n8n**: Usually `http://localhost:5678`

#### **Get DEFAULT_TENANT_ID:**
1. Go to Supabase Dashboard → SQL Editor
2. Run the updated `setup-project.sql` file (creates tables + organization)
3. Copy the organization ID returned

#### **Get Supabase Keys:**
- Go to Supabase Dashboard → Settings → API
- Copy URL, anon key, and service role key

### **2. Database Setup**
Run the `setup-project.sql` file in your Supabase SQL Editor to:
- ✅ Create all required tables
- ✅ Set up your organization  
- ✅ Enable vector extension for embeddings
- ✅ Create proper indexes

### **3. Test the Integration**
1. **Start AgentHub**: `npm run dev`
2. **Check connection**: API should connect to your Supabase database
3. **Test conversation endpoint**: Use the updated `/conversation` API
4. **Verify in dashboard**: Check conversations appear in Supabase

## 🔄 **Updated API Flow**

### **New Conversation Flow:**
```
Website → AgentHub → Supabase → n8n → Supabase → Website
     ↓         ↓         ↓       ↓        ↓         ↓
  Send msg   Store     Create   Process  Store    Return
            conv &    message   with AI  response response
            message
```

### **Key API Changes:**
- **Endpoint**: Still `POST /conversation` but now uses new database schema
- **Tenant isolation**: All data properly isolated by organization
- **Conversation persistence**: Full conversation history stored in Supabase
- **Memory context**: Retrieves previous messages for context

## 🛡️ **Security & Multi-Tenancy**

### **Row Level Security (RLS)**
Your database already has RLS policies that:
- ✅ Isolate data by `tenant_id`
- ✅ Allow authenticated users access to their org data
- ✅ Enable anonymous access for public chat widgets

### **Authentication Flow**
- ✅ Users authenticate via Supabase Auth
- ✅ Profile created automatically via trigger
- ✅ Organization membership controls access
- ✅ JWT contains user context for API calls

## 🎛️ **Business Partner Integration**

### **For Your Partner:**
1. **Simple UI**: AgentHub dashboard provides visual agent management
2. **No coding required**: Can create/manage agents via the interface
3. **Real-time monitoring**: See conversations and agent performance
4. **Organization access**: Both of you can access same tenant data

### **Role-Based Access:**
- **Owner**: Full access to organization (you)
- **Admin**: Can manage agents and view analytics (your partner)
- **Member**: Limited access to specific features

## 🔮 **Ready for Production**

### **Deployment Architecture:**
```
Domain Setup:
├── yourdomain.com (Main website)
├── agenthub.yourdomain.com (AgentHub dashboard)
└── api.yourdomain.com (AgentHub API)
```

### **Vercel Deployment:**
1. **AgentHub Dashboard**: Deploy `apps/portal` to Vercel
2. **AgentHub API**: Deploy `services/agent-hub` to Vercel/Railway
3. **Environment variables**: Set all required vars in deployment

## 🧪 **Testing Checklist**

### **Before First Agent:**
- [ ] Database tables created via `setup-project.sql`
- [ ] Environment variables set correctly
- [ ] AgentHub connects to Supabase successfully
- [ ] n8n webhook URL accessible from AgentHub

### **With First Agent:**
- [ ] n8n workflow receives calls from AgentHub
- [ ] Conversations stored in Supabase properly
- [ ] Messages have proper tenant isolation
- [ ] Callback from n8n updates conversation

### **Website Integration:**
- [ ] Website calls AgentHub instead of n8n directly
- [ ] Session management works across refreshes
- [ ] Conversation history persists
- [ ] Anonymous users can chat via widget

## 📞 **Support for Implementation**

The integration is now complete and follows all the patterns from your Supabase AI's recommendations. Key benefits:

- **✅ Proper multi-tenancy** with organization isolation
- **✅ Full conversation persistence** with vector embeddings
- **✅ Authentication & RBAC** for team collaboration  
- **✅ Scalable architecture** ready for multiple agents
- **✅ Public widget support** for anonymous conversations

Once you get your environment variables set up and run the database setup, you'll be ready to create your first conversational agent in n8n and test the full integration! 🚀
