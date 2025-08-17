# n8n Webhook Security Setup

## 🔐 **HMAC Webhook Secret**

The `HMAC_WEBHOOK_SECRET` provides **security** for webhooks between n8n and AgentHub.

### **How It Works:**
1. **n8n** signs webhook payloads with the secret
2. **AgentHub** verifies the signature before processing
3. **Prevents** unauthorized webhook calls

## 🔧 **n8n Configuration**

### **Step 1: Add HTTP Request Node**
In your n8n workflow, when calling AgentHub:

```javascript
// HTTP Request Node Settings
URL: http://localhost:5000/api/v1/webhooks/n8n
Method: POST
Headers:
{
  "Content-Type": "application/json",
  "X-Signature": "{{ $crypto.hmacSha256($json, 'YOUR_HMAC_SECRET').toString('base64') }}"
}
```

### **Step 2: Use Your Secret**
Replace `YOUR_HMAC_SECRET` with your actual secret:
```
c9c2f907335a526b2f93954aa635f4dc4f65f7fd52c0081ba515ed8790235f45
```

### **Step 3: Example n8n Workflow**
```javascript
// In your HTTP Request node:
{
  "headers": {
    "Content-Type": "application/json",
    "X-Signature": "sha256={{ $crypto.hmacSha256(JSON.stringify($json), 'c9c2f907335a526b2f93954aa635f4dc4f65f7fd52c0081ba515ed8790235f45') }}"
  },
  "body": {
    "type": "conversation_complete",
    "runId": "{{ $('previous_node').item.json.runId }}",
    "result": "{{ $json }}"
  }
}
```

## 🛡️ **Security Benefits**

- ✅ **Verification**: Only signed requests are processed
- ✅ **Integrity**: Payload tampering is detected
- ✅ **Authentication**: Confirms requests come from your n8n
- ✅ **Protection**: Prevents malicious webhook calls

## 📝 **AgentHub Side (Already Implemented)**

The verification happens automatically in:
- **Endpoint**: `/api/v1/webhooks/n8n`
- **Verification**: `src/lib/webhook-security.ts`
- **Response**: Returns `401 Unauthorized` for invalid signatures

## 🔄 **Workflow Integration**

When your n8n agent completes:
1. **Agent finishes** processing in n8n
2. **n8n sends** signed webhook to AgentHub
3. **AgentHub verifies** signature and processes result
4. **AgentHub updates** database and notifies frontend
5. **User sees** completed response in real-time

No manual setup needed in AgentHub - it's all automatic! 🚀
