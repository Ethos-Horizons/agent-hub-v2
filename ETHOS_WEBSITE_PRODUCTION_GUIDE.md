# 🚀 Ethos Digital Website - Production Deployment & AgentHub Integration

**Context**: You are working on the Ethos Digital website repository. This guide covers production hardening, AgentHub integration, and deployment for the React + Vite + Express.js + PostgreSQL website.

## 📋 **Current Website Analysis**

Based on the [repository structure](https://github.com/Ethos-Horizons/Ethos-Horizons-Website):

**Tech Stack:**
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + PostgreSQL + Drizzle ORM  
- **Architecture**: Client/Server separation with shared types
- **Current Features**: Contact forms, blog CMS, portfolio management, animated backgrounds

**Current Chatbot**: Direct n8n integration (needs to be replaced with AgentHub)

## 🔧 **Part 1: Production Security Hardening**

### **1.1 Environment Configuration & Validation**

Create `shared/env.ts` for strict environment validation:

```typescript
import { z } from 'zod';

// Client-side environment (safe for browser)
const clientEnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'VITE_SUPABASE_ANON_KEY is required'),
  VITE_AGENTHUB_API_URL: z.string().url('VITE_AGENTHUB_API_URL must be a valid URL'),
  VITE_DOMAIN: z.string().url().optional(),
});

// Server-side environment (never exposed to client)
const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  AGENTHUB_API_URL: z.string().url('AGENTHUB_API_URL is required'),
  AGENTHUB_TENANT_ID: z.string().uuid('AGENTHUB_TENANT_ID must be a UUID'),
  HMAC_WEBHOOK_SECRET: z.string().min(32, 'HMAC_WEBHOOK_SECRET must be at least 32 characters'),
  DATABASE_URL: z.string().url('DATABASE_URL is required'),
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  
  // Email configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

// Validate and export client environment
export const clientEnv = (() => {
  if (typeof window === 'undefined') return {} as any; // Server-side, skip client validation
  
  try {
    return clientEnvSchema.parse({
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_AGENTHUB_API_URL: import.meta.env.VITE_AGENTHUB_API_URL,
      VITE_DOMAIN: import.meta.env.VITE_DOMAIN,
    });
  } catch (error) {
    console.error('❌ Invalid client environment variables:', error);
    throw new Error('Client environment validation failed');
  }
})();

// Server-only environment validation
export const getServerEnv = () => {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() can only be called on the server');
  }
  
  try {
    return serverEnvSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid server environment variables:', error);
    process.exit(1);
  }
};

export type ClientEnv = typeof clientEnv;
export type ServerEnv = ReturnType<typeof getServerEnv>;
```

### **1.2 Security Headers & CORS**

Update `vite.config.ts` for security headers:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Security headers for development
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    }
  },
  
  // Build optimizations
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    }
  }
});
```

Create `server/middleware/security.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY'); 
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HSTS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // CSP
  const csp = [
    "default-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://your-agenthub-domain.com",
    "img-src 'self' data: https: blob:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Vite dev requires unsafe-eval
    "font-src 'self' data:",
    "frame-ancestors 'none'",
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  
  next();
}

// CORS configuration
export function corsConfig() {
  const allowedOrigins = {
    development: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
    ],
    staging: [
      'https://staging.ethosdigital.com',
    ],
    production: [
      'https://ethosdigital.com',
      'https://www.ethosdigital.com'
    ]
  };
  
  const env = process.env.NODE_ENV || 'development';
  return allowedOrigins[env] || allowedOrigins.development;
}
```

### **1.3 Rate Limiting**

Create `server/middleware/rateLimit.ts`:

```typescript
import rateLimit from 'express-rate-limit';

// Contact form rate limiting
export const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 submissions per 15 minutes per IP
  message: {
    error: 'Too many contact form submissions. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Chatbot rate limiting  
export const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute per IP
  message: {
    error: 'Too many chat messages. Please slow down.',
  },
});

// General API rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: {
    error: 'Too many requests. Please try again later.',
  },
});

// Newsletter signup rate limiting
export const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 signups per hour per IP
  message: {
    error: 'Too many newsletter signups. Please try again later.',
  },
});
```

### **1.4 API Response Helpers**

Create `server/utils/apiResponse.ts`:

```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(error: string, statusCode?: number): { response: ApiResponse; statusCode: number } {
  return {
    response: {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    },
    statusCode: statusCode || 500
  };
}

