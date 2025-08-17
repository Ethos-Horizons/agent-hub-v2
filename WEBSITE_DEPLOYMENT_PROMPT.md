# 🚀 Website Production Deployment - Cursor AI Prompt

**Context**: You are helping deploy a business website with a CMS and chatbot that integrates with AgentHub. The website needs production-hardening similar to what was done for AgentHub.

## 📋 **Current Setup Assessment**

**Website Stack**: [Please confirm your current tech stack]
- Frontend: Next.js/React? (please specify)
- CMS: Supabase-based CRUD operations
- Chatbot: Currently direct to n8n, will integrate with AgentHub
- Database: Supabase (separate project from AgentHub)

## 🔧 **Production Readiness Implementation**

### **1. Environment & Security**

```bash
# Implement strict environment validation using Zod
# Create src/config/env.ts with client/server separation

# Required Environment Variables:
NEXT_PUBLIC_SUPABASE_URL=https://your-website-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-website-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-website-service-key  # SERVER ONLY
AGENTHUB_API_URL=https://your-agenthub-domain.com   # or http://localhost:5000 for dev
AGENTHUB_API_KEY=your-api-key                       # for authenticated AgentHub calls
HMAC_WEBHOOK_SECRET=matching-secret-from-agenthub   # same as AgentHub
NEXT_PUBLIC_DOMAIN=https://yourdomain.com
```

### **2. Security Headers & CORS**

```javascript
// next.config.js - Add security headers
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        // HSTS for production
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        // CSP - adjust based on your needs
        { 
          key: 'Content-Security-Policy', 
          value: "default-src 'self'; connect-src 'self' https://*.supabase.co https://your-agenthub-domain.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
        }
      ]
    }
  ];
}
```

### **3. Rate Limiting**

```bash
# Implement rate limiting for:
- Contact forms (5 submissions per 15 minutes per IP)
- Chatbot interactions (60 messages per minute per user)
- Newsletter signups (3 per hour per IP)
- CMS API endpoints (100 requests per 15 minutes per user)
```

### **4. API Versioning & Error Handling**

```bash
# Move API routes to versioned structure:
/pages/api/v1/contact/route.ts
/pages/api/v1/newsletter/route.ts  
/pages/api/v1/cms/[...slug]/route.ts
/pages/api/v1/chatbot/route.ts
/pages/api/health/route.ts

# Implement consistent error responses:
{ success: boolean, data?: any, error?: string, timestamp: string }
```

### **5. AgentHub Integration Update**

```typescript
// Update chatbot integration to call AgentHub instead of n8n directly
const response = await fetch(`${process.env.AGENTHUB_API_URL}/api/v1/conversation`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.AGENTHUB_API_KEY}`, // if using API keys
    'X-Tenant-ID': 'your-tenant-id' // for multi-tenancy
  },
  body: JSON.stringify({
    message: userMessage,
    sessionId: sessionId,
    context: conversationContext
  })
});

// Poll for completion:
const result = await fetch(`${process.env.AGENTHUB_API_URL}/api/v1/conversation/${conversationId}`);
```

### **6. Performance & Monitoring**

```bash
# Add performance monitoring:
- Implement loading states for all async operations
- Add error boundaries for React components  
- Set up Vercel Analytics or Google Analytics
- Add structured logging with request IDs
- Implement proper caching headers for static assets
```

### **7. SEO & Meta Tags**

```typescript
// Implement dynamic meta tags for portfolio/blog:
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.featured_image],
      url: `https://yourdomain.com/blog/${params.slug}`
    }
  };
}
```

### **8. Database Security (Supabase)**

```sql
-- Ensure RLS is enabled on all CMS tables:
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Public read access for published content:
CREATE POLICY "Public can read published posts" ON blog_posts 
FOR SELECT USING (status = 'published');

-- Admin-only write access:
CREATE POLICY "Admins can manage content" ON blog_posts 
FOR ALL USING (auth.jwt() ->> 'email' IN ('your-email@gmail.com', 'partner-email@gmail.com'));
```

### **9. Deployment Configuration**

```bash
# Vercel deployment (recommended):
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure custom domain with SSL
4. Set up redirects in vercel.json if needed

# Build optimization:
- Enable Next.js compression
- Optimize images with next/image
- Implement lazy loading for blog/portfolio content
- Add sitemap.xml generation
```

### **10. Error Monitoring & Logging**

```typescript
// Add error boundary and logging:
if (typeof window !== 'undefined') {
  window.onerror = (msg, url, line, col, error) => {
    console.error('Global error:', { msg, url, line, col, error });
    // Send to monitoring service
  };
}
```

## 🔍 **Pre-Deploy Checklist**

```bash
# Run these checks before deploying:
1. npm run build                    # Verify build succeeds
2. npm run lint                     # Check code quality  
3. npm run typecheck               # Verify TypeScript
4. Test contact forms              # Verify email delivery
5. Test chatbot → AgentHub         # Verify agent integration
6. Check all meta tags             # SEO verification
7. Verify SSL certificate         # HTTPS setup
8. Test CMS functionality          # CRUD operations
9. Check loading performance       # Lighthouse audit
10. Test on mobile devices        # Responsive design
```

## 🚨 **Critical Security Notes**

1. **Never commit** `.env.local` or `.env.production` to Git
2. **Service role keys** must ONLY be used server-side
3. **Validate all user inputs** before database operations
4. **Sanitize HTML** in CMS content to prevent XSS
5. **Rate limit** all public endpoints
6. **Enable HTTPS** redirect in production
7. **Regular security updates** for all dependencies

## 🎯 **Success Criteria**

✅ **Security**: No secrets in client bundle, HTTPS enforced, CORS configured  
✅ **Performance**: <3s load time, optimized images, proper caching  
✅ **SEO**: Meta tags, sitemap, structured data for portfolio/blog  
✅ **Integration**: Chatbot successfully calls AgentHub API  
✅ **Monitoring**: Error tracking, analytics, structured logs  
✅ **UX**: Loading states, error handling, mobile responsive  

## 🔄 **AgentHub Integration Benefits**

Once integrated with AgentHub:
- ✅ **Centralized agent management** for you and your partner
- ✅ **Advanced analytics** on conversation performance  
- ✅ **A/B testing** different agent configurations
- ✅ **Real-time monitoring** of agent health
- ✅ **Webhook security** with HMAC verification
- ✅ **Conversation persistence** and memory management

---

**Note**: This prompt assumes a Next.js-based website. Adjust framework-specific details based on your actual tech stack.
