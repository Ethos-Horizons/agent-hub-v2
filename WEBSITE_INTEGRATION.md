# Website → AgentHub Integration Guide

## 🎯 Overview
This guide helps migrate your website chatbot from calling n8n directly to using AgentHub as the orchestration layer. AgentHub will handle conversation memory, analytics, and coordination between multiple agents.

## 📋 Prerequisites

### 1. Database Setup (Supabase)
Run this SQL in your Supabase SQL editor:

```sql
-- Essential tables for conversation management
CREATE TABLE IF NOT EXISTS public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'presence',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  agent TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'success', 'error')),
  input JSONB NOT NULL,
  output JSONB,
  cost_usd NUMERIC(10,4) DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  n8n_execution_id TEXT,
  error TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable vector extension for conversation memory
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.memory (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  doc_id TEXT,
  content TEXT,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_runs_project_id ON public.runs(project_id);
CREATE INDEX IF NOT EXISTS idx_runs_status ON public.runs(status);
CREATE INDEX IF NOT EXISTS idx_memory_project_id ON public.memory(project_id);
```

### 2. Environment Variables
Add to your AgentHub `.env`:

```env
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
N8N_BASE=your_n8n_base_url
DEFAULT_PROJECT_ID=your_project_uuid_from_supabase

# Optional  
API_BASE_URL=http://localhost:5000
OPENAI_API_KEY=your_openai_key_for_embeddings
```

## 🔄 API Endpoints

### **Primary Chatbot Endpoint**
```
POST http://localhost:5000/conversation
```

**Request Body:**
```typescript
{
  message: string;                    // User's message
  session_id?: string;               // Optional: provide for conversation continuity
  user_id?: string;                  // Optional: for user tracking
  context?: {                        // Optional: page context
    page?: string;
    user_agent?: string;
    referrer?: string;
  };
}
```

**Response:**
```typescript
{
  id: string;                        // Conversation/run ID
  message: string;                   // Initial processing message
  session_id: string;               // Session ID for tracking
  status: "processing" | "completed" | "error";
  metadata?: {
    response_time_ms?: number;
    tokens_used?: number;
    cost_usd?: number;
  };
}
```

### **Get Conversation Status**
```
GET http://localhost:5000/conversation/:id
```

**Response:**
```typescript
{
  id: string;
  message: string;                   // Final AI response
  session_id: string;
  status: "processing" | "completed" | "error";
  metadata?: {
    response_time_ms?: number;
    tokens_used?: number;
    cost_usd?: number;
  };
}
```

## 💻 Website Implementation

### **1. Replace Your Existing Chatbot API Call**

**Before (Direct n8n):**
```javascript
// OLD: Direct call to n8n
const response = await fetch('https://your-n8n-webhook-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    // ... other data
  })
});
```

**After (AgentHub):**
```javascript
// NEW: Call AgentHub
const response = await fetch('http://localhost:5000/conversation', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    // Add API key when you implement auth
  },
  body: JSON.stringify({
    message: userMessage,
    session_id: getSessionId(), // Implement session persistence
    user_id: getCurrentUserId(), // Optional
    context: {
      page: window.location.pathname,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    }
  })
});

const data = await response.json();

// Handle immediate response
if (data.status === 'processing') {
  // Show typing indicator
  showTypingIndicator();
  
  // Poll for completion or use WebSocket
  pollForCompletion(data.id);
}
```

### **2. Implement Polling for Response**

