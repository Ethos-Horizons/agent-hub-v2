# 🔄 Complete n8n Agent Migration to AgentHub

## 📋 **Migration Overview**

You'll move your n8n conversational agent into AgentHub while keeping n8n for complex integrations and workflows. This gives you the best of both worlds:

- **AgentHub**: Agent management, analytics, memory, system prompts
- **n8n**: Third-party integrations, complex workflows, API connections

## 🎯 **Step 1: Export Your n8n Agent**

### **Export Workflow:**
1. **In n8n Dashboard:**
   - Go to your conversational agent workflow
   - Click the "..." menu → **Download**
   - Save as `conversational-agent.json`

2. **Document Key Information:**
   ```json
   {
     "agentName": "Conversational Agent",
     "primaryPrompt": "Your main system prompt from n8n",
     "model": "gpt-4o-mini", // or whatever model you're using
     "webhookUrl": "your-current-n8n-webhook-url",
     "integrations": [
       "Calendar booking",
       "Email notifications", 
       "CRM updates"
     ]
   }
   ```

## 🎯 **Step 2: Create Agent in AgentHub Database**

### **Run in Supabase SQL Editor:**
```sql
-- First, get your tenant_id from running setup-project.sql
-- Then create your conversational agent:

INSERT INTO public.agents (
  tenant_id,
  name,
  type,
  description,
  status,
  version,
  config
) VALUES (
  'YOUR_TENANT_ID_HERE', -- From setup-project.sql
  'Conversational Agent',
  'conversational',
  'Main conversational agent for website visitors. Handles inquiries, lead qualification, and initial customer engagement.',
  'active',
  '1.0.0',
  jsonb_build_object(
    'model', 'gpt-4o-mini',
    'temperature', 0.7,
    'max_tokens', 1000,
    'system_prompt', 'You are a helpful AI assistant for Ethos Digital, a digital marketing agency. Help visitors understand our services, answer questions about digital marketing, and qualify potential leads. Be professional, friendly, and knowledgeable about SEO, PPC, web development, and social media marketing.',
    'fallback_responses', array[
      'I''m here to help with questions about Ethos Digital''s services. Could you please rephrase your question?',
      'Let me connect you with more specific information about our digital marketing services.',
      'I''d be happy to help! Could you tell me more about what you''re looking for?'
    ],
    'lead_qualification_triggers', array[
      'pricing',
      'cost',
      'quote',
      'consultation',
      'hire',
      'need help',
      'services'
    ]
  )
) RETURNING id, name, created_at;
```

**Copy the returned agent ID** - you'll need it for the next steps.

## 🎯 **Step 3: Update AgentHub n8n Integration**

### **Update your n8n workflow:**

1. **Change the webhook trigger URL** in n8n to receive calls from AgentHub:
   ```
   OLD: Direct website calls to n8n
   NEW: Website → AgentHub → n8n → AgentHub → Website
   ```

2. **Update the input structure** in your n8n workflow to expect:
   ```json
   {
     "conversationId": "uuid",
     "messageId": "uuid", 
     "tenantId": "uuid",
     "input": {
       "message": "user message",
       "session_id": "session_uuid",
       "user_id": "optional_user_id",
       "context": {
         "page": "/contact",
         "user_agent": "browser info",
         "referrer": "previous page"
       },
       "memory_context": [
         {
           "role": "user",
           "content": "previous message",
           "timestamp": "2024-01-01T12:00:00Z"
         }
       ],
       "callback_url": "http://localhost:5000/api/callbacks/conversation"
     }
   }
   ```

3. **Add callback at the end** of your n8n workflow:
   ```javascript
   // HTTP Request Node - Send result back to AgentHub
   // URL: {{ $json.input.callback_url }}
   // Method: POST
   // Headers: {
   //   "Content-Type": "application/json",
   //   "X-Signature": "sha256={{ $crypto.hmacSha256(JSON.stringify($json), 'YOUR_HMAC_SECRET') }}"
   // }
   
   {
     "runId": "{{ $('trigger').first().json.conversationId }}",
     "status": "success",
     "output": {
       "message": "{{ $json.final_ai_response }}",
       "session_id": "{{ $('trigger').first().json.input.session_id }}",
       "tokens_used": {{ $json.tokens_used || 0 }},
       "lead_qualified": {{ $json.lead_qualified || false }}
     },
     "costUsd": {{ $json.cost_usd || 0 }},
     "latencyMs": {{ Math.round((Date.now() - new Date($('trigger').first().json.timestamp).getTime())) }}
   }
   ```

## 🎯 **Step 4: Update Website Integration**

Your website currently calls n8n directly. Let's change it to call AgentHub:

### **Find your current chatbot code** (likely in `client/src/` somewhere):

