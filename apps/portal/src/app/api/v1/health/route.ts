import { NextRequest } from 'next/server';
import { ok, unauthorized } from '@/lib/api-response';
import { createClient } from '@/lib/supabase/server';

// Authenticated health check
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return unauthorized('Authentication required for detailed health check');
    }
    
    // Test database connectivity
    const { error: dbError } = await supabase
      .from('orgs')
      .select('id')
      .limit(1);
    
    return ok({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      database: dbError ? 'error' : 'connected',
      user: user.id,
    });
  } catch (error) {
    return ok({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
}