```javascript
async function pollForCompletion(conversationId) {
  const maxAttempts = 30; // 30 seconds max
  let attempts = 0;
  
  const poll = async () => {
    try {
      const response = await fetch(`http://localhost:5000/conversation/${conversationId}`);
      const data = await response.json();
      
      if (data.status === 'completed') {
        hideTypingIndicator();
        displayMessage(data.message, 'assistant');
        return;
      }
      
      if (data.status === 'error') {
        hideTypingIndicator();
        displayError('Sorry, I encountered an error. Please try again.');
        return;
      }
      
      // Still processing, poll again
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(poll, 1000); // Poll every second
      } else {
        hideTypingIndicator();
        displayError('Response timeout. Please try again.');
      }
    } catch (error) {
      hideTypingIndicator();
      displayError('Network error. Please try again.');
    }
  };
  
  poll();
}
```

### **3. Session Management**

```javascript
// Implement session persistence
function getSessionId() {
  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = generateUUID(); // Implement UUID generation
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

### **4. Complete Example Integration**

```javascript
class AgentHubChatbot {
  constructor() {
    this.apiBase = 'http://localhost:5000';
    this.sessionId = this.getSessionId();
  }
  
  async sendMessage(message) {
    try {
      // Show user message immediately
      this.displayMessage(message, 'user');
      this.showTypingIndicator();
      
      // Call AgentHub
      const response = await fetch(`${this.apiBase}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          session_id: this.sessionId,
          context: {
            page: window.location.pathname,
            user_agent: navigator.userAgent
          }
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'processing') {
        // Poll for completion
        this.pollForResponse(data.id);
      } else {
        // Immediate response
        this.hideTypingIndicator();
        this.displayMessage(data.message, 'assistant');
      }
      
    } catch (error) {
      this.hideTypingIndicator();
      this.displayMessage('Sorry, I encountered an error. Please try again.', 'error');
    }
  }
  
  async pollForResponse(conversationId) {
    const response = await fetch(`${this.apiBase}/conversation/${conversationId}`);
    const data = await response.json();
    
    if (data.status === 'completed') {
      this.hideTypingIndicator();
      this.displayMessage(data.message, 'assistant');
    } else if (data.status === 'error') {
      this.hideTypingIndicator();
      this.displayMessage('Sorry, I encountered an error. Please try again.', 'error');
    } else {
      // Still processing, poll again
      setTimeout(() => this.pollForResponse(conversationId), 1000);
    }
  }
  
  getSessionId() {
    let sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
  }
  
  displayMessage(message, type) {
    // Your existing message display logic
  }
  
  showTypingIndicator() {
    // Your existing typing indicator
  }
  
  hideTypingIndicator() {
    // Your existing typing indicator hide
  }
}

// Initialize
const chatbot = new AgentHubChatbot();
```

## ⚡ n8n Workflow Updates

### **1. Update Your n8n Webhook URL**
Change your website to call AgentHub instead of n8n directly.

### **2. n8n Workflow Modifications**

**Add to the END of your n8n workflow:**

```javascript
// n8n HTTP Request Node - Send result back to AgentHub
// URL: http://localhost:5000/callbacks/conversation
// Method: POST
// Body:
{
  "runId": "{{ $json.runId }}", // From initial AgentHub call
  "status": "success", // or "error"
  "output": {
    "message": "{{ $json.final_response }}", // Your AI response
    "session_id": "{{ $json.session_id }}",
    "tokens_used": "{{ $json.tokens_used }}", // Optional
  },
  "costUsd": {{ $json.cost_usd }}, // Optional
  "latencyMs": {{ Math.round((Date.now() - new Date("{{ $json.start_time }}").getTime())) }} // Optional
}
```

### **3. n8n Input Changes**
Your n8n workflow will now receive:
```javascript
{
  runId: "uuid",
  projectId: "uuid", 
  input: {
    message: "user message",
    session_id: "session_uuid",
    user_id: "user_id", // optional
    context: { page: "/contact" }, // optional
    memory_context: [], // Previous conversation history
    callback_url: "http://localhost:5000/callbacks/conversation"
  }
}
```

## ✅ Benefits You'll Get Immediately

1. **Persistent Memory**: Conversations stored across sessions
2. **Analytics**: Track response times, costs, success rates
3. **Session Management**: Automatic session handling
4. **Error Handling**: Better error tracking and recovery
5. **Real-time Monitoring**: Dashboard view of all conversations
6. **Scalability**: Ready for multiple agents (appointment, form-filling, research)

## 🧪 Testing Steps

1. **Start AgentHub**: `npm run dev` (both API and dashboard)
2. **Test API**: Use Postman or curl to test `/conversation` endpoint
3. **Update Website**: Replace n8n calls with AgentHub calls
4. **Test Integration**: Verify conversations work end-to-end
5. **Check Dashboard**: Monitor conversations in AgentHub dashboard

## 🔧 Production Deployment

When ready for production:
1. Deploy AgentHub API to your server (Railway, Render, etc.)
2. Update `API_BASE_URL` in website to production AgentHub URL
3. Set up proper API authentication
4. Configure production Supabase connection

## ❓ Troubleshooting

- **Check AgentHub logs**: Look at console output for errors
- **Verify Supabase connection**: Test database connectivity
- **Test n8n callback**: Ensure n8n can reach AgentHub callback URL
- **Session persistence**: Verify localStorage is working for session IDs

This integration gives you the foundation for your conversational agent while setting up the infrastructure for appointment scheduling, form filling, and research agents! 🚀