export function validationErrorResponse(errors: any[]): { response: ApiResponse; statusCode: number } {
  return {
    response: {
      success: false,
      error: 'Validation failed',
      data: errors,
      timestamp: new Date().toISOString(),
    },
    statusCode: 400
  };
}
```

## 🔗 **Part 2: AgentHub Integration**

### **2.1 Replace Direct n8n Integration**

**Find your current chatbot component** (likely in `client/src/components/` or similar):

**BEFORE (Direct n8n):**
```typescript
// Remove this old integration
const sendMessage = async (message: string) => {
  const response = await fetch('your-n8n-webhook-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  // Handle direct response
};
```

**AFTER (AgentHub Integration):**

Create `client/src/services/agentHub.ts`:

```typescript
import { clientEnv } from '../../shared/env';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export interface ConversationResponse {
  id: string;
  message: string;
  session_id: string;
  status: 'processing' | 'completed' | 'error';
  metadata?: {
    response_time_ms?: number;
    tokens_used?: number;
    cost_usd?: number;
  };
}

class AgentHubService {
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }
  
  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
  }
  
  async sendMessage(message: string): Promise<ConversationResponse> {
    try {
      const response = await fetch(`${clientEnv.VITE_AGENTHUB_API_URL}/api/v1/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add tenant ID if using multi-tenancy
          // 'X-Tenant-ID': 'your-tenant-id'
        },
        body: JSON.stringify({
          message,
          session_id: this.sessionId,
          context: {
            page: window.location.pathname,
            user_agent: navigator.userAgent,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // If processing, poll for completion
      if (data.status === 'processing') {
        return await this.pollForCompletion(data.id);
      }
      
      return data;
      
    } catch (error) {
      console.error('AgentHub API error:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  }
  
  private async pollForCompletion(conversationId: string): Promise<ConversationResponse> {
    const maxAttempts = 30; // 60 seconds total
    const pollInterval = 2000; // 2 seconds
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      try {
        const response = await fetch(
          `${clientEnv.VITE_AGENTHUB_API_URL}/api/v1/conversation/${conversationId}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'completed' || data.status === 'error') {
          return data;
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        // Continue polling on error
      }
    }
    
    // Timeout fallback
    return {
      id: conversationId,
      message: 'Response is taking longer than expected. Please try again.',
      session_id: this.sessionId,
      status: 'error'
    };
  }
  
  // Get conversation history
  async getConversationHistory(): Promise<ChatMessage[]> {
    try {
      const response = await fetch(
        `${clientEnv.VITE_AGENTHUB_API_URL}/api/v1/conversations?session_id=${this.sessionId}`
      );
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.messages || [];
      
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      return [];
    }
  }
}

export const agentHubService = new AgentHubService();
```

**Update your chatbot component:**

```typescript
import React, { useState, useEffect } from 'react';
import { agentHubService, ChatMessage } from '../services/agentHub';