**BEFORE (Direct n8n):**
```javascript
// OLD - Remove this
const response = await fetch('your-n8n-webhook-url', {
  method: 'POST',
  body: JSON.stringify({ message: userMessage })
});
```

**AFTER (Through AgentHub):**
```javascript
// NEW - Add this
const response = await fetch('http://localhost:5000/api/v1/conversation', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-Tenant-ID': 'YOUR_TENANT_ID' // Optional for single-tenant
  },
  body: JSON.stringify({
    message: userMessage,
    session_id: getSessionId(),
    context: {
      page: window.location.pathname,
      user_agent: navigator.userAgent
    }
  })
});

const data = await response.json();

// Handle processing state
if (data.status === 'processing') {
  showTypingIndicator();
  pollForCompletion(data.id);
}
```

### **Add polling function:**
```javascript
async function pollForCompletion(conversationId) {
  const pollInterval = 2000; // 2 seconds
  const maxAttempts = 30; // 60 seconds total
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    
    const response = await fetch(`http://localhost:5000/api/v1/conversation/${conversationId}`);
    const data = await response.json();
    
    if (data.status === 'completed') {
      hideTypingIndicator();
      displayMessage(data.message, 'ai');
      return;
    } else if (data.status === 'error') {
      hideTypingIndicator();
      displayMessage('Sorry, I encountered an error. Please try again.', 'error');
      return;
    }
  }
  
  // Timeout fallback
  hideTypingIndicator();
  displayMessage('Response is taking longer than expected. Please try again.', 'error');
}
```

## 🎯 **Step 5: Test the Integration**

### **1. Start AgentHub:**
```bash
cd AgentHub
npm run dev
# AgentHub Frontend: http://localhost:3001
# AgentHub Backend: http://localhost:5000
```

### **2. Start your website:**
```bash
cd Ethos-Horizons-Website
npm run dev
# Website: http://localhost:3000
```

### **3. Test the flow:**
1. **Send a test message** from your website chatbot
2. **Check AgentHub dashboard** at http://localhost:3001
   - Go to "Runs" to see the conversation
   - Check status and response
3. **Verify n8n execution** in your n8n dashboard
4. **Confirm response** appears on website

## 🎯 **Step 6: Enhanced Agent Configuration**

Once basic integration works, enhance your agent in AgentHub:

### **Update agent config in Supabase:**
```sql
UPDATE public.agents 
SET config = jsonb_set(
  config,
  '{enhanced_features}',
  jsonb_build_object(
    'conversation_memory', true,
    'lead_scoring', true,
    'context_awareness', true,
    'appointment_booking', true,
    'custom_responses', jsonb_build_object(
      'greeting', 'Hello! I''m here to help you learn about Ethos Digital''s services. What can I help you with today?',
      'services_inquiry', 'We offer comprehensive digital marketing services including SEO, PPC advertising, web development, and social media management. Which area interests you most?',
      'pricing_inquiry', 'Our pricing varies based on your specific needs and goals. I''d love to learn more about your business to provide accurate information. Could you tell me about your current marketing challenges?'
    )
  )
)
WHERE name = 'Conversational Agent';
```

## 🎯 **Step 7: Production Deployment**

### **Website Environment Variables:**
Add to your website's `.env.local`:
```bash
# Replace n8n URL with AgentHub
VITE_AGENTHUB_API_URL=https://your-agenthub-domain.com
# or for development:
VITE_AGENTHUB_API_URL=http://localhost:5000

# Optional: API key for authenticated requests
VITE_AGENTHUB_API_KEY=your-api-key-if-needed
```

### **Update production URLs:**
- Change `http://localhost:5000` to your deployed AgentHub URL
- Update n8n callback URLs to point to production AgentHub
- Ensure CORS allows your website domain

## ✅ **Migration Benefits**

After migration, you'll have:

1. **✅ Centralized Management**: All agents in AgentHub dashboard
2. **✅ Conversation Memory**: Persistent across sessions
3. **✅ Analytics**: Response times, success rates, costs
4. **✅ Lead Tracking**: Qualified leads automatically identified
5. **✅ A/B Testing**: Test different prompts and configurations
6. **✅ Real-time Monitoring**: See agent performance live
7. **✅ Scalability**: Add more agents easily

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **CORS errors**: Update AgentHub CORS to allow your website domain
2. **Webhook failures**: Verify HMAC secret matches between AgentHub and n8n
3. **Timeout errors**: Increase polling timeout or add WebSocket support
4. **Memory issues**: Check conversation history is being stored correctly

### **Debug Steps:**
1. Check AgentHub logs in terminal
2. Verify n8n execution logs
3. Check browser network tab for failed requests
4. Test with curl/Postman before integrating website

Your agent will now be managed through AgentHub while leveraging n8n's powerful integrations! 🚀