export function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Load conversation history on mount
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await agentHubService.getConversationHistory();
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await agentHubService.sendMessage(inputMessage);
      
      const assistantMessage: ChatMessage = {
        id: response.id,
        content: response.message,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Your existing chatbot UI */}
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            {message.content}
          </div>
        ))}
        {isTyping && (
          <div className="message assistant typing">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>
      
      <div className="input-area">
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          disabled={isLoading}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
```

### **2.2 Backend Contact Form Integration**

Update your contact form handler to optionally integrate with AgentHub:

Create `server/services/agentHub.ts`:

```typescript
import { getServerEnv } from '../../shared/env';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
}

export async function notifyAgentHubOfContact(formData: ContactFormData) {
  try {
    const env = getServerEnv();
    
    const response = await fetch(`${env.AGENTHUB_API_URL}/api/v1/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': env.AGENTHUB_TENANT_ID,
      },
      body: JSON.stringify({
        message: `New contact form submission:\n\nName: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company || 'Not provided'}\nPhone: ${formData.phone || 'Not provided'}\n\nMessage: ${formData.message}`,
        session_id: `contact-form-${Date.now()}`,
        user_id: formData.email,
        context: {
          type: 'contact_form',
          source: 'website',
          timestamp: new Date().toISOString()
        }
      })
    });
    
    if (!response.ok) {
      console.error('Failed to notify AgentHub:', response.statusText);
    }
    
  } catch (error) {
    console.error('AgentHub notification error:', error);
    // Don't fail the contact form if AgentHub is down
  }
}
```

## 🏗️ **Part 3: Production Deployment**

### **3.1 Environment Variables Setup**

Create comprehensive `.env.example`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AgentHub Integration
AGENTHUB_API_URL=https://your-agenthub-domain.com
AGENTHUB_TENANT_ID=your-tenant-uuid
HMAC_WEBHOOK_SECRET=your-32-char-secret

# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend (VITE_ prefix required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_AGENTHUB_API_URL=https://your-agenthub-domain.com
VITE_DOMAIN=https://ethosdigital.com

# Email Configuration (for contact forms)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

### **3.2 Build Configuration**

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "cd client && vite",
    "dev:server": "cd server && tsx watch index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && vite build",
    "build:server": "cd server && tsc",
    "start": "cd server && node dist/index.js",
    "typecheck": "cd client && tsc --noEmit && cd ../server && tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "test": "vitest",
    "preview": "cd client && vite preview"
  }
}
```

### **3.3 Performance Optimizations**

Update `client/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'utils': ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    },
    // Enable source maps for debugging
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@radix-ui/react-dialog']
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@shared': resolve(__dirname, '../shared')
    }
  }
});
```

### **3.4 SEO & Meta Tags**

Create `client/src/components/SEO.tsx`:

```typescript
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export function SEO({ 
  title = 'Ethos Digital - Premier Digital Marketing Agency',
  description = 'Transform your business with data-driven digital marketing strategies. SEO, PPC, web development, and social media management services.',
  image = '/og-image.jpg',
  url = 'https://ethosdigital.com',
  type = 'website'
}: SEOProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
```

## 🚢 **Part 4: Deployment Options**

### **4.1 Vercel (Recommended for Full-Stack)**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "client/dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/server/dist/index.js"
    },
    {
      "source": "/((?!api).*)",
      "destination": "/client/dist/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### **4.2 Railway (Alternative Full-Stack)**

Create `railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

[[services]]
name = "web"
source = "."

[services.web]
variables = { NODE_ENV = "production" }
```

## 🎯 **Part 5: Testing & Quality Assurance**

### **5.1 Pre-Deploy Checklist**

```bash
# 1. Environment validation
npm run typecheck

# 2. Build verification  
npm run build

# 3. Security check
npm audit --audit-level moderate

# 4. Performance test
npm run preview
# Check Lighthouse scores

# 5. Integration test
# Test contact form → email delivery
# Test chatbot → AgentHub → response

# 6. Cross-browser testing
# Chrome, Firefox, Safari, Edge
# Mobile responsive design

# 7. SEO verification
# Check meta tags with React Helmet
# Verify structured data
# Test social media previews
```

### **5.2 Monitoring Setup**

Add error boundary and analytics:

```typescript
// client/src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    
    // Send to monitoring service in production
    if (import.meta.env.PROD) {
      // Example: Sentry, LogRocket, etc.
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">We're sorry for the inconvenience.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## ✅ **Success Criteria**

After implementing this guide:

- ✅ **Security**: No secrets in client bundle, HTTPS enforced, headers configured
- ✅ **Performance**: <3s load time, optimized images, proper caching  
- ✅ **SEO**: Dynamic meta tags, sitemap, structured data
- ✅ **Integration**: Chatbot successfully calls AgentHub API
- ✅ **Monitoring**: Error tracking, analytics, structured logs
- ✅ **UX**: Loading states, error handling, mobile responsive

## 🔄 **AgentHub Integration Benefits**

Once fully integrated:

- ✅ **Centralized Management**: Control all agents from AgentHub dashboard
- ✅ **Advanced Analytics**: Conversation metrics, lead scoring, performance tracking
- ✅ **Persistent Memory**: Conversations continue across sessions
- ✅ **A/B Testing**: Test different agent configurations
- ✅ **Real-time Monitoring**: See agent health and performance live
- ✅ **Lead Intelligence**: Automatic lead qualification and routing

Your Ethos Digital website will be production-ready with enterprise-grade agent management! 🚀
